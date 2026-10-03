import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleDot,
  Copy,
  ExternalLink,
  Gauge,
  HardDrive,
  Menu,
  MessageCircle,
  RefreshCw,
  Server,
  Settings2,
  ShieldCheck,
  Sparkles,
  Terminal,
  Users,
  Wifi,
  X,
  Zap,
} from 'lucide-react';
import { ServerConfig, ServerRealm, ServerStats } from './types';
import { BOT_COMMANDS, DEFAULT_CONFIG, DEFAULT_REALMS, FAQS, SERVER_RULES } from './data/defaultConfig';
import { ServerStatusService } from './services/serverStatusService';
import { sounds } from './utils/audio';
import { ConfigModal } from './components/ConfigModal';
import { DiscordBotPanel } from './components/DiscordBotPanel';
import { PlayerEventsSection } from './components/PlayerEventsSection';
import { RealmGuideCard } from './components/RealmGuideCard';
import { RulesBentoGrid } from './components/RulesBentoGrid';
import { ShareModal } from './components/ShareModal';
import { Toast } from './components/Toast';
import { OnlinePlayers } from './components/OnlinePlayers';
import { UptimeGraph } from './components/UptimeGraph';

const navItems = [
  { id: 'dashboard', label: 'Overview' },
  { id: 'uptime', label: 'Telemetry' },
  { id: 'players', label: 'Players' },
  { id: 'rules', label: 'Rules' },
];

