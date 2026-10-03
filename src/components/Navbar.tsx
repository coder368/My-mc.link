import React, { useState } from 'react';
import { ServerConfig, ServerStats, ServerRealm } from '../types';
import { 
  Gamepad2, 
  Users, 
  ShieldCheck, 
  MessageSquare, 
  Copy, 
  Check, 
  Settings,
  Menu,
  X,
  Home,
  FileText,
  Activity,
  Compass
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface NavbarProps {
  config: ServerConfig;
  stats: ServerStats;
  activeRealm?: ServerRealm;
  onOpenSettings: () => void;
  onCopyIp: (ip: string, label: string) => void;
  copiedLabel: string | null;
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  config,
  stats,
  activeRealm,
  onOpenSettings,
  onCopyIp,
  copiedLabel,
  activeSection,
  setActiveSection,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const realmName = activeRealm ? activeRealm.name : config.serverName;
  const host = activeRealm ? activeRealm.javaIp : config.javaIp;
  const port = activeRealm ? activeRealm.javaPort : config.javaPort;
  const fullJavaIp = port === 25565 ? host : `${host}:${port}`;

  // Clean nav links
  const navLinks = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'dashboard', label: 'Telemetry', icon: Activity },
    { id: 'players', label: 'Players', icon: Users, badge: stats.isOnline ? `${stats.playersOnline}` : undefined },
    ...(activeRealm?.hasDiscordBot ? [{ id: 'bot-commands', label: 'Commands', icon: Gamepad2 }] : [{ id: 'guide', label: 'Guide', icon: Compass }]),
    { id: 'rules', label: 'Rules', icon: ShieldCheck },
  ];

  const handleNavClick = (sectionId: string) => {
    sounds.playClick();
    setActiveSection(sectionId);
    setMobileMenuOpen(false);

    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const isCopied = copiedLabel === 'navbar-ip' || copiedLabel === 'hero-java-ip';

  return (
    <header className="fixed top-3 sm:top-4 inset-x-0 z-50 flex justify-center px-3 sm:px-4 pointer-events-none">
      {/* Compact Floating Glassmorphism Pill */}
      <div className="pointer-events-auto backdrop-blur-md bg-zinc-900/90 border border-white/[0.08] rounded-full px-3.5 sm:px-4 py-2 shadow-xl flex items-center justify-between gap-2 sm:gap-4 max-w-4xl w-full">
        {/* Logo & Live Status Dot */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2 px-1.5 py-1 rounded-full hover:bg-zinc-800/60 transition-colors cursor-pointer text-left shrink-0"
        >
          <div className="w-6 h-6 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-emerald-400">
            <Gamepad2 className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-xs sm:text-sm text-white tracking-tight">
              {realmName}
            </span>
            <span 
              className={`w-2 h-2 rounded-full ${
                stats.isOnline 
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' 
                  : 'bg-rose-500'
              }`}
              title={stats.isOnline ? `Server Online (${stats.playersOnline} players)` : 'Server Offline'}
            />
          </div>
        </button>

        {/* Desktop Nav Links: Strictly Home, Players, Rules, Discord */}
        <nav className="hidden md:flex items-center gap-1 font-mono">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                id={`nav-link-${link.id}`}
                onClick={() => handleNavClick(link.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'text-emerald-400 bg-zinc-950 border border-zinc-800'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
                {link.badge && (
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-400/15 text-emerald-400 text-[10px] font-mono font-bold">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Discord Nav Link */}
          <a
            id="nav-link-discord"
            href={config.discordInviteUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sounds.playClick()}
            className="px-3 py-1 rounded-full text-xs font-medium text-zinc-400 hover:text-[#8ea1ff] hover:bg-zinc-800/50 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#5865F2]" />
            <span>Discord</span>
          </a>
        </nav>

        {/* Right Actions: Compact Quick Copy + Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            id="nav-copy-java-ip-btn"
            onClick={() => {
              sounds.playPop();
              onCopyIp(fullJavaIp, 'navbar-ip');
            }}
              className="px-3 py-1.5 rounded-full text-xs font-bold font-mono tracking-tight transition-colors cursor-pointer flex items-center gap-1.5 bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 text-[#07110d] shadow-sm shrink-0"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">Copy IP</span>
                <span className="sm:hidden">IP</span>
              </>
            )}
          </button>

          {/* Settings button */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenSettings();
            }}
            title="Settings"
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 border border-transparent hover:border-zinc-700 transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown - Strictly Home, Players, Rules, Discord */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto absolute top-14 inset-x-4 max-w-sm mx-auto backdrop-blur-xl bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-2xl space-y-3 z-50 md:hidden font-mono">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 px-1">
            <span className="text-xs font-semibold text-zinc-400">Navigation</span>
            <span className="text-[11px] text-emerald-400 font-bold">
              {stats.isOnline ? `${stats.playersOnline} Online` : 'Offline'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeSection === link.id;
              return (
                <button
                  key={`mob-${link.id}`}
                  onClick={() => handleNavClick(link.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    isActive 
                      ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/30 font-bold' 
                      : 'bg-zinc-950 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
                  }`}
                >
                  <Icon className="w-4 h-4 text-emerald-400" />
                  <span>{link.label}</span>
                </button>
              );
            })}

            {/* Discord Link */}
            <a
              href={config.discordInviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                sounds.playClick();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium bg-zinc-950 text-zinc-300 hover:bg-zinc-800 border border-zinc-800 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-[#5865F2]" />
              <span>Discord</span>
            </a>
          </div>

          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                sounds.playPop();
                onCopyIp(fullJavaIp, 'navbar-ip');
                setMobileMenuOpen(false);
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-400 text-[#07110d] text-xs font-bold font-mono text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Java IP</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSettings();
              }}
              className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white cursor-pointer"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
