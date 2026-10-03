import React, { useState, useEffect, useCallback } from 'react';
import { PlayerLogEvent, ServerLogsResponse } from '../types';
import { ServerLogsService } from '../services/serverLogsService';
import { 
  LogIn, 
  LogOut, 
  Terminal, 
  Search, 
  RefreshCw, 
  Copy, 
  Check, 
  FileText, 
  Users, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Activity,
  Radio,
  Trash2
} from 'lucide-react';
import { sounds } from '../utils/audio';
import { motion, AnimatePresence } from 'framer-motion';

interface PlayerEventsSectionProps {
  serverName?: string;
  autoRefreshInterval?: number;
  showToast?: (msg: string) => void;
}

export const PlayerEventsSection: React.FC<PlayerEventsSectionProps> = ({
  serverName = 'My-MC SMP',
  autoRefreshInterval = 15,
  showToast,
}) => {
  const [logsData, setLogsData] = useState<ServerLogsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'join' | 'leave'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'terminal'>('cards');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch logs from API
  const loadLogs = useCallback(async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setIsLoading(true);
    try {
      const data = await ServerLogsService.fetchLogs(50, filterType, searchQuery);
      setLogsData(data);
    } catch (e) {
      console.error('Failed to load server logs:', e);
    } finally {
      if (showLoadingSpinner) setIsLoading(false);
    }
  }, [filterType, searchQuery]);

  // Initial load and dependency updates
  useEffect(() => {
    loadLogs(true);
  }, [loadLogs]);

  // Periodic background refresh
  useEffect(() => {
    const timer = setInterval(() => {
      loadLogs(false);
    }, Math.max(10, autoRefreshInterval) * 1000);

    return () => clearInterval(timer);
  }, [autoRefreshInterval, loadLogs]);

  const handleCopy = (text: string, id: string) => {
    sounds.playPop();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    if (showToast) showToast('Copied log line to clipboard');
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const handleClearLogs = async () => {
    sounds.playClick();
    setIsLoading(true);
    try {
      await ServerLogsService.clearLogs();
      if (showToast) showToast('Cleared server logs');
      await loadLogs(false);
    } catch {
      if (showToast) showToast('Failed to clear logs');
    } finally {
      setIsLoading(false);
    }
  };

  const events = logsData?.events || [];
  const stats = logsData?.stats || {
    totalEvents: events.length,
    totalJoins: events.filter(e => e.type === 'join').length,
    totalLeaves: events.filter(e => e.type === 'leave').length,
    uniquePlayers: new Set(events.map(e => e.playerName.toLowerCase())).size,
  };

  return (
    <section id="player-logs" className="relative max-w-5xl mx-auto px-4 scroll-mt-24">
      <div className="rounded-[32px] bg-zinc-900/60 backdrop-blur-md sm:backdrop-blur-lg border border-zinc-800/50 p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
              <FileText className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  Player Join & Leave Events
                </h2>
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>latest.log</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 font-medium">
                Live chronological connection telemetry parsed directly from Minecraft server logs
              </p>
            </div>
          </div>

          {/* Quick Actions & View Switcher */}
          <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-zinc-950/60 p-1 rounded-xl border border-zinc-800 text-xs font-medium">
              <button
                onClick={() => {
                  sounds.playClick();
                  setViewMode('cards');
                }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'cards'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>Timeline</span>
              </button>
              <button
                onClick={() => {
                  sounds.playClick();
                  setViewMode('terminal');
                }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'terminal'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Console</span>
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => {
                sounds.playClick();
                loadLogs(true);
              }}
              disabled={isLoading}
              title="Refresh logs from server"
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/50 flex items-center gap-1.5 text-xs font-medium transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Clear Logs Button (if any logs exist) */}
            {(stats.totalEvents > 0 || (logsData?.rawLogs && logsData.rawLogs.length > 0)) && (
              <button
                onClick={handleClearLogs}
                disabled={isLoading}
                title="Purge / Clear all connection logs"
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 flex items-center gap-1.5 text-xs font-medium transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-zinc-950/40 border border-zinc-800/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">Total Logged</div>
              <div className="text-lg font-bold font-mono text-white leading-tight">
                {stats.totalEvents} <span className="text-xs font-normal text-zinc-500 font-sans">events</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-950/40 border border-zinc-800/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <LogIn className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">Joins</div>
              <div className="text-lg font-bold font-mono text-emerald-400 leading-tight">
                {stats.totalJoins}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-950/40 border border-zinc-800/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
              <LogOut className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">Leaves</div>
              <div className="text-lg font-bold font-mono text-rose-400 leading-tight">
                {stats.totalLeaves}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-950/40 border border-zinc-800/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">Unique Players</div>
              <div className="text-lg font-bold font-mono text-indigo-300 leading-tight">
                {stats.uniquePlayers}
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-zinc-950/50 p-1 rounded-xl border border-zinc-800/80 self-start sm:self-auto">
            <button
              onClick={() => {
                sounds.playClick();
                setFilterType('all');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-zinc-800 text-white font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All Events ({stats.totalEvents})
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                setFilterType('join');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                filterType === 'join'
                  ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <LogIn className="w-3 h-3" />
              <span>Joins</span>
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                setFilterType('leave');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                filterType === 'leave'
                  ? 'bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <LogOut className="w-3 h-3" />
              <span>Leaves</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950/50 border border-zinc-800/80 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono"
            />
          </div>
        </div>

        {/* View Mode 1: Interactive Cards */}
        {viewMode === 'cards' && (
          <div className="space-y-2.5">
            {events.length === 0 ? (
              <div className="text-center py-14 px-6 border border-zinc-800/60 rounded-3xl bg-zinc-950/30 backdrop-blur-sm">
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mx-auto mb-3 shadow-inner">
                  <Radio className="w-6 h-6 text-emerald-400/80 animate-pulse" />
                </div>
                <h4 className="text-white font-bold text-base mb-1">
                  {searchQuery ? `No activity found for "${searchQuery}"` : 'Awaiting Live Connection Events'}
                </h4>
                <p className="text-zinc-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                  {searchQuery 
                    ? 'Check the spelling of the username or try filtering by "All Events".' 
                    : `Live log stream connected to ${serverName}. Real join and leave events will appear here chronologically as players connect to the Minecraft server.`
                  }
                </p>
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                  <span>Real-time log watcher active</span>
                </div>
              </div>
            ) : (
              events.map((event) => {
                const isJoin = event.type === 'join';
                const isExpanded = expandedLogId === event.id;
                const isCopied = copiedId === event.id;

                return (
                  <motion.div
                    key={event.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                    className={`rounded-2xl border transition-all ${
                      isJoin 
                        ? 'bg-zinc-950/30 hover:bg-zinc-950/60 border-emerald-950/40 hover:border-emerald-500/30' 
                        : 'bg-zinc-950/30 hover:bg-zinc-950/60 border-zinc-800/60 hover:border-rose-500/30'
                    }`}
                  >
                    <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                      {/* Left: Player Avatar + Details */}
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Minecraft Player Avatar */}
                        <div className="relative shrink-0 w-10 h-10 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700 shadow-sm flex items-center justify-center">
                          <img
                            src={`https://mc-heads.net/avatar/${encodeURIComponent(event.playerName)}/40`}
                            alt={event.playerName}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://minotar.net/avatar/MHF_Steve/40';
                            }}
                            className="w-full h-full object-cover pixelated"
                            loading="lazy"
                          />
                          <div 
                            className={`absolute bottom-0 inset-x-0 h-1 ${
                              isJoin ? 'bg-emerald-400' : 'bg-rose-500'
                            }`} 
                          />
                        </div>

                        {/* Name and Event Type */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm sm:text-base font-mono truncate">
                              {event.playerName}
                            </span>
                            <span 
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase tracking-wider flex items-center gap-1 ${
                                isJoin
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                              }`}
                            >
                              {isJoin ? (
                                <>
                                  <LogIn className="w-3 h-3 stroke-[2.5]" />
                                  <span>Joined</span>
                                </>
                              ) : (
                                <>
                                  <LogOut className="w-3 h-3 stroke-[2.5]" />
                                  <span>Left</span>
                                </>
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono mt-0.5">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-zinc-600" />
                              <span className="text-zinc-400">{event.relativeTime || 'Recently'}</span>
                            </span>
                            <span>•</span>
                            <span className="text-zinc-500">{event.timeString}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleCopy(event.rawLog, event.id)}
                          title="Copy raw log line"
                          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          onClick={() => {
                            sounds.playClick();
                            setExpandedLogId(isExpanded ? null : event.id);
                          }}
                          title={isExpanded ? "Collapse raw log" : "View raw server log"}
                          className={`p-2 rounded-xl border transition-colors cursor-pointer flex items-center gap-1 text-xs font-mono ${
                            isExpanded
                              ? 'bg-zinc-800 text-white border-zinc-700'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                          }`}
                        >
                          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Raw Log Drawer */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t border-zinc-800/80 bg-black/40 px-4 py-3 rounded-b-2xl font-mono text-xs space-y-2 overflow-hidden"
                        >
                          <div className="flex items-center justify-between text-[11px] text-zinc-500">
                            <span className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span>Source: logs/latest.log</span>
                            </span>
                            <span>Thread: {event.thread || 'Server thread/INFO'}</span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80 text-zinc-300 overflow-x-auto whitespace-pre font-mono text-[11px] select-all">
                            <code>{event.rawLog}</code>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {/* View Mode 2: Terminal / Console Output */}
        {viewMode === 'terminal' && (
          <div className="rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-2xl font-mono text-xs">
            {/* Terminal Window Header */}
            <div className="bg-zinc-900/90 border-b border-zinc-800 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="text-zinc-400 text-xs ml-2">latest.log — Minecraft Server Console</span>
              </div>
              <button
                onClick={() => {
                  const fullText = (logsData?.rawLogs || []).join('\n');
                  handleCopy(fullText, 'terminal-full-log');
                }}
                disabled={!logsData?.rawLogs?.length}
                className="flex items-center gap-1.5 text-zinc-400 hover:text-white px-2.5 py-1 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 text-[11px] cursor-pointer transition-colors disabled:opacity-40"
              >
                {copiedId === 'terminal-full-log' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy All</span>
                  </>
                )}
              </button>
            </div>

            {/* Terminal Scroll Content */}
            <div className="p-4 max-h-[380px] overflow-y-auto space-y-1.5 text-zinc-300 text-[11px] sm:text-xs">
              {(!logsData?.rawLogs || logsData.rawLogs.length === 0) ? (
                <div className="py-8 text-center text-zinc-500 space-y-1">
                  <div>// [logs/latest.log is currently empty]</div>
                  <div>// Real-time telemetry monitoring server uplink at {serverName}</div>
                  <div>// Incoming player join and leave messages will be streamed here live.</div>
                </div>
              ) : (
                logsData.rawLogs.map((line, idx) => {
                  const isJoin = line.includes('joined the game');
                  const isLeave = line.includes('left the game');

                  return (
                    <div key={idx} className="flex items-start gap-2 hover:bg-zinc-900/40 py-0.5 px-1 rounded font-mono">
                      <span className="text-zinc-600 select-none text-right w-6 shrink-0">{idx + 1}</span>
                      <span className="break-all">
                        {isJoin ? (
                          <span className="text-emerald-400 font-semibold">{line}</span>
                        ) : isLeave ? (
                          <span className="text-rose-400 font-semibold">{line}</span>
                        ) : (
                          <span className="text-zinc-400">{line}</span>
                        )}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Real-time Telemetry Footer */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500 font-mono border-t border-zinc-800/40">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span>Telemetry source: direct Minecraft Server List Ping (SLP) & server logs</span>
          </div>

          <div className="flex items-center gap-2 text-zinc-400">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Auto-sync interval: {autoRefreshInterval}s</span>
          </div>
        </div>
      </div>
    </section>
  );
};
