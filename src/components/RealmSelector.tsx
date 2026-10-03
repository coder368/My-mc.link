import React from 'react';
import { ServerRealm, ServerStats } from '../types';
import { Server, Sparkles, Check, Copy } from 'lucide-react';
import { sounds } from '../utils/audio';

interface RealmSelectorProps {
  realms: ServerRealm[];
  activeRealm: ServerRealm;
  onSelectRealm: (realm: ServerRealm) => void;
  activeStats: ServerStats;
  onCopyIp: (ip: string, label: string) => void;
  copiedLabel: string | null;
}

export const RealmSelector: React.FC<RealmSelectorProps> = ({
  realms,
  activeRealm,
  onSelectRealm,
  activeStats,
  onCopyIp,
  copiedLabel,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 pt-6">
      <div className="bg-zinc-950/80 backdrop-blur-md border border-white/[0.08] rounded-3xl p-2 sm:p-2.5 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          {/* Realm Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-900/60 rounded-2xl border border-white/[0.05] overflow-x-auto">
            {realms.map((realm) => {
              const isActive = realm.id === activeRealm.id;
              const fullIp = realm.javaPort === 25565 ? realm.javaIp : `${realm.javaIp}:${realm.javaPort}`;

              return (
                <button
                  key={realm.id}
                  onClick={() => {
                    sounds.playClick();
                    onSelectRealm(realm);
                  }}
                  className={`group relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap text-left ${
                    isActive
                      ? 'bg-zinc-800/90 text-white shadow-md border border-white/[0.1]'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent'
                  }`}
                >
                  <div className="relative flex items-center justify-center">
                    <span
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        isActive
                          ? activeStats.isOnline
                            ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                            : 'bg-rose-500'
                          : 'bg-zinc-600'
                      }`}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs sm:text-sm tracking-tight text-white">
                        {realm.name}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono hidden md:inline">
                        {realm.badge}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono truncate max-w-[180px] sm:max-w-[240px]">
                      {realm.javaIp}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Active Realm Overview & IP Copy */}
          <div className="flex items-center justify-between sm:justify-end gap-3 px-3 py-1.5 text-xs font-mono">
            <div className="flex items-center gap-2 text-zinc-400">
              <span className="text-zinc-500">Active Realm:</span>
              <span className="text-white font-medium">{activeRealm.name}</span>
              <span className="text-zinc-600">·</span>
              <span className={activeStats.isOnline ? 'text-emerald-400 font-semibold' : 'text-zinc-500'}>
                {activeStats.isOnline ? `${activeStats.playersOnline} / ${activeStats.maxPlayers} Online` : 'Offline'}
              </span>
            </div>

            <button
              onClick={() => {
                const ipToCopy = activeRealm.javaPort === 25565 ? activeRealm.javaIp : `${activeRealm.javaIp}:${activeRealm.javaPort}`;
                sounds.playPop();
                onCopyIp(ipToCopy, `quick-copy-${activeRealm.id}`);
              }}
              title={`Copy IP: ${activeRealm.javaIp}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 border border-white/[0.08] transition-all cursor-pointer active:scale-95 text-[11px]"
            >
              {copiedLabel === `quick-copy-${activeRealm.id}` ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Copy IP</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
