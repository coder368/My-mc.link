import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import net from 'node:net';
import dns from 'node:dns';
import { ServerLogManager } from './src/server/serverLogs';

let knownOnlinePlayers = new Set<string>();
let isInitialSlpPoll = true;

function pingMinecraftSLP(host: string, port: number, timeout = 3500): Promise<any> {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host, port, timeout });
    let buffer = Buffer.alloc(0);
    let resolved = false;

    socket.on('connect', () => {
      const hostBuf = Buffer.from(host, 'utf8');
      const portBuf = Buffer.alloc(2);
      portBuf.writeUInt16BE(port, 0);

      // Packet: Handshake (id 0x00, protocol 4, host len + host, port, next state 1)
      const protocolBuf = Buffer.from([0x04]);
      const stateBuf = Buffer.from([0x01]);
      const hostLenBuf = Buffer.from([hostBuf.length]);
      const packetIdBuf = Buffer.from([0x00]);

      const handshakeData = Buffer.concat([packetIdBuf, protocolBuf, hostLenBuf, hostBuf, portBuf, stateBuf]);
      const handshakePacket = Buffer.concat([Buffer.from([handshakeData.length]), handshakeData]);
      const requestPacket = Buffer.from([0x01, 0x00]);

      socket.write(Buffer.concat([handshakePacket, requestPacket]));
    });

    socket.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      const str = buffer.toString('utf8');
      const jsonStart = str.indexOf('{');
      if (jsonStart !== -1) {
        const jsonEnd = str.lastIndexOf('}');
        if (jsonEnd !== -1 && jsonEnd > jsonStart) {
          try {
            const jsonStr = str.substring(jsonStart, jsonEnd + 1);
            const parsed = JSON.parse(jsonStr);
            resolved = true;
            socket.destroy();
            resolve(parsed);
          } catch {
            // Wait for more chunks
          }
        }
      }
    });

    socket.on('timeout', () => {
      socket.destroy();
      if (!resolved) reject(new Error('Socket timeout'));
    });

    socket.on('error', (err) => {
      if (!resolved) reject(err);
    });

    socket.on('close', () => {
      if (!resolved) reject(new Error('Socket closed without response'));
    });
  });
}

