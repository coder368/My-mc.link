import React from 'react';
import { ServerRealm, ServerStats } from '../types';
import { MessageSquare, ExternalLink, ArrowRight, ShieldCheck, Terminal, Compass, Check, Copy } from 'lucide-react';
import { sounds } from '../utils/audio';

interface RealmGuideCardProps {
  realm: ServerRealm;
  stats: ServerStats;
  onCopyIp: (ip: string, label: string) => void;
  copiedLabel: string | null;
}

export const RealmGuideCard: React.FC<RealmGuideCardProps> = ({
  realm,
  stats,
  onCopyIp,
  copiedLabel,
}) => {
  const steps = realm.startGuideSteps || [
    {
      step: '01',
      title: 'Join the Community Discord',
      description: 'Connect to our Discord server to get verified and gain access to the player control room.',
    },
    {
      step: '02',
      title: 'Check Discord Starting Instructions',
      description: 'Follow the specific server wake-up instructions detailed in the Discord announcements/control channels.',
    },
    {
      step: '03',
      title: 'Join with Direct Address',
      description: `Enter ${realm.javaIp} into your Minecraft client (Java Edition 1.21.11) and connect!`,
    },
  ];

  const fullIp = realm.javaPort === 25565 ? realm.javaIp : `${realm.javaIp}:${realm.javaPort}`;
  const isCopied = copiedLabel === `guide-copy-${realm.id}`;

  return (
    <section id="guide" className="relative max-w-5xl mx-auto px-4 scroll-mt-24">
      <div className="rounded-3xl bg-zinc-900/60 backdrop-blur-md border border-white/[0.08] p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-800/80 border border-white/[0.08] flex items-center justify-center text-emerald-400 shrink-0">
              <Compass className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                How to Start & Join {realm.name}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 font-medium">
                This realm operates without automated bot commands. Follow the official community discord instructions below to start the server.
              </p>
            </div>
          </div>

          <a
            href={realm.discordInviteUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sounds.playClick()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-semibold tracking-wide transition-all shadow-md active:scale-95 cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <MessageSquare className="w-4 h-4 fill-white" />
            <span>Open Discord Server</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
        </div>

        {/* 3 Step Process Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((item, index) => (
            <div
              key={index}
              className="p-5 rounded-2xl bg-zinc-950/60 border border-white/[0.06] hover:border-white/[0.12] transition-colors space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400">
                  Step {item.step}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">Guide</span>
              </div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                {item.title}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Server Technical Parameters Bar */}
        <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
          <div className="space-y-1">
            <div className="text-zinc-500 text-[11px] uppercase tracking-wider">Direct Java Connection</div>
            <div className="text-white font-bold text-sm sm:text-base flex items-center gap-2">
              <span>{fullIp}</span>
              <span className="text-zinc-500 text-xs">({realm.software})</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                sounds.playPop();
                onCopyIp(fullIp, `guide-copy-${realm.id}`);
              }}
              className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-zinc-200 border border-white/[0.1] transition-all cursor-pointer flex items-center gap-2 active:scale-95"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                  <span className="text-emerald-400 font-semibold">Address Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Copy Server IP</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
