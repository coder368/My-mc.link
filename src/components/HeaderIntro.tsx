import React from 'react';
import { ServerConfig, ServerStats, ServerRealm } from '../types';
import { Copy, Check, Sparkles, Compass } from 'lucide-react';
import { sounds } from '../utils/audio';
import { motion, AnimatePresence, Variants } from 'framer-motion';

interface HeaderIntroProps {
  config: ServerConfig;
  stats: ServerStats;
  activeRealm: ServerRealm;
  onCopyIp: (ip: string, label: string) => void;
  copiedLabel: string | null;
}

export const HeaderIntro: React.FC<HeaderIntroProps> = ({
  config,
  stats,
  activeRealm,
  onCopyIp,
  copiedLabel,
}) => {
  const fullJavaIp = activeRealm.javaPort === 25565 ? activeRealm.javaIp : `${activeRealm.javaIp}:${activeRealm.javaPort}`;
  const isJavaCopied = copiedLabel === 'hero-java-ip';

  const handleCopy = (text: string, label: string) => {
    sounds.playPop();
    onCopyIp(text, label);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.05 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: 'blur(0px)',
      transition: { type: 'tween', duration: 0.24, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  return (
    <section id="home" className="relative pt-28 sm:pt-32 pb-16 px-4 text-center scroll-mt-24 min-h-[55vh] flex flex-col items-center justify-center overflow-hidden">
      {/* Cinematic Realm Backdrop with Scrim */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <img
          src={activeRealm.heroImage}
          alt={activeRealm.name}
          className="w-full h-full object-cover object-center opacity-25 scale-105 transition-all duration-1000 ease-out filter blur-[1px]"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040405] via-[#040405]/85 to-transparent" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#040405]/60 to-[#040405]" />
      </div>

      <motion.div 
        key={activeRealm.id}
        className="relative z-10 w-full max-w-4xl mx-auto space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Unboxed Status & Telemetry Metadata (Zero-Pill Discipline) */}
        <motion.div variants={itemVariants} className="flex justify-center">
          <div className="inline-flex items-center gap-2.5 text-xs font-mono text-zinc-400">
            <span className="relative flex h-2 w-2">
              {stats.isOnline && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${stats.isOnline ? 'bg-emerald-400' : 'bg-rose-500'}`} />
            </span>

            <span className={`font-semibold tracking-wide ${stats.isOnline ? 'text-emerald-400' : 'text-rose-400'}`}>
              {stats.isOnline ? 'Realm Operational' : 'Offline / Standby'}
            </span>

            <span className="text-zinc-600" aria-hidden="true">·</span>
            <span>{stats.playersOnline} / {stats.maxPlayers} Online</span>
            <span className="text-zinc-600" aria-hidden="true">·</span>
            <span>{activeRealm.software}</span>
            {stats.pingMs ? (
              <>
                <span className="text-zinc-600" aria-hidden="true">·</span>
                <span className="text-emerald-400/90">{stats.pingMs}ms TCP</span>
              </>
            ) : null}
          </div>
        </motion.div>

        {/* Hero Title & Subtitle */}
        <motion.div variants={itemVariants} className="space-y-4 max-w-3xl mx-auto">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-[-0.04em] text-white leading-[1.08] [text-wrap:balance]">
            {activeRealm.name}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-zinc-300 font-normal tracking-tight max-w-2xl mx-auto leading-relaxed [text-wrap:balance]">
            {activeRealm.tagline}
          </p>
        </motion.div>

        {/* Action Controls */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
          {/* Primary Copy IP Action Button */}
          <button
            onClick={() => handleCopy(fullJavaIp, 'hero-java-ip')}
            className="group relative w-full sm:w-auto min-w-[280px] h-14 rounded-2xl bg-white text-zinc-950 font-semibold text-sm flex items-center justify-between px-5 transition-transform duration-200 active:scale-95 shadow-[0_8px_30px_rgb(255,255,255,0.12)] hover:shadow-[0_8px_40px_rgb(255,255,255,0.2)] cursor-pointer"
          >
            <div className="flex flex-col items-start leading-tight text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Connect Java IP</span>
              <span className="tracking-tight text-zinc-900 font-mono font-bold text-sm">{fullJavaIp}</span>
            </div>
            <div className="pl-3">
              <AnimatePresence mode="wait">
                {isJavaCopied ? (
                  <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                  </motion.div>
                ) : (
                  <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Copy className="w-4 h-4 text-zinc-400 group-hover:text-zinc-800 transition-colors" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </button>

          {/* Secondary Action: Discord / Guide */}
          <a
            href={activeRealm.discordInviteUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sounds.playClick()}
            className="w-full sm:w-auto h-14 px-6 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 border border-white/[0.08] hover:border-white/[0.15] text-sm font-medium flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-sm"
          >
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>Join Community Discord</span>
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
};