function serverStatusPlugin(): Plugin {
  return {
    name: 'server-status-api',
    configureServer(server) {
      server.middlewares.use('/api/server-status', async (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405;
          res.end('Method Not Allowed');
          return;
        }

        const parsedUrl = new URL(req.url || '', 'http://localhost');
        let host = parsedUrl.searchParams.get('host') || 'my-mc.link';
        let port = parseInt(parsedUrl.searchParams.get('port') || '', 10);

        if (host.includes(':')) {
          const parts = host.split(':');
          host = parts[0];
          if (!port && parts[1]) {
            port = parseInt(parts[1], 10);
          }
        }

        // Known port & SRV lookups for configured realms
        if (host === 'my-mc.link' && (!port || port === 25565)) {
          port = 40891;
        } else if (host === 'rcesc.playwithbao.com' && (!port || port === 25565)) {
          port = 32086;
        } else if (!port) {
          port = 25565;
        }

        // Try SRV resolution if port is 25565
        if (port === 25565) {
          try {
            const srvRecords = await dns.promises.resolveSrv(`_minecraft._tcp.${host}`);
            if (srvRecords && srvRecords.length > 0) {
              port = srvRecords[0].port;
              if (srvRecords[0].name) {
                host = srvRecords[0].name;
              }
            }
          } catch {
            // No SRV record found, continue with A record
          }
        }

        const startTime = Date.now();

        // 1. Direct Minecraft SLP protocol ping
        try {
          const slpResult = await pingMinecraftSLP(host, port, 4000);
          const latency = Date.now() - startTime;

          let motdClean = 'A Minecraft Server';
          if (slpResult.description) {
            if (typeof slpResult.description === 'string') {
              motdClean = slpResult.description;
            } else if (typeof slpResult.description.text === 'string') {
              motdClean = slpResult.description.text;
              if (Array.isArray(slpResult.description.extra)) {
                motdClean += slpResult.description.extra
                  .map((e: any) => (typeof e === 'string' ? e : e?.text || ''))
                  .join('');
              }
            }
          }

          const playersList: Array<{ name: string; uuid?: string }> = [];
          if (Array.isArray(slpResult.players?.sample)) {
            slpResult.players.sample.forEach((p: any) => {
              if (p?.name) {
                playersList.push({
                  name: p.name,
                  uuid: p.id || p.uuid || p.name,
                });
              }
            });
          }

          const payload = {
            isOnline: true,
            motdClean: motdClean.trim() || 'A Minecraft Server',
            playersOnline: slpResult.players?.online ?? 0,
            maxPlayers: slpResult.players?.max ?? 20,
            playersList,
            version: slpResult.version?.name || '1.21.11',
            pingMs: latency,
            provider: 'direct-slp',
          };

          // Track joins/leaves between polls
          try {
            const currentNames = new Set(playersList.map((p: any) => p.name));
            if (!isInitialSlpPoll) {
              for (const name of currentNames) {
                if (!knownOnlinePlayers.has(name)) {
                  ServerLogManager.logPlayerJoin(name);
                }
              }
              for (const name of knownOnlinePlayers) {
                if (!currentNames.has(name)) {
                  ServerLogManager.logPlayerLeave(name);
                }
              }
            } else {
              isInitialSlpPoll = false;
            }
            knownOnlinePlayers = currentNames;
          } catch {}

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(payload));
          return;
        } catch {
          // Direct probe failed, try fallback
        }

        // 2. Fallback to mcstatus.io
        try {
          const publicRes = await fetch(
            `https://api.mcstatus.io/v2/status/java/${encodeURIComponent(host + ':' + port)}`
          );
          if (publicRes.ok) {
            const data = await publicRes.json();
            if (data.online) {
              const payload = {
                isOnline: true,
                motdClean: data.motd?.clean || 'A Minecraft Server',
                playersOnline: data.players?.online ?? 0,
                maxPlayers: data.players?.max ?? 20,
                playersList: (data.players?.list || []).map((p: any) => ({
                  name: typeof p === 'string' ? p : p.name_clean || p.name,
                  uuid: typeof p === 'object' ? p.uuid : p,
                })),
                version: data.version?.name_clean || data.version?.name_raw || '1.21.11',
                pingMs: Date.now() - startTime,
                provider: 'mcstatus.io',
              };
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(payload));
              return;
            }
          }
        } catch {}

        // 3. Fallback to minetools
        try {
          const mtRes = await fetch(
            `https://api.minetools.eu/ping/${encodeURIComponent(host)}/${port}`
          );
          if (mtRes.ok) {
            const mtData = await mtRes.json();
            if (!mtData.error) {
              const payload = {
                isOnline: true,
                motdClean: typeof mtData.description === 'string' ? mtData.description : 'A Minecraft Server',
                playersOnline: mtData.players?.online ?? 0,
                maxPlayers: mtData.players?.max ?? 20,
                playersList: (mtData.players?.sample || []).map((p: any) => ({
                  name: p.name,
                  uuid: p.id,
                })),
                version: mtData.version?.name || '1.21.11',
                pingMs: Math.round(mtData.latency || 50),
                provider: 'minetools',
              };
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(payload));
              return;
            }
          }
        } catch {}

        // 4. Offline response
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            isOnline: false,
            motdClean: 'Server unreachable or offline',
            playersOnline: 0,
            maxPlayers: 20,
            playersList: [],
            version: '1.21.11',
            pingMs: 0,
          })
        );
      });

      // API endpoint: /api/server-logs
      server.middlewares.use('/api/server-logs', async (req, res) => {
        if (req.method === 'DELETE') {
          ServerLogManager.clearLogs();
          knownOnlinePlayers.clear();
          isInitialSlpPoll = true;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, message: 'Logs cleared successfully' }));
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const data = JSON.parse(body || '{}');
              if (data.action === 'clear') {
                ServerLogManager.clearLogs();
                knownOnlinePlayers.clear();
                isInitialSlpPoll = true;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true }));
                return;
              }
              if (data.rawLog) {
                ServerLogManager.appendLogLine(data.rawLog);
              }
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } catch {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid JSON request' }));
            }
          });
          return;
        }

        if (req.method !== 'GET') {
          res.statusCode = 405;
          res.end('Method Not Allowed');
          return;
        }

        const parsedUrl = new URL(req.url || '', 'http://localhost');
        const limit = parseInt(parsedUrl.searchParams.get('limit') || '50', 10);
        const filter = parsedUrl.searchParams.get('filter') as 'join' | 'leave' | 'all' | undefined;
        const search = parsedUrl.searchParams.get('search') || undefined;

        const result = ServerLogManager.fetchLogs(limit, filter, search);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(result));
      });
    },
  };
}

export default defineConfig(() => {
  return {
    base: process.env.VITE_BASE_PATH || (process.env.GITHUB_ACTIONS === 'true' ? '/My-mc.link/' : '/'),
    plugins: [react(), tailwindcss(), serverStatusPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify - file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
