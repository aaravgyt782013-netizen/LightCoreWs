import {
  buildCanonicalBotInviteUrl,
  cleanEnvString,
  DEFAULT_BOT_INVITE_URL,
  resolveDiscordClientId,
  resolveOAuthScopes,
  sanitizeDiscordInviteUrl,
  sanitizeOriginUrl,
} from "@/lib/discord-oauth";

const clientId = resolveDiscordClientId();
const prefix = cleanEnvString(process.env.NEXT_PUBLIC_BOT_PREFIX) || ".";

const resolvedInviteUrl = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL
  ? sanitizeDiscordInviteUrl(
      process.env.NEXT_PUBLIC_DISCORD_INVITE_URL,
      clientId,
      { enforceClientId: true },
    )
  : clientId === "1559607601115955210"
    ? DEFAULT_BOT_INVITE_URL
    : buildCanonicalBotInviteUrl(clientId);

export const site = {
  name: cleanEnvString(process.env.NEXT_PUBLIC_SITE_NAME) || "LightCore",
  wordmark: {
    lead: cleanEnvString(process.env.NEXT_PUBLIC_WORDMARK_LEAD) || "LIGHT",
    accent: cleanEnvString(process.env.NEXT_PUBLIC_WORDMARK_ACCENT) || "CORE",
  },
  tagline:
    cleanEnvString(process.env.NEXT_PUBLIC_SITE_TAGLINE) ||
    "LIGHT FOR YOU HEAVY FOR NUKERS",
  description:
    cleanEnvString(process.env.NEXT_PUBLIC_SITE_DESCRIPTION) ||
    "As your choice for an all in one bot",
  url:
    sanitizeOriginUrl(process.env.NEXT_PUBLIC_SITE_URL) ||
    sanitizeOriginUrl(process.env.RENDER_EXTERNAL_URL) ||
    sanitizeOriginUrl(process.env.URL) ||
    sanitizeOriginUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
    "https://lightcorews.onrender.com",
  clientId,
  ownerId:
    cleanEnvString(process.env.NEXT_PUBLIC_OWNER_ID) || "1538907226671022111",
  prefix,
  oauthScopes: resolveOAuthScopes(process.env.NEXT_PUBLIC_DISCORD_OAUTH_SCOPES),
  invite: resolvedInviteUrl,
  dashboard:
    cleanEnvString(process.env.NEXT_PUBLIC_DASHBOARD_URL) || "/login",
  premium: "/premium",
  admin: "/admin",
  discord:
    cleanEnvString(process.env.NEXT_PUBLIC_DISCORD_SUPPORT_URL) ||
    "https://discord.gg/np8M2TZgqa",
  logo: cleanEnvString(process.env.NEXT_PUBLIC_LOGO_URL) || "/brand/logo.png",
} as const;

export function buildGuildInviteUrl(
  guildId: string,
  customInviteBase?: string,
): string {
  const safeBase = sanitizeDiscordInviteUrl(
    customInviteBase || site.invite,
    site.clientId,
  );
  try {
    const url = new URL(safeBase);
    if (/^\d{15,22}$/.test(guildId.trim())) {
      url.searchParams.set("guild_id", guildId.trim());
      url.searchParams.set("disable_guild_select", "true");
    }
    url.searchParams.delete("redirect_uri");
    url.searchParams.delete("response_type");
    url.searchParams.delete("state");
    url.searchParams.delete("prompt");
    return url.toString();
  } catch {
    return DEFAULT_BOT_INVITE_URL;
  }
}

export type LogEntry = {
  id?: string;
  t: string;
  ok: boolean;
  msg: string;
  guild?: string;
  guildId?: string;
  guildOnly?: boolean;
  ts?: string;
};

export const defaultLogs: LogEntry[] = [
  { t: "GUARD", ok: true, msg: "gateway session established · shard 07" },
  { t: "SCAN", ok: true, msg: `26 modules armed · prefix ${prefix} active` },
  { t: "WARN", ok: false, msg: "mass channel delete by @raider (7/3 per min)" },
  { t: "DENY", ok: false, msg: "action blocked in 41ms · actor quarantined" },
  { t: "FIX", ok: true, msg: "rollback restored 6 channels · 4 roles" },
  { t: "AUDIT", ok: true, msg: "incident #4471 written to audit stream" },
  { t: "GUARD", ok: true, msg: "heartbeat ok · latency 38ms" },
];

export const nav = [
  { label: "Features", href: "/#features" },
  { label: "Setup", href: "/#setup" },
  { label: "Protocol", href: "/#protocol" },
  { label: "VoiceMaster", href: "/#voicemaster" },
  { label: "Premium", href: "/premium" },
  { label: "FAQ", href: "/#faq" },
] as const;

export type FeatureKey =
  | "Anti-Nuke"
  | "AutoMod"
  | "Night Mode"
  | "Ticket"
  | "VoiceMaster";

