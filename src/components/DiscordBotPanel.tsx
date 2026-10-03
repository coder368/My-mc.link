import React, { useState } from 'react';
import { BotCommandInfo, ServerConfig } from '../types';
import { 
  Terminal, 
  Bot, 
  ShieldAlert, 
  Copy, 
  Check, 
  Sparkles, 
  Layers, 
  ExternalLink,
  MessageSquare,
  ArrowUpRight
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface DiscordBotPanelProps {
  commands: BotCommandInfo[];
  config: ServerConfig;
  onCopy: (text: string, label: string) => void;
  copiedLabel: string | null;
}

export const DiscordBotPanel: React.FC<DiscordBotPanelProps> = ({
  commands,
  config,
  onCopy,
  copiedLabel
}) => {
  const [selectedCommand, setSelectedCommand] = useState<BotCommandInfo>(commands[0]);
  const [activeTab, setActiveTab] = useState<'commands' | 'simulator' | 'architecture'>('commands');

  const handleTabClick = (tab: 'commands' | 'simulator' | 'architecture') => {
    sounds.playClick();
    setActiveTab(tab);
  };

  const handleCopyCmd = (text: string, label: string) => {
    sounds.playPop();
    onCopy(text, label);
  };

  return (
    <div id="discord-bot-section" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-7 shadow-xl space-y-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-[#5865F2] shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold font-mono tracking-tight text-white uppercase">
                Discord Bot Commands
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#5865F2]/10 text-[#8ea1ff] border border-[#5865F2]/30 text-[10px] font-mono font-bold">
                discord.py 3.13
              </span>
            </div>
            <p className="text-zinc-400 text-xs font-mono mt-0.5">
              Hybrid slash & prefix control gateway connected to server panel daemon.
            </p>
          </div>
        </div>

        {/* Discord Link */}
        <a
          id="btn-bot-join-discord"
          href={config.discordInviteUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => sounds.playClick()}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-semibold shadow-md transition-colors cursor-pointer font-mono"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Join Bot Channel</span>
          <ExternalLink className="w-3 h-3 opacity-70" />
        </a>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 overflow-x-auto font-mono text-xs">
        <button
          onClick={() => handleTabClick('commands')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'commands'
              ? 'bg-zinc-950 text-emerald-400 border border-zinc-800 shadow-inner font-bold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span>Bot Command Directory</span>
        </button>

        <button
          onClick={() => handleTabClick('simulator')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'simulator'
              ? 'bg-zinc-950 text-emerald-400 border border-zinc-800 shadow-inner font-bold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Interactive Discord Embed</span>
        </button>

        <button
          onClick={() => handleTabClick('architecture')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'architecture'
              ? 'bg-zinc-950 text-emerald-400 border border-zinc-800 shadow-inner font-bold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-sky-400" />
          <span>Fail-Safe System</span>
        </button>
      </div>

      {/* Tab 1: Command Directory */}
      {activeTab === 'commands' && (
        <div className="space-y-4 font-mono">
          {/* Public Channel Badge & Player Subtitle */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-zinc-300">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">Public Channel:</span>
              <span className="text-emerald-400 font-bold bg-zinc-900 px-2 py-0.5 rounded-lg border border-zinc-800">
                #bot-commands
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/30 text-[11px] font-semibold">
                All commands are available to all server players.
              </span>
            </div>
          </div>

          {/* Command Cards with Direct Discord Redirect Link */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
            {commands.map((cmd) => (
              <a
                key={cmd.name}
                id={`command-card-${cmd.name.replace(/[^a-zA-Z0-9]/g, '')}`}
                href={config.discordInviteUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setSelectedCommand(cmd)}
                className="block bg-zinc-950 border border-zinc-800 rounded-xl p-4 cursor-pointer hover:border-emerald-500/50 hover:bg-zinc-800/60 transition-all duration-200 shadow-md group relative text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-emerald-400 font-bold text-xs bg-zinc-900 group-hover:bg-zinc-950 px-2 py-0.5 rounded-lg border border-zinc-800 transition-colors">
                      {cmd.name}
                    </span>
                    <span className="text-zinc-600 text-xs">or</span>
                    <span className="text-amber-300 text-xs bg-zinc-900 group-hover:bg-zinc-950 px-2 py-0.5 rounded-lg border border-zinc-800 transition-colors">
                      {cmd.prefixAlias}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/30">
                      Public
                    </span>

                    {/* Copy Button with stopPropagation so it doesn't open Discord link */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCopyCmd(cmd.name, `cmd-${cmd.name}`);
                      }}
                      className="p-1 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-emerald-400/50 text-zinc-300 transition-colors cursor-pointer"
                      title="Copy Command"
                    >
                      {copiedLabel === `cmd-${cmd.name}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-zinc-300 text-xs leading-relaxed mb-3 font-sans">
                  {cmd.description}
                </p>

                <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-zinc-850">
                  <span className="text-zinc-500">Cooldown: {cmd.cooldownSec}s</span>
                  <span className="text-emerald-400 group-hover:text-emerald-300 flex items-center gap-1 font-semibold transition-colors">
                    <span>Click to execute in Discord →</span>
                    <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Interactive Discord Simulator */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-mono">
          <div className="lg:col-span-4 space-y-2">
            <label className="text-xs text-zinc-400 block mb-1">
              Select Command to Test:
            </label>
            {commands.map((cmd) => (
              <button
                key={cmd.name}
                onClick={() => setSelectedCommand(cmd)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                  selectedCommand.name === cmd.name
                    ? 'bg-zinc-950 text-emerald-400 border border-emerald-400/40 font-bold'
                    : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                <span>{cmd.name}</span>
                <span className="text-[10px] text-emerald-400">Public</span>
              </button>
            ))}
          </div>

          <div className="lg:col-span-8 bg-[#313338] rounded-2xl p-5 border border-zinc-700/60 shadow-xl font-sans text-zinc-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-700/60 text-zinc-300 text-xs font-semibold mb-4">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 text-base font-normal">#</span>
                <span className="font-mono">bot-commands</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">Available to all players</span>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-white text-xs shrink-0 font-mono">
                  MC
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Player_One</span>
                    <span className="text-[10px] text-zinc-400">Today at 12:45 PM</span>
                  </div>
                  <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#383a40] text-emerald-400 font-mono text-xs">
                    <span>{selectedCommand.name}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 pl-2 sm:pl-4">
                <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center text-white text-xs font-bold shrink-0">
                  BOT
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">MyMC Server Guard</span>
                    <span className="bg-[#5865F2] text-white text-[9px] font-bold px-1 py-0.2 rounded font-mono">BOT</span>
                    <span className="text-[10px] text-zinc-400">Today at 12:45 PM</span>
                  </div>

                  <div className="mt-2 bg-[#2b2d31] border border-emerald-400/35 rounded-lg p-3 space-y-2 text-xs">
                    <div className="text-[10px] text-zinc-400 font-mono font-semibold uppercase tracking-wider">
                      My-MC.Link Server Panel • {config.serverId}
                    </div>
                    <div className="text-sm font-bold text-zinc-100">
                      Command Executed: {selectedCommand.name}
                    </div>
                    <div className="text-zinc-300 font-mono whitespace-pre-line text-xs bg-[#1e1f22] p-2.5 rounded border border-zinc-800">
                      {selectedCommand.responsePreview}
                    </div>
                    <div className="text-[10px] text-zinc-400 flex items-center justify-between pt-1 font-mono">
                      <span>Gateway: Active WebSocket</span>
                      <span className="text-emerald-400">Safe Defer Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Fail-Safe Architecture */}
      {activeTab === 'architecture' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs uppercase">
              <ShieldAlert className="w-4 h-4" />
              <span>Cloudflare HTTP Rate Fallback</span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed font-sans">
              On free tier hosting, Discord HTTP API requests for slash commands can encounter Cloudflare rate limits (HTTP 1015/429), causing indefinite "Thinking..." states.
            </p>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-300 space-y-1">
              <div className="text-emerald-400"># Solution implemented in daemon:</div>
              <div>1. <code className="text-sky-300">safe_defer()</code> tries interaction HTTP</div>
              <div>2. If HTTP fails &rarr; redirects to <code className="text-amber-300">ctx.channel.send()</code></div>
              <div>3. 100% visible delivery guaranteed</div>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase">
              <Layers className="w-4 h-4" />
              <span>Smart API Cache & Standby State</span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed font-sans">
              When the Minecraft server is powered down, My-MC.Link panel returns HTTP 404 for cache files. The bot intercepts 404 as an expected <strong className="text-zinc-200">Server Standby</strong> state instead of an unhandled error.
            </p>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-300 space-y-1">
              <div className="text-emerald-400"># Async Threading & Reconnect:</div>
              <div>• <code className="text-sky-300">asyncio.to_thread()</code> for synchronous safety</div>
              <div>• <code className="text-amber-300">heartbeat_timeout=60.0</code> for drops</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
