import { PlayerLogEvent, ServerLogsResponse } from '../types';

export class ServerLogsService {
  public static async fetchLogs(
    limit: number = 40,
    filter: 'all' | 'join' | 'leave' = 'all',
    search: string = ''
  ): Promise<ServerLogsResponse> {
    const params = new URLSearchParams();
    if (limit) params.set('limit', limit.toString());
    if (filter && filter !== 'all') params.set('filter', filter);
    if (search && search.trim()) params.set('search', search.trim());

    try {
      const res = await fetch(`/api/server-logs?${params.toString()}`, {
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        const data: ServerLogsResponse = await res.json();
        const now = Date.now();
        data.events = (data.events || []).map(event => ({
          ...event,
          relativeTime: this.formatRelativeTime(event.timestamp, now),
        }));
        return data;
      }
    } catch (e) {
      console.warn('Failed to fetch from /api/server-logs:', e);
    }

    // Real empty data when no logs or offline
    return {
      success: true,
      serverName: 'My-MC SMP',
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

  public static async clearLogs(): Promise<boolean> {
    try {
      const res = await fetch('/api/server-logs', {
        method: 'DELETE',
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  public static formatRelativeTime(timestamp: number, currentNow: number = Date.now()): string {
    const diffMs = currentNow - timestamp;
    if (diffMs < 0) return 'Just now';
    const seconds = Math.floor(diffMs / 1000);
    if (seconds < 45) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }
}
