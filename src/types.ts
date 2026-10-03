export interface ServerRealm {
  id: string; // 'mymc' | 'rcesc'
  name: string;
  tagline: string;
  badge: string;
  javaIp: string;
  javaPort: number;
  mcVersion: string;
  software: string;
  heroImage: string;
  hasDiscordBot: boolean;
  botChannelName?: string;
  discordInviteUrl: string;
  startGuideSteps?: Array<{
    step: string;
    title: string;
    description: string;
  }>;
}

export interface ServerConfig {
  serverName: string;
  serverTagline: string;
  javaIp: string;
  javaPort: number;
  mcVersion: string;
  serverId: 'Minecraft' | 'SFTP';
  discordInviteUrl: string;
  discordChannelName: string;
  discordChannelId?: string;
  myMcApiUrl: string;
  myMcApiKey?: string;
  autoRefreshInterval: number; // in seconds
  enableSimulation: boolean;
  theme?: 'midnight' | 'light';
  activeRealmId?: string;
}

export interface PlayerInfo {
  uuid: string;
  name: string;
  rank?: string;
  ping?: number;
  playtimeHours?: number;
}

export interface ServerStats {
  isOnline: boolean;
  javaOnline?: boolean;
  isStarting?: boolean;
  motdClean: string;
  motdRaw?: string[];
  playersOnline: number;
  maxPlayers: number;
  playersList: PlayerInfo[];
  version: string;
  pingMs?: number;
  cpuPercent?: number;
  ramUsageMb?: number;
  ramMaxMb?: number;
  lastChecked: string;
  rawStatus?: string;
  software?: string;
}

export interface BotCommandInfo {
  name: string;
  prefixAlias: string;
  description: string;
  adminOnly: boolean;
  cooldownSec: number;
  example: string;
  responsePreview: string;
}

export interface ServerRank {
  id: string;
  name: string;
  color: string;
  badgeBg: string;
  priceTag?: string;
  perks: string[];
  discordRole: string;
  popular?: boolean;
}

export interface ServerRule {
  id: string;
  category: string;
  title: string;
  description: string;
  punishment: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'connection' | 'discord' | 'gameplay' | 'server';
}

export interface UptimeDataPoint {
  time: string;
  uptime: number; // percentage, e.g. 99.98
  latency: number; // ms
  incidents: number;
  status: 'nominal' | 'degraded' | 'maintenance';
}

export interface PlayerHistoricalPoint {
  time: string;
  players: number;
  javaPlayers: number;
  isPeak?: boolean;
}

export interface PlayerLogEvent {
  id: string;
  timestamp: number;
  timeString: string;
  relativeTime?: string;
  playerName: string;
  playerUuid?: string;
  type: 'join' | 'leave';
  rawLog: string;
  thread?: string;
  ipMasked?: string;
  coordinates?: string;
  sessionDurationMinutes?: number;
}

export interface ServerLogsResponse {
  success: boolean;
  serverName: string;
  logFile: string;
  lastUpdated: number;
  events: PlayerLogEvent[];
  rawLogs: string[];
  stats: {
    totalEvents: number;
    totalJoins: number;
    totalLeaves: number;
    uniquePlayers: number;
  };
}

