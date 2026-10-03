import React, { useState } from 'react';
import { PlayerInfo, ServerStats } from '../types';
import { Users, Search, UserCheck } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

interface OnlinePlayersProps {
  stats: ServerStats;
}

export const OnlinePlayers: React.FC<OnlinePlayersProps> = ({ stats }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const players = stats.playersList || [];
  const filteredPlayers = players.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'tween', duration: 0.22, ease: [0.16, 1, 0.3, 1] } 
    },
    exit: { 
      opacity: 0, 
      scale: 0.9, 
      transition: { duration: 0.2 } 
    }
  };

  return (
    <section id="players" className="relative py-12 px-4 scroll-mt-24">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Users className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                Online Players
              </h2>
              <span className="px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-[11px] font-bold tracking-wider">
                {stats.isOnline ? `${stats.playersOnline} / ${stats.maxPlayers}` : 'Offline'}
              </span>
            </div>
          </div>
          
          {/* Search bar */}
          {stats.isOnline && players.length > 0 && (
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                id="input-player-search"
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all backdrop-blur-sm shadow-sm"
              />
            </div>
          )}
        </div>

        {/* Players Grid / State */}
        {!stats.isOnline ? (
          <div className="text-center py-16 px-4 border border-zinc-800/50 rounded-[32px] bg-zinc-900/30 backdrop-blur-sm">
            <Users className="w-10 h-10 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-white font-bold text-lg mb-1">Server Offline</h3>
            <p className="text-zinc-500 text-sm max-w-md mx-auto">
              Start the server or check back shortly to view the active player roster.
            </p>
          </div>
        ) : stats.playersOnline === 0 ? (
          <div className="text-center py-16 px-4 border border-zinc-800/50 rounded-[32px] bg-zinc-900/30 backdrop-blur-sm">
            <Users className="w-10 h-10 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-white font-bold text-lg mb-1">0 Players Online</h3>
            <p className="text-zinc-500 text-sm max-w-md mx-auto">
              The realm is quiet. Join now and be the first to explore today!
            </p>
          </div>
        ) : players.length === 0 ? (
          <div className="text-center py-16 px-4 border border-zinc-800/50 rounded-[32px] bg-zinc-900/30 backdrop-blur-sm">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 mb-4">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="text-white font-bold text-lg mb-1">
              {stats.playersOnline} {stats.playersOnline === 1 ? 'Player' : 'Players'} Online
            </h3>
            <p className="text-zinc-500 text-sm max-w-md mx-auto">
              Player list is currently hidden by the server privacy settings, but {stats.playersOnline} players are actively playing.
            </p>
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div className="text-center py-16 px-4 border border-zinc-800/50 rounded-[32px] bg-zinc-900/30 backdrop-blur-sm">
            <p className="text-zinc-500 text-sm">
              No players found matching "{searchTerm}".
            </p>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {filteredPlayers.map((player) => {
                const crafatarUrl = player.uuid && player.uuid !== player.name
                  ? `https://crafatar.com/avatars/${player.uuid}?size=64&overlay=true`
                  : `https://crafatar.com/avatars/${player.name}?size=64&overlay=true`;

                return (
                  <motion.div
                    key={player.name}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    id={`player-card-${player.name}`}
                    className="group relative rounded-2xl p-3 bg-zinc-900/40 hover:bg-zinc-800 border border-zinc-800/50 hover:border-zinc-700/50 transition-all flex items-center gap-3.5 backdrop-blur-sm cursor-default overflow-hidden"
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0 shadow-sm">
                      <img
                        src={crafatarUrl}
                        alt={player.name}
                        className="w-full h-full object-cover [image-rendering:pixelated]"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://minotar.net/avatar/${player.name}/64`;
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-white text-sm truncate group-hover:text-emerald-50 transition-colors">
                        {player.name}
                      </div>
                      <div className="text-[11px] text-zinc-400 font-medium flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                        <span>Online</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  );
};
