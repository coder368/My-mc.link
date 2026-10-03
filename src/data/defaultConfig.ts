import { ServerConfig, BotCommandInfo, ServerRule, FaqItem, ServerRealm } from '../types';

export const DEFAULT_REALMS: ServerRealm[] = [
  {
    id: 'mymc',
    name: 'My-MC SMP',
    tagline: 'Vanilla Survival Realm with automated Discord Bot integration',
    badge: 'Vanilla 1.21.11',
    javaIp: 'my-mc.link',
    javaPort: 40891,
    mcVersion: '1.21.11',
    software: 'Vanilla 1.21.11',
    heroImage: '/src/assets/images/realm_mymc_hero_1791015590705.jpg',
    hasDiscordBot: true,
    botChannelName: '#bot-commands',
    discordInviteUrl: 'https://discord.gg/AxDVukJdgR',
  },
  {
    id: 'rcesc',
    name: 'RCESC Server',
    tagline: 'Paper 1.21.11 Survival & Lifesteal Realm (playwithbao.com)',
    badge: 'Paper 1.21.11',
    javaIp: 'rcesc.playwithbao.com',
    javaPort: 32086,
    mcVersion: '1.21.11',
    software: 'Paper 1.21.11',
    heroImage: '/src/assets/images/realm_rcesc_hero_1791015606497.jpg',
    hasDiscordBot: false,
    discordInviteUrl: 'https://discord.gg/AxDVukJdgR',
    startGuideSteps: [
      {
        step: '01',
        title: 'Join the Community Discord',
        description: 'Connect to our official Discord server to get verified and access the server control channels.',
      },
      {
        step: '02',
        title: 'Read Server Start Steps',
        description: 'Follow the server starting instructions detailed in the Discord announcement and wake channels.',
      },
      {
        step: '03',
        title: 'Connect in Minecraft',
        description: 'Add rcesc.playwithbao.com to your Java Multiplayer list (v1.21.11) and join the realm!',
      },
    ],
  },
];

export const DEFAULT_CONFIG: ServerConfig = {
  serverName: "My-MC SMP",
  serverTagline: "Vanilla Survival Server with automated Discord Bot Integration",
  javaIp: "my-mc.link",
  javaPort: 40891,
  mcVersion: "1.21.11",
  serverId: "Minecraft",
  discordInviteUrl: "https://discord.gg/AxDVukJdgR",
  discordChannelName: "#bot-commands",
  discordChannelId: "123456789012345678",
  myMcApiUrl: "https://api.my-mc.link",
  myMcApiKey: "",
  autoRefreshInterval: 15,
  enableSimulation: false, // Default to REAL-TIME live querying!
  theme: 'midnight',
  activeRealmId: 'mymc',
};

export const BOT_COMMANDS: BotCommandInfo[] = [
  {
    name: "/status",
    prefixAlias: "!status",
    description: "Displays modern server status, RAM, and CPU usage with online player count.",
    adminOnly: false,
    cooldownSec: 10,
    example: "/status",
    responsePreview: "🟢 **Server is Online**\n⚡ CPU Usage: `18.4%`\n💾 RAM Usage: `1.85 GB (46.2%)`\n👥 Players: `6 / 20`\n☕ Java IP: `my-mc.link:40891`"
  },
  {
    name: "/start",
    prefixAlias: "!start",
    description: "Sends power signal to start the server when it is offline or sleeping.",
    adminOnly: false,
    cooldownSec: 10,
    example: "/start",
    responsePreview: "🚀 **Server start command sent!**\nCheck `/status` in a few minutes."
  },
  {
    name: "/stop",
    prefixAlias: "!stop",
    description: "Safely shuts down the server container.",
    adminOnly: false,
    cooldownSec: 10,
    example: "/stop",
    responsePreview: "🛑 **Server stop command sent!**\nShutting down..."
  },
  {
    name: "/restart",
    prefixAlias: "!restart",
    description: "Restarts the server container.",
    adminOnly: false,
    cooldownSec: 15,
    example: "/restart",
    responsePreview: "🔄 **Server restart command sent!**\nBooting up..."
  },
  {
    name: "/my-mc-link",
    prefixAlias: "!my-mc-link",
    description: "Generates or retrieves the server's direct Java connection link.",
    adminOnly: false,
    cooldownSec: 10,
    example: "/my-mc-link",
    responsePreview: "🌐 **Java Network Link**\nAddress: `my-mc.link:40891`"
  },
  {
    name: "/serverhelp",
    prefixAlias: "!serverhelp",
    description: "Displays available server-management commands in the command channel.",
    adminOnly: false,
    cooldownSec: 5,
    example: "/serverhelp",
    responsePreview: "🛠️ **Minecraft Server Commands**\n`/status` - Shows if server is online, player count, and usage stats\n`/start` - Starts the server if it is offline\n`/stop` - Safely shuts down the server\n`/restart` - Restarts the server container\n`/my-mc-link` - Gets Java connection link"
  }
];

export const SERVER_RULES: ServerRule[] = [
  {
    id: "rule-1",
    category: "Griefing & Theft",
    title: "No Griefing or Unclaimed Stealing",
    description: "Do not destroy or modify other players' builds or containers within or near claimed areas. Respect community builds.",
    punishment: "Warning -> Temporary Ban -> Permanent Ban"
  },
  {
    id: "rule-2",
    category: "Cheating & Exploits",
    title: "No X-Ray, Hacked Clients or Automation Macros",
    description: "Any client modifications providing unfair advantages (X-Ray texture packs, Baritone, fly/speed hacks, auto-clickers) are strictly forbidden.",
    punishment: "Immediate Permanent Ban"
  },
  {
    id: "rule-3",
    category: "Chat & Respect",
    title: "Family-Friendly & Respectful Communication",
    description: "No hate speech, harassment, toxicity, excessive spam, or advertising other servers in game chat or Discord channels.",
    punishment: "Mute -> Temp Ban"
  },
  {
    id: "rule-4",
    category: "Economy & Duplication",
    title: "No Item Duplication or Lag Machines",
    description: "Do not intentionally build redstone loops designed to lower TPS or duplicate items/rails/tnt.",
    punishment: "Inventory Wipe + Ban"
  }
];

export const FAQS: FaqItem[] = [
  {
    id: "faq-1",
    category: "server",
    question: "Why does the server go into sleep/offline mode?",
    answer: "To save resources and maintain high performance, the hosting container puts the server into sleep mode when no players are active. You can wake it up instantly by opening our Discord `#〢💻⪼『-ᴄᴏᴍᴍᴀɴᴅ÷ʟɪɴᴇ』` channel and typing `/start` (or `!start`)!"
  },
  {
    id: "faq-3",
    category: "discord",
    question: "How do the Discord bot commands work?",
    answer: "Our custom bot features hybrid command support! You can either use modern slash commands like `/status` and `/start`, or prefix commands like `!status` and `!start` inside `#〢💻⪼『-ᴄᴏᴍᴍᴀɴᴅ÷ʟɪɴᴇ』`."
  },
  {
    id: "faq-4",
    category: "gameplay",
    question: "How do I protect my house and chest from griefers?",
    answer: "Hold a Golden Shovel to claim land. Right click two opposite corners of your build. Use `/trust <player>` to give your friends permission to build or open containers."
  }
];

