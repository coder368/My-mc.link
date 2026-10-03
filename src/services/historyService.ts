export interface PingRecord {
  timestamp: number;
  latency: number;
  isOnline: boolean;
}

const STORAGE_KEY = 'mc_latency_history';

export class HistoryService {
  static getHistory(): PingRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed: PingRecord[] = JSON.parse(data);
        // Filter out the erroneously high HTTP fetch latencies (>100ms) to clean the user's graph
        const sanitized = parsed.filter(p => p.latency < 100);
        return sanitized;
      }
    } catch {
      // ignore
    }
    return [];
  }

  static addRecord(record: PingRecord) {
    const history = this.getHistory();
    history.push(record);
    
    // Prune history older than 24 hours
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const pruned = history.filter(r => r.timestamp >= oneDayAgo);
    
    // Only save if it's not growing unbounded, maybe cap at 4000 items
    if (pruned.length > 4000) {
        pruned.splice(0, pruned.length - 4000);
    }
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned));
    } catch {
      // ignore quota errors
    }
  }
}