export const features: {
  key: FeatureKey;
  icon: string;
  headline: string;
  copy: string;
  points: string[];
  command?: string;
}[] = [
  {
    key: "Anti-Nuke",
    icon: "shield",
    headline: "Anti-Nuke",
    copy: "Destructive actions are intercepted before they land. Channel wipes, mass bans, role purges and webhook spam are frozen in under 500ms.",
    points: [
      "26 independent security modules",
      "Per-actor rate gates per minute",
      "Automatic rollback of damaged state",
    ],
    command: `${prefix}antinuke enable`,
  },
  {
    key: "AutoMod",
    icon: "bot",
    headline: "AutoMod",
    copy: "A layered content firewall for your community. Spam, invites, phishing links, mass mentions and raid waves are neutralised the moment they appear.",
    points: [
      "Regex + ML-backed spam detection",
      "Phishing & invite link quarantine",
      "Escalating mute, kick and ban ladders",
    ],
    command: `${prefix}automod strict`,
  },
  {
    key: "Night Mode",
    icon: "moon",
    headline: "Night Mode",
    copy: "Lock the server while your team sleeps. Channels freeze on a schedule, raid surfaces tighten, and only trusted roles pass the gate.",
    points: [
      "Timezone-aware lockdown windows",
      "Auto-lock on raid signal spikes",
      "One tap morning restore",
    ],
    command: `${prefix}nightmode 00:00 08:00`,
  },
  {
    key: "Ticket",
    icon: "ticket",
    headline: "Ticket",
    copy: "Support without the mess. Threaded tickets, staff routing, transcripts and SLA timers keep every appeal and report accountable.",
    points: [
      "Private threads & HTML transcripts",
      "Staff assignment and SLA tracking",
      "Panel-based ticket creation",
    ],
    command: `${prefix}ticket setup`,
  },
  {
    key: "VoiceMaster",
    icon: "voice",
    headline: "VoiceMaster",
    copy: "Temporary personalized voice channels for your community. Join to create, own the room, control it from chat, and let it clean itself up.",
    points: [
      "Join-to-create hubs",
      "Per-channel owner controls in chat",
      "Auto cleanup when empty",
    ],
    command: `${prefix}voicemaster setup`,
  },
];

export const setupSteps = [
  {
    step: "01",
    phase: "AUTH",
    title: "Invite the Bot",
    copy: `Integrate ${site.name} into your guild instantly. A single authorization step securely binds the guard engine to your server with optimized administrative privileges.`,
    bullets: [
      "Instant OAuth2 gateway link",
      "Review the requested permissions on Discord before authorizing",
      "Pre-configured secure default hierarchy",
    ],
  },
  {
    step: "02",
    phase: "ACTIVATE",
    title: "Initialize Anti-Nuke",
    copy: "Run the setup trigger command to configure database state and start active scanning.",
    command: `${prefix}antinuke enable`,
    bullets: [
      "Initializes all 26 security modules",
      "Establishes local server state caches",
    ],
  },
  {
    step: "03",
    phase: "MONITOR",
    title: "Control via Dashboard",
    copy: "Synchronize guild owner whitelists, adjust security thresholds, toggle real-time rate limit gates, and review system audit logs from a unified, high-performance web panel.",
    quadrants: [
      { title: "Whitelists", copy: "Explicit owner override authorization" },
      { title: "Limits", copy: "Fine-tune action counters per minute" },
      { title: "Audit Logs", copy: "Sub-500ms chronological events" },
      { title: "Status", copy: "Live health and heartbeat signals" },
    ],
  },
] as const;

export const protocolStages = [
  {
    stage: "STAGE 01 & 05",
    title: "Intelligent Scanning",
    copy: "Continuously intercepts raw gateway events directly from Discord to evaluate actions against rates in real-time.",
  },
  {
    stage: "STAGE 02",
    title: "High-Speed Fetch",
    copy: "Resolves actor metadata and guild configuration settings in milliseconds using our high-speed cache.",
  },
  {
    stage: "STAGE 03",
    title: "State Verification",
    copy: "Performs a state check on the target server settings to prevent unauthorized configuration changes.",
  },
  {
    stage: "STAGE 06",
    title: "Mitigation & Rollback",
    copy: "Instantly applies sanctions (ban, kick, role strip) and restores the server state when threats are confirmed.",
  },
] as const;

export const voiceCards = [
  {
    kicker: "Voicemaster Interface",
    title: "Powerful control for your personal voice channel, with an intuitive, built-in chat interface.",
  },
  {
    kicker: "Easy Setup",
    title: "Spend seconds not hours. One command, it's ready to go.",
  },
  {
    kicker: "Voice Members",
    title: "Grant custom roles and track members in real-time inside your VoiceMaster channels.",
  },
] as const;

export const modules = [
  "Anti-Nuke",
  "Anti-Raid",
  "Anti-Spam",
  "Anti-Link",
  "Anti-Bot",
  "AutoMod",
  "Night Mode",
  "Ticket",
  "VoiceMaster",
  "Verification",
  "AutoRole",
  "Whitelist",
  "Phishing Guard",
  "Mass Mention",
  "Role Guard",
  "Channel Guard",
  "Webhook Guard",
  "Emoji Guard",
  "Ban Guard",
  "Kick Guard",
  "Audit Stream",
  "Rate Gates",
  "Rollback",
  "Quarantine",
  "Heartbeat",
  "Logs",
] as const;

export const faqs = [
  {
    q: `How fast does ${site.name} react to a nuke attempt?`,
    a: "Gateway events are evaluated against configured per-actor rate gates. When a configured threshold is exceeded, the bot can apply the selected mitigation and record the event for review.",
  },
  {
    q: "What permissions does the bot need?",
    a: "The current bot invite link requests Administrator permission. Review the exact permission list on Discord before authorizing, and cancel if you are not comfortable granting it.",
  },
  {
    q: "Will it interfere with my existing moderators?",
    a: "No. Whitelists are explicit and owner-controlled. Trusted roles bypass every gate, and per-role thresholds let senior staff operate with wider limits than trial moderators.",
  },
  {
    q: "Can I roll back damage after an attack?",
    a: "Yes. Confirmed threats trigger automated restoration of deleted channels, roles and configuration, alongside sanctions on the offending actor. Every step is written to the audit stream.",
  },
  {
    q: "How long does setup take?",
    a: `Under 30 seconds. Invite the bot, run ${prefix}antinuke enable, and the default hierarchy, caches and all 26 modules initialise automatically. Fine-tuning happens in the dashboard whenever you want it.`,
  },
] as const;
