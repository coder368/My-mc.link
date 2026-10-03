import fs from 'node:fs';
import path from 'node:path';
import { PlayerLogEvent, ServerLogsResponse } from '../types';

const LOG_FILE_PATH = path.resolve(process.cwd(), 'logs', 'latest.log');

export class ServerLogManager {
  public static getLogFilePath(): string {
    return LOG_FILE_PATH;
  }

  public static appendLogLine(line: string): void {
    try {
      const dir = path.dirname(LOG_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.appendFileSync(LOG_FILE_PATH, line.trim() + '\n', 'utf8');
    } catch (e) {
      console.error('Failed to append to log file:', e);
    }
  }

  public static logPlayerJoin(playerName: string): void {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0]; // HH:mm:ss
    const joinLine = `[${timeStr}] [Server thread/INFO]: ${playerName} joined the game`;
    this.appendLogLine(joinLine);
  }

  public static logPlayerLeave(playerName: string): void {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0]; // HH:mm:ss
    const leaveLine = `[${timeStr}] [Server thread/INFO]: ${playerName} left the game`;
    this.appendLogLine(leaveLine);
  }

  public static clearLogs(): void {
    try {
      if (fs.existsSync(LOG_FILE_PATH)) {
        fs.unlinkSync(LOG_FILE_PATH);
      }
    } catch (e) {
      console.error('Failed to clear log file:', e);
    }
  }

  public static fetchLogs(
    limit = 50,
    filterType?: 'join' | 'leave' | 'all',
    search?: string,
    serverName = 'My-MC SMP'
  ): ServerLogsResponse {
    let rawContent = '';

    try {
      if (fs.existsSync(LOG_FILE_PATH)) {
        rawContent = fs.readFileSync(LOG_FILE_PATH, 'utf8');
      }
    } catch (e) {
      console.error('Failed to read logs/latest.log:', e);
    }

    if (!rawContent.trim()) {
      return {
        success: true,
        serverName,
        logFile: 'logs/latest.log',
        lastUpdated: Date.now(),
        events: [],
        rawLogs: [],
        stats: {
          totalEvents: 0,
          totalJoins: 0,
          totalLeaves: 0,
          uniquePlayers: 0,
        },
      };
    }

    const lines = rawContent.split(/\r?\n/).filter(line => line.trim().length > 0);
    const parsedEvents: PlayerLogEvent[] = [];

    // Join regex: "[HH:mm:ss] [Server thread/INFO]: PlayerName joined the game"
    const joinRegex = /\[(\d{2}:\d{2}:\d{2})\]\s+\[(.*?\/INFO)\]:\s+([A-Za-z0-9_]{3,16})\s+joined the game/i;
    // Leave regex: "[HH:mm:ss] [Server thread/INFO]: PlayerName left the game" or lost connection
    const leaveRegex = /\[(\d{2}:\d{2}:\d{2})\]\s+\[(.*?\/INFO)\]:\s+([A-Za-z0-9_]{3,16})\s+(?:left the game|lost connection.*)/i;

    const today = new Date();

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check join
      const joinMatch = line.match(joinRegex);
      if (joinMatch) {
        const timeStr = joinMatch[1];
        const thread = joinMatch[2];
        const playerName = joinMatch[3];

        const [hh, mm, ss] = timeStr.split(':').map(Number);
        const eventDate = new Date(today);
        eventDate.setHours(hh, mm, ss, 0);

        parsedEvents.push({
          id: `evt-join-${i}-${timeStr}-${playerName}`,
          timestamp: eventDate.getTime(),
          timeString: timeStr,
          playerName,
          type: 'join',
          rawLog: line,
          thread,
        });
        continue;
      }

      // Check leave
      const leaveMatch = line.match(leaveRegex);
      if (leaveMatch) {
        const timeStr = leaveMatch[1];
        const thread = leaveMatch[2];
        const playerName = leaveMatch[3];

        const [hh, mm, ss] = timeStr.split(':').map(Number);
        const eventDate = new Date(today);
        eventDate.setHours(hh, mm, ss, 0);

        parsedEvents.push({
          id: `evt-leave-${i}-${timeStr}-${playerName}`,
          timestamp: eventDate.getTime(),
          timeString: timeStr,
          playerName,
          type: 'leave',
          rawLog: line,
          thread,
        });
      }
    }

    // Sort newest first
    parsedEvents.sort((a, b) => b.timestamp - a.timestamp);

    // Filter
    let filtered = parsedEvents;
    if (filterType && filterType !== 'all') {
      filtered = filtered.filter(e => e.type === filterType);
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(e => e.playerName.toLowerCase().includes(q));
    }

    const totalJoins = parsedEvents.filter(e => e.type === 'join').length;
    const totalLeaves = parsedEvents.filter(e => e.type === 'leave').length;
    const uniquePlayers = new Set(parsedEvents.map(e => e.playerName.toLowerCase())).size;

    return {
      success: true,
      serverName,
      logFile: 'logs/latest.log',
      lastUpdated: Date.now(),
      events: filtered.slice(0, limit),
      rawLogs: lines.slice(-limit),
      stats: {
        totalEvents: parsedEvents.length,
        totalJoins,
        totalLeaves,
        uniquePlayers,
      },
    };
  }
}
