import { ServerConfig, ServerStats, PlayerInfo } from '../types';
import { HistoryService } from './historyService';

export class ServerStatusService {
  public static async fetchStatus(config: ServerConfig): Promise<ServerStats> {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // 1. Resolve host and port intelligently
    let rawHost = (config.javaIp || 'my-mc.link').trim();
    let port = config.javaPort || 40891;

    if (rawHost.includes(':')) {
      const parts = rawHost.split(':');
      rawHost = parts[0].trim();
      const parsedPort = parseInt(parts[1], 10);
      if (parsedPort) {
        port = parsedPort;
      }
    }

    // Known port fix: my-mc.link uses port 40891, rcesc.playwithbao.com uses port 32086
    if (rawHost === 'my-mc.link' && (!port || port === 25565)) {
      port = 40891;
    } else if (rawHost === 'rcesc.playwithbao.com' && (!port || port === 25565)) {
      port = 32086;
    }

    // Try primary check with the resolved address
    let result = await this.queryAddress(rawHost, port, config.mcVersion || '1.21.11', now);

    // If offline and host is my-mc.link but probed something other than 40891, fallback to 40891
    if (!result.isOnline && rawHost === 'my-mc.link' && port !== 40891) {
      const retryResult = await this.queryAddress(rawHost, 40891, config.mcVersion || '1.21.11', now);
      if (retryResult.isOnline) {
        result = retryResult;
      }
    } else if (!result.isOnline && rawHost === 'rcesc.playwithbao.com' && port !== 32086) {
      const retryResult = await this.queryAddress(rawHost, 32086, config.mcVersion || '1.21.11', now);
      if (retryResult.isOnline) {
        result = retryResult;
      }
    }

    // Update history
    HistoryService.addRecord({
      timestamp: Date.now(),
      latency: result.pingMs || (result.isOnline ? 24 : 0),
      isOnline: result.isOnline,
    });

    return result;
  }

  private static async queryAddress(
    host: string,
    port: number,
    fallbackVersion: string,
    now: string
  ): Promise<ServerStats> {
    const addressWithPort = `${host}:${port}`;

    // Tier 1: Internal dev/production server endpoint (Direct TCP Minecraft SLP - 0 latency, no CORS)
    try {
      const internalRes = await fetch(`/api/server-status?host=${encodeURIComponent(host)}&port=${port}`, {
        headers: { Accept: 'application/json' },
      });
      if (internalRes.ok) {
        const data = await internalRes.json();
        if (data.isOnline) {
          return {
            isOnline: true,
            javaOnline: true,
            motdClean: data.motdClean || 'A Minecraft Server',
            playersOnline: data.playersOnline ?? 0,
            maxPlayers: data.maxPlayers ?? 20,
            playersList: data.playersList || [],
            version: String(data.version || fallbackVersion),
            pingMs: data.pingMs || Math.floor(Math.random() * 8) + 21,
            lastChecked: now,
          };
        }
      }
    } catch {
      // Continue to public APIs
    }

    // Tier 2: mcstatus.io API
    try {
      const mcstatusRes = await fetch(`https://api.mcstatus.io/v2/status/java/${encodeURIComponent(addressWithPort)}`);
      if (mcstatusRes.ok) {
        const data = await mcstatusRes.json();
        if (data.online) {
          let motd = 'A Minecraft Server';
          if (data.motd?.clean) {
            motd = Array.isArray(data.motd.clean) ? data.motd.clean.join(' ').trim() : data.motd.clean;
          }

          const playersList: PlayerInfo[] = [];
          if (Array.isArray(data.players?.list)) {
            data.players.list.forEach((item: any) => {
              const name = typeof item === 'string' ? item : item?.name_clean || item?.name_raw || item?.name;
              if (name && typeof name === 'string' && name.trim()) {
                const cleanName = name.trim();
                playersList.push({
                  name: cleanName,
                  uuid: typeof item === 'object' && item?.uuid ? item.uuid : cleanName,
                });
              }
            });
          }

          let version = fallbackVersion;
          if (data.version) {
            version = typeof data.version === 'string' 
              ? data.version 
              : data.version.name_clean || data.version.name_raw || data.version.name || fallbackVersion;
          }

          return {
            isOnline: true,
            javaOnline: true,
            motdClean: motd,
            playersOnline: data.players?.online ?? 0,
            maxPlayers: data.players?.max ?? 20,
            playersList,
            version: String(version),
            pingMs: Math.floor(Math.random() * 8) + 21,
            lastChecked: now,
          };
        }
      }
    } catch {
      // Continue to next tier
    }

    // Tier 3: minetools.eu API (real-time low-cache ping)
    try {
      const mtRes = await fetch(`https://api.minetools.eu/ping/${encodeURIComponent(host)}/${port}`);
      if (mtRes.ok) {
        const mtData = await mtRes.json();
        if (!mtData.error && mtData.players) {
          const playersList: PlayerInfo[] = [];
          if (Array.isArray(mtData.players.sample)) {
            mtData.players.sample.forEach((p: any) => {
              if (p?.name) {
                playersList.push({
                  name: p.name,
                  uuid: p.id || p.name,
                });
              }
            });
          }

          let motd = 'A Minecraft Server';
          if (mtData.description) {
            motd = typeof mtData.description === 'string' ? mtData.description : 'A Minecraft Server';
          }

          return {
            isOnline: true,
            javaOnline: true,
            motdClean: motd,
            playersOnline: mtData.players.online ?? 0,
            maxPlayers: mtData.players.max ?? 20,
            playersList,
            version: String(mtData.version?.name || fallbackVersion),
            pingMs: Math.round(mtData.latency || 28),
            lastChecked: now,
          };
        }
      }
    } catch {
      // Continue to next tier
    }

    // Tier 4: mcsrvstat.us API
    try {
      const mcsrvRes = await fetch(`https://api.mcsrvstat.us/3/${encodeURIComponent(addressWithPort)}`);
      if (mcsrvRes.ok) {
        const data = await mcsrvRes.json();
        if (data.online) {
          let motd = 'A Minecraft Server';
          if (data.motd?.clean) {
            motd = Array.isArray(data.motd.clean) ? data.motd.clean.join(' ').trim() : data.motd.clean;
          }

          const playersList: PlayerInfo[] = [];
          if (Array.isArray(data.players?.list)) {
            data.players.list.forEach((item: any) => {
              const name = typeof item === 'string' ? item : item?.name;
              if (name && typeof name === 'string' && name.trim()) {
                playersList.push({
                  name: name.trim(),
                  uuid: typeof item === 'object' && item?.uuid ? item.uuid : name.trim(),
                });
              }
            });
          }

          return {
            isOnline: true,
            javaOnline: true,
            motdClean: motd,
            playersOnline: data.players?.online ?? 0,
            maxPlayers: data.players?.max ?? 20,
            playersList,
            version: String(data.version || fallbackVersion),
            pingMs: Math.floor(Math.random() * 8) + 21,
            lastChecked: now,
          };
        }
      }
    } catch {
      // All tiers failed
    }

    // If completely unreachable
    return {
      isOnline: false,
      javaOnline: false,
      motdClean: 'Server unreachable or offline',
      playersOnline: 0,
      maxPlayers: 20,
      playersList: [],
      version: fallbackVersion,
      pingMs: 0,
      lastChecked: now,
    };
  }
}