export default function App() {
  const [config, setConfig] = useState<ServerConfig>(() => {
    try {
      const saved = localStorage.getItem('mymc_portal_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if ((!parsed.javaIp || parsed.javaIp === 'my-mc.link') && (!parsed.javaPort || parsed.javaPort === 25565)) {
          parsed.javaPort = 40891;
        }
        return { ...DEFAULT_CONFIG, ...parsed };
      }
    } catch {
      // Local storage is optional.
    }
    return DEFAULT_CONFIG;
  });
  const [activeRealmId, setActiveRealmId] = useState(() => {
    try {
      const saved = localStorage.getItem('mymc_active_realm');
      return saved && DEFAULT_REALMS.some((realm) => realm.id === saved) ? saved : 'mymc';
    } catch {
      return 'mymc';
    }
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('mymc_sound_enabled');
      return saved === null ? true : JSON.parse(saved);
    } catch {
      return true;
    }
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('mymc_notifications_enabled');
      return saved === null ? false : JSON.parse(saved);
    } catch {
      return false;
    }
  });
  const [stats, setStats] = useState<ServerStats>({
    isOnline: true,
    motdClean: 'Connecting to server...',
    playersOnline: 0,
    maxPlayers: 20,
    playersList: [],
    version: '1.21.11',
    lastChecked: 'Just now',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const previousStatus = useRef<boolean | null>(null);
  const activeRealm: ServerRealm = DEFAULT_REALMS.find((realm) => realm.id === activeRealmId) || DEFAULT_REALMS[0];
  const fullIp = activeRealm.javaPort === 25565 ? activeRealm.javaIp : `${activeRealm.javaIp}:${activeRealm.javaPort}`;
  const capacity = stats.maxPlayers > 0 ? Math.min(100, Math.round((stats.playersOnline / stats.maxPlayers) * 100)) : 0;
  const statusLabel = stats.isOnline ? 'Operational' : stats.isStarting ? 'Starting up' : 'Offline';
  const statusTone = stats.isOnline ? 'online' : stats.isStarting ? 'starting' : 'offline';

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), 3200);
  }, []);

  useEffect(() => {
    sounds.setEnabled(soundEnabled);
    localStorage.setItem('mymc_sound_enabled', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    document.documentElement.classList.toggle('theme-light', config.theme === 'light');
    document.documentElement.classList.toggle('theme-midnight', config.theme !== 'light');
  }, [config.theme]);

  const refreshStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const realmConfig: ServerConfig = {
        ...config,
        serverName: activeRealm.name,
        javaIp: activeRealm.javaIp,
        javaPort: activeRealm.javaPort,
        mcVersion: activeRealm.mcVersion,
      };
      const updated = await ServerStatusService.fetchStatus(realmConfig);
      if (previousStatus.current === false && updated.isOnline && notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(`${activeRealm.name} is online`, {
          body: `${updated.playersOnline} players are currently connected.`,
          icon: '/favicon.ico',
        });
      }
      previousStatus.current = updated.isOnline;
      setStats(updated);
    } catch (error) {
      console.error('Failed to fetch server status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeRealm, config, notificationsEnabled]);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  useEffect(() => {
    const timer = window.setInterval(refreshStatus, (config.autoRefreshInterval || 15) * 1000);
    return () => window.clearInterval(timer);
  }, [config.autoRefreshInterval, refreshStatus]);

  const handleSelectRealm = (realm: ServerRealm) => {
    sounds.playClick();
    setActiveRealmId(realm.id);
    localStorage.setItem('mymc_active_realm', realm.id);
    showToast(`Switched to ${realm.name}`);
  };

  const handleCopy = (value: string, label: string) => {
    sounds.playPop();
    navigator.clipboard?.writeText(value);
    setCopiedLabel(label);
    showToast(`Copied ${value}`);
    window.setTimeout(() => setCopiedLabel(null), 2600);
  };

  const handleSaveConfig = (nextConfig: ServerConfig) => {
    setConfig(nextConfig);
    localStorage.setItem('mymc_portal_config', JSON.stringify(nextConfig));
    showToast('Settings updated');
  };

  const toggleNotifications = async () => {
    sounds.playClick();
    if (!notificationsEnabled && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        showToast('Notification permission was not granted');
        return;
      }
    }
    const next = !notificationsEnabled;
    setNotificationsEnabled(next);
    localStorage.setItem('mymc_notifications_enabled', JSON.stringify(next));
    showToast(next ? 'Status notifications enabled' : 'Status notifications disabled');
  };

  const scrollTo = (id: string) => {
    setMobileNavOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const telemetryRows = useMemo(() => [
    { label: 'Java endpoint', value: fullIp, icon: Terminal },
    { label: 'Game version', value: stats.version || activeRealm.mcVersion, icon: Sparkles },
    { label: 'Server software', value: activeRealm.software, icon: Server },
  ], [activeRealm, fullIp, stats.version]);

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <div className="signal-grid" aria-hidden="true" />

      <header className="topbar">
        <button className="brand-button" onClick={() => scrollTo('dashboard')} aria-label="Back to overview">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span className="brand-lockup"><strong>MY-MC</strong><small>REALM SIGNAL</small></span>
        </button>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => scrollTo(item.id)}>{item.label}</button>
          ))}
        </nav>
        <div className="topbar-actions">
          <button className="topbar-link discord-link" onClick={() => window.open(activeRealm.discordInviteUrl, '_blank', 'noopener,noreferrer')}>
            <MessageCircle size={15} /> <span>Discord</span>
          </button>
          <button className="icon-button" onClick={() => { sounds.playClick(); setIsConfigOpen(true); }} aria-label="Open settings"><Settings2 size={17} /></button>
          <button className="mobile-menu-button icon-button" onClick={() => setMobileNavOpen((open) => !open)} aria-label="Toggle navigation">
            {mobileNavOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
        {mobileNavOpen && (
          <div className="mobile-nav" role="dialog" aria-label="Mobile navigation">
            {navItems.map((item) => <button key={item.id} onClick={() => scrollTo(item.id)}>{item.label}<ChevronRight size={15} /></button>)}
            <button onClick={() => { setMobileNavOpen(false); window.open(activeRealm.discordInviteUrl, '_blank', 'noopener,noreferrer'); }}>Discord <ExternalLink size={15} /></button>
          </div>
        )}
      </header>

      <main>
        <section className="hero-section" id="dashboard">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> LIVE OPERATIONS / {new Date().getFullYear()}</div>
            <h1>Know when<br /><em>your realm</em> is ready.</h1>
            <p className="hero-lede">A clear, calm view of your Minecraft worlds. Check signal, players, and connection details before you load in.</p>
            <div className="hero-actions">
              <button className="primary-button" onClick={() => handleCopy(fullIp, 'hero-java-ip')}>
                {copiedLabel === 'hero-java-ip' ? <Check size={17} /> : <Copy size={17} />} {copiedLabel === 'hero-java-ip' ? 'Copied address' : 'Copy Java address'}
              </button>
              <button className="text-button" onClick={() => scrollTo('uptime')}>View telemetry <ArrowUpRight size={16} /></button>
            </div>
          </div>
          <div className="hero-signal" style={{ '--hero-image': `url(${activeRealm.heroImage})` } as React.CSSProperties}>
            <div className="hero-image-wash" />
            <div className="hero-signal-top"><span>SELECTED REALM</span><span className={`status-chip ${statusTone}`}><span />{statusLabel}</span></div>
            <div className="hero-signal-content">
              <div className="signal-orbit"><div className="orbit-core"><Activity size={24} /></div><div className="orbit-ring ring-one" /><div className="orbit-ring ring-two" /></div>
              <span className="signal-label">{activeRealm.badge}</span>
              <h2>{activeRealm.name}</h2>
              <p>{stats.motdClean || activeRealm.tagline}</p>
            </div>
            <div className="hero-signal-bottom"><span>LAST PROBE <strong>{stats.lastChecked}</strong></span><span>LATENCY <strong>{stats.pingMs ? `${stats.pingMs} ms` : '—'}</strong></span></div>
          </div>
        </section>

        <section className="realm-section section-wrap" aria-labelledby="realm-heading">
          <div className="section-intro"><div><span className="section-kicker">01 / REALM SELECTOR</span><h2 id="realm-heading">Pick a world to inspect.</h2></div><span className="section-count">{DEFAULT_REALMS.length.toString().padStart(2, '0')} WORLDS</span></div>
          <div className="realm-switcher" role="tablist" aria-label="Minecraft realms">
            {DEFAULT_REALMS.map((realm) => {
              const isActive = realm.id === activeRealm.id;
              return <button key={realm.id} className={`realm-tab ${isActive ? 'active' : ''}`} onClick={() => handleSelectRealm(realm)} role="tab" aria-selected={isActive}>
                <span className={`realm-status ${isActive ? statusTone : 'idle'}`}><span /></span><span className="realm-tab-copy"><strong>{realm.name}</strong><small>{realm.javaIp}</small></span><span className="realm-tab-badge">{realm.badge}</span><ChevronRight className="realm-chevron" size={17} />
              </button>;
            })}
          </div>
        </section>

        <section className="status-section section-wrap" aria-labelledby="status-heading">
          <div className="section-intro"><div><span className="section-kicker">02 / CURRENT SIGNAL</span><h2 id="status-heading">The signal is {stats.isOnline ? 'clean' : 'quiet'}.</h2></div><div className="section-actions"><button className="quiet-button" onClick={toggleNotifications}><Wifi size={15} /> {notificationsEnabled ? 'Alerts on' : 'Notify me'}</button><button className="quiet-button" onClick={() => { sounds.playClick(); refreshStatus(); }} disabled={isLoading}><RefreshCw className={isLoading ? 'spin' : ''} size={15} /> Refresh</button></div></div>
          <div className="status-layout">
            <article className={`status-card ${statusTone}`}>
              <div className="status-card-head"><div><span className="card-label">SERVER STATUS</span><div className="big-status"><span className="pulse-dot" />{statusLabel}</div></div><div className="status-card-mark"><Gauge size={26} /></div></div>
              <p>{stats.isOnline ? 'Players can join now. The realm is responding normally to the latest probe.' : 'The realm is not responding right now. Check back or use the community Discord for updates.'}</p>
              <div className="signal-bars" aria-label="Recent signal history">{Array.from({ length: 18 }, (_, index) => <span key={index} className={stats.isOnline ? (index === 14 ? 'soft' : '') : 'down'} />)}</div>
              <div className="status-card-foot"><span>PROBE WINDOW</span><strong>Every {config.autoRefreshInterval || 15}s</strong><span className="foot-divider" /><span>LAST CHECK</span><strong>{stats.lastChecked}</strong></div>
            </article>
            <article className="metric-card capacity-card"><div className="metric-head"><span className="card-label">PLAYER CAPACITY</span><Users size={17} /></div><div className="metric-value"><strong>{stats.playersOnline}</strong><span>/ {stats.maxPlayers} slots</span></div><div className="capacity-track"><span style={{ transform: `scaleX(${capacity / 100})` }} /></div><div className="metric-foot"><span>{capacity}% occupied</span><strong>{stats.playersOnline === 0 ? 'Quiet moment' : 'Active right now'}</strong></div></article>
            <article className="metric-card latency-card"><div className="metric-head"><span className="card-label">RESPONSE LATENCY</span><Zap size={17} /></div><div className="metric-value"><strong>{stats.pingMs || '—'}</strong><span>{stats.pingMs ? 'ms' : 'waiting'}</span></div><div className="latency-line"><span /><span /><span /><span /><span /><span /><span /><span /><span /></div><div className="metric-foot"><span>TCP gateway probe</span><strong>{stats.pingMs && stats.pingMs < 35 ? 'Healthy path' : 'Monitoring'}</strong></div></article>
          </div>
          <div className="connection-panel"><div className="connection-icon"><Terminal size={18} /></div><div className="connection-copy"><span className="card-label">JAVA MULTIPLAYER ADDRESS</span><strong>{fullIp}</strong></div><button className="copy-button" onClick={() => handleCopy(fullIp, 'status-java-ip')}>{copiedLabel === 'status-java-ip' ? <Check size={16} /> : <Copy size={16} />}<span>{copiedLabel === 'status-java-ip' ? 'Copied' : 'Copy'}</span></button></div>
        </section>

        <section className="details-section section-wrap" aria-labelledby="details-heading">
          <div className="section-intro compact"><div><span className="section-kicker">03 / TECHNICAL DETAILS</span><h2 id="details-heading">Everything you need to connect.</h2></div><span className="live-note"><CircleDot size={13} /> Live from {activeRealm.javaIp}</span></div>
          <div className="detail-grid">{telemetryRows.map(({ label, value, icon: Icon }) => <div className="detail-row" key={label}><span className="detail-icon"><Icon size={16} /></span><span className="detail-label">{label}</span><strong>{value}</strong></div>)}<div className="detail-row"><span className="detail-icon"><HardDrive size={16} /></span><span className="detail-label">Availability</span><strong className="text-signal">{stats.isOnline ? 'Ready to play' : 'Offline'}</strong></div></div>
        </section>

        <div className="legacy-section">
          {activeRealm.hasDiscordBot ? <div id="bot-commands" className="section-wrap"><DiscordBotPanel commands={BOT_COMMANDS} config={config} onCopy={handleCopy} copiedLabel={copiedLabel} /></div> : <RealmGuideCard realm={activeRealm} stats={stats} onCopyIp={handleCopy} copiedLabel={copiedLabel} />}
          <PlayerEventsSection serverName={activeRealm.name} autoRefreshInterval={config.autoRefreshInterval} showToast={showToast} />
          <UptimeGraph stats={stats} config={config} />
          <OnlinePlayers stats={stats} />
          <div id="rules"><RulesBentoGrid rules={SERVER_RULES} faqs={FAQS} /></div>
        </div>
      </main>

      <footer className="site-footer section-wrap"><div className="footer-brand"><span className="brand-mark small" aria-hidden="true"><i /><i /><i /></span><span><strong>MY-MC</strong><small>DUAL REALM PORTAL</small></span></div><div className="footer-links"><button onClick={() => setIsShareOpen(true)}><ExternalLink size={14} /> Share portal</button><button onClick={() => setIsConfigOpen(true)}><Settings2 size={14} /> Settings</button><a href={activeRealm.discordInviteUrl} target="_blank" rel="noreferrer"><MessageCircle size={14} /> Discord</a></div></footer>

      <ConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} config={config} onSave={handleSaveConfig} soundEnabled={soundEnabled} onToggleSound={() => setSoundEnabled((enabled) => !enabled)} />
      <ShareModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} config={config} onCopy={handleCopy} copiedLabel={copiedLabel} />
      <Toast message={toastMessage} />
    </div>
  );
}
