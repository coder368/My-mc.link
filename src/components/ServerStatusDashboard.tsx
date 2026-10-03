import React from 'react';
import { ServerConfig, ServerStats, ServerRealm } from '../types';
import { RefreshCw, Users, Shield, Coffee, Copy, Check, Activity, Bell, BellOff, Compass } from 'lucide-react';
import { sounds } from '../utils/audio';
import { motion, AnimatePresence, Variants } from 'framer-motion';

interface ServerStatusDashboardProps {
  config: ServerConfig;
  stats: ServerStats;
  activeRealm?: ServerRealm;
  onRefresh: () => void;
  isLoading: boolean;
  onCopyIp: (ip: string, label: string) => void;
  copiedLabel: string | null;
  notificationsEnabled?: boolean;
  onToggleNotifications?: () => void;
}

export const ServerStatusDashboard: React.FC<ServerStatusDashboardProps> = ({
  config,
  stats,
  activeRealm,
  onRefresh,
  isLoading,
  onCopyIp,
  copiedLabel,
  notificationsEnabled,
  onToggleNotifications,
}) => {
  const host = activeRealm ? activeRealm.javaIp : config.javaIp;
  const port = activeRealm ? activeRealm.javaPort : config.javaPort;
  const fullJavaIp = port === 25565 ? host : `${host}:${port}`;
  const realmName = activeRealm ? activeRealm.name : config.serverName;
  const softwareName = activeRealm ? activeRealm.software : (stats.software || 'Paper / Vanilla 1.21.11');
  
  const isJavaCopied = copiedLabel === 'dash-java-ip';

  const playerPercentage = stats.maxPlayers > 0 
    ? Math.min(100, Math.round((stats.playersOnline / stats.maxPlayers) * 100))
    : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.05 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: 'blur(0px)',
      transition: { type: 'tween', duration: 0.24, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  return (
    <section id="dashboard" className="relative max-w-5xl mx-auto px-4 scroll-mt-24">
      <motion.div 
        id="central-dashboard-container"
        className="rounded-3xl bg-zinc-900/60 backdrop-blur-md sm:backdrop-blur-lg border border-white/[0.08] p-6 sm:p-8 shadow-2xl space-y-6 sm:space-y-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {/* Top Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-white/[0.06]">
          <motion.div variants={itemVariants} className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-2xl bg-zinc-800/60 border border-white/[0.08] flex items-center justify-center text-white shrink-0 shadow-sm overflow-hidden">
                {stats.isOnline && (
                  <span className="absolute inset-0 bg-emerald-500/20 animate-pulse" />
                )}
                <Activity className={`w-5 h-5 relative z-10 ${stats.isOnline ? 'text-emerald-400' : 'text-zinc-500'}`} />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    {realmName}
                  </h2>
                  <div className="flex items-center gap-1.5 text-xs font-mono">
                    <span className={`w-2 h-2 rounded-full ${stats.isOnline ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]' : 'bg-rose-500'}`} />
                    <span className={`font-semibold ${stats.isOnline ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {stats.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-zinc-400 font-medium">
                  {stats.motdClean || 'A Minecraft Server'}
                </p>
              </div>
            </div>
          </motion.div>
          
          {/* Refresh & Actions */}
          <motion.div variants={itemVariants} className="flex items-center gap-3">
            <div className="text-right hidden sm:block text-xs font-mono text-zinc-500 mr-1">
              <span>Last probed </span>
              <span className="text-zinc-300 tabular-nums">{stats.lastChecked}</span>
            </div>
            
            {onToggleNotifications && (
              <button
                onClick={onToggleNotifications}
                className={`group inline-flex items-center justify-center w-11 h-11 rounded-xl border transition-all active:scale-95 cursor-pointer shadow-sm hover:shadow-md ${
                  notificationsEnabled 
                    ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20' 
                    : 'bg-zinc-800/50 hover:bg-zinc-700/80 text-zinc-400 hover:text-zinc-300 border-white/[0.08]'
                }`}
                title={notificationsEnabled ? "Disable Status Notifications" : "Enable Status Notifications"}
              >
                {notificationsEnabled ? (
                  <Bell className="w-4 h-4 fill-emerald-500/20" />
                ) : (
                  <BellOff className="w-4 h-4" />
                )}
              </button>
            )}

            <button
              onClick={() => {
                sounds.playClick();
                onRefresh();
              }}
              disabled={isLoading}
              className="group inline-flex items-center justify-center w-11 h-11 rounded-xl bg-zinc-800/60 hover:bg-zinc-700/80 text-zinc-300 border border-white/[0.08] transition-all active:scale-95 cursor-pointer disabled:opacity-50 shadow-sm hover:shadow-md"
              title="Refresh Server Status"
            >
              <RefreshCw className={`w-4 h-4 group-hover:text-white transition-colors ${isLoading ? 'animate-spin text-white' : ''}`} />
            </button>
          </motion.div>
        </div>

        {/* Real Live Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {/* Player Count Metric */}
          <motion.div variants={itemVariants} className="bg-zinc-950/60 border border-white/[0.06] rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between text-zinc-400">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-white font-mono font-bold text-sm tabular-nums">
                <span className="text-emerald-400">{stats.playersOnline}</span> <span className="text-zinc-500">/</span> {stats.maxPlayers} <span className="text-xs text-zinc-400 font-sans font-normal">Players</span>
              </span>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">Active Realm Capacity</div>
              <div className="w-full bg-zinc-800/60 rounded-full h-2 overflow-hidden shadow-inner">
                <div 
                  className="bg-emerald-400 h-full rounded-full transition-all duration-700 ease-out relative" 
                  style={{ width: `${playerPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full h-full" />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-500 tabular-nums">
                  {playerPercentage}% occupied capacity
                </span>
                <a 
                  href="#players" 
                  onClick={() => sounds.playClick()}
                  className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                >
                  <span>View Player List &rarr;</span>
                </a>
              </div>
            </div>
          </motion.div>

          {/* Version Metric */}
          <motion.div variants={itemVariants} className="bg-zinc-950/60 border border-white/[0.06] rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono text-zinc-400">
                {stats.pingMs ? `${stats.pingMs}ms TCP ping` : 'SLP Probe'}
              </span>
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-1">Server Software & Version</div>
              <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-mono">
                {stats.version || config.mcVersion}
              </div>
              <div className="mt-1.5 text-xs text-zinc-400 font-medium">
                {softwareName}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Real Connection Details Bar */}
        <motion.div variants={itemVariants} className="pt-1">
          <button
            onClick={() => {
              sounds.playPop();
              onCopyIp(fullJavaIp, 'dash-java-ip');
            }}
            className="w-full group bg-zinc-950/60 hover:bg-zinc-950/90 border border-white/[0.06] hover:border-white/[0.12] rounded-2xl p-4 flex items-center justify-between gap-4 transition-all cursor-pointer text-left active:scale-[0.99] shadow-sm"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white shrink-0 group-hover:bg-white/[0.1] transition-colors shadow-inner">
                <Coffee className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-0.5">Java Multiplayer Server Address</div>
                <div className="text-sm sm:text-base font-bold text-white font-mono truncate">
                  {fullJavaIp}
                </div>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-zinc-800/60 flex items-center justify-center shrink-0 border border-white/[0.08]">
              <AnimatePresence mode="wait">
                {isJavaCopied ? (
                  <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                  </motion.div>
                ) : (
                  <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Copy className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
};
