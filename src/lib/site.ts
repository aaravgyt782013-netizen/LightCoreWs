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

export const DEFAULT_SUPPORT_URL = "https://discord.gg/vTPhtsncjH";

export function normalizeSupportUrl(url?: string | null): string {
  const cleaned = cleanEnvString(url);
  if (!cleaned) return DEFAULT_SUPPORT_URL;
  if (/discord\.(?:gg|com\/invite)\/np8M2TZgqa/i.test(cleaned)) {
    return DEFAULT_SUPPORT_URL;
  }
  return cleaned;
}

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
    "The all-in-one Discord security, moderation, voice, ticket & automation bot",
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
    cleanEnvString(process.env.NEXT_PUBLIC_DASHBOARD_URL) || "/dashboard",
  demo: "/dashboard/demo",
  premium: "/premium",
  admin: "/admin",
  security: "/security",
  discord: normalizeSupportUrl(process.env.NEXT_PUBLIC_DISCORD_SUPPORT_URL),
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
  { t: "GUARD", ok: true, msg: "Anti-Nuke engine initialized · 14 action rate-gates ready" },
  { t: "AUTOMOD", ok: true, msg: "Invite & phishing link filter active across text channels" },
  { t: "VERIFY", ok: true, msg: "Member verification gate & account-age check standing by" },
  { t: "VOICE", ok: true, msg: "VoiceMaster join-to-create hub & auto-cleanup synced" },
  { t: "TICKET", ok: true, msg: "Multi-category ticket router & HTML transcript archive ready" },
  { t: "CONFIG", ok: true, msg: `Command router armed on prefix "${prefix}" + slash controls` },
];

export const nav = [
  { label: "Features", href: "/#features" },
  { label: "Dashboard", href: "/#showcase" },
  { label: "Commands", href: "/docs" },
  { label: "Status", href: "/status" },
  { label: "Premium", href: "/premium" },
] as const;

export type FeatureKey =
  | "Anti-Nuke"
  | "AutoMod"
  | "Verification"
  | "Night Mode"
  | "Ticket"
  | "VoiceMaster"
  | "Welcomer"
  | "Utility & GWs";

export type FeatureSpec = {
  key: FeatureKey;
  icon: string;
  category: string;
  headline: string;
  copy: string;
  points: string[];
  command: string;
  demoTab: string;
  highlights: { label: string; value: string }[];
};

export const features: FeatureSpec[] = [
  {
    key: "Anti-Nuke",
    icon: "shield",
    category: "Core Security",
    headline: "Anti-Nuke & State Rollback",
    copy: "14 independent event guards watch destructive mutations — mass bans, kicks, channel wipes, role escalations, rogue bots, webhooks, and vanity edits — firing your chosen sanction and rolling back damaged server structure the instant a threshold trips.",
    points: [
      "14 granular per-action rate gates",
      "Ban, Kick, Strip Roles, or Quarantine",
      "Anti-Betray, Vanity Guard & Rollback",
    ],
    command: `${prefix}antinuke enable`,
    demoTab: "antinuke",
    highlights: [
      { label: "Active Guards", value: "14 Rules" },
      { label: "Trust Layer", value: "Scoped Whitelist" },
      { label: "Recovery", value: "Auto-Rollback" },
    ],
  },
  {
    key: "AutoMod",
    icon: "bot",
    category: "Content Firewall",
    headline: "8-Layer AutoMod Firewall",
    copy: "Keep every conversation clean without babysitting chat. LightCore filters rapid spam bursts, external invite ads, phishing domains, mass mentions, Zalgo crash text, excessive caps, bad words, and coordinated token-raid waves automatically.",
    points: [
      "8 configurable chat & join filters",
      "Domain allowlists & custom word lists",
      "Warn, 5m/1h mute, kick, or ban actions",
    ],
    command: `${prefix}automod strict`,
    demoTab: "automod",
    highlights: [
      { label: "Filters", value: "8 Engines" },
      { label: "Domain Control", value: "Allowlist" },
      { label: "Sanctions", value: "5 Escalations" },
    ],
  },
  {
    key: "Verification",
    icon: "lock",
    category: "Raid Gate",
    headline: "Verification & Anti-Raid Gate",
    copy: "Screen new arrivals before they ever touch your public channels. Deploy a sleek 1-click button, image captcha, or 6-digit code gate combined with minimum Discord account-age checks and automatic join-spike raid pausing.",
    points: [
      "Button, Captcha & 6-Digit Code modes",
      "Minimum Discord account-age filter",
      "Auto-quarantine & raid join pause",
    ],
    command: `${prefix}verify setup #verify @Member`,
    demoTab: "verification",
    highlights: [
      { label: "Modes", value: "3 Challenges" },
      { label: "Alt Screen", value: "Account Age" },
      { label: "Raid Shield", value: "Auto-Pause" },
    ],
  },
  {
    key: "Night Mode",
    icon: "moon",
    category: "Overnight Shield",
    headline: "Night Mode & Instant Lockdown",
    copy: "Protect your community while your moderation team sleeps. Snapshot and temporarily strip high-risk permissions on a timezone-aware schedule, freeze unmonitored channels overnight, and restore the exact state automatically in the morning.",
    points: [
      "11 global timezone lockdown windows",
      "1-click emergency lockdown override",
      "Lossless morning permission restore",
    ],
    command: `${prefix}nightmode 00:00 08:00`,
    demoTab: "nightmode",
    highlights: [
      { label: "Scheduling", value: "Timezone-Aware" },
      { label: "Override", value: "1-Click Freeze" },
      { label: "Morning Sync", value: "Auto-Restore" },
    ],
  },
  {
    key: "Ticket",
    icon: "ticket",
    category: "Support Desk",
    headline: "Multi-Category Ticket Desk",
    copy: "Replace messy DMs with structured private support channels. Route reports, appeals, partnerships, and VIP inquiries through a branded dropdown panel complete with staff claiming, per-user ticket caps, and HTML transcript exports.",
    points: [
      "Custom embed panel & category picker",
      "Staff role routing & open-ticket limits",
      "One-click HTML transcript archiving",
    ],
    command: `${prefix}ticket setup`,
    demoTab: "tickets",
    highlights: [
      { label: "Routing", value: "Multi-Category" },
      { label: "Records", value: "HTML Archives" },
      { label: "Design", value: "Custom Embed" },
    ],
  },
  {
    key: "VoiceMaster",
    icon: "voice",
    category: "Dynamic Voice",
    headline: "Join-to-Create VoiceMaster",
    copy: "Members hop into a single hub channel and instantly receive their own personal voice room with up to 384 kbps audio, in-chat lock/ghost/limit/rename/permit/claim buttons, and zero clutter thanks to automatic empty-room cleanup.",
    points: [
      "Custom channel naming templates",
      "Interactive button deck right in chat",
      "64–384 kbps audio & auto cleanup",
    ],
    command: `${prefix}voicemaster setup`,
    demoTab: "voicemaster",
    highlights: [
      { label: "Bitrate", value: "Up to 384 kbps" },
      { label: "Controls", value: "In-Chat Deck" },
      { label: "Cleanup", value: "Instant Auto" },
    ],
  },
  {
    key: "Welcomer",
    icon: "bell",
    category: "Onboarding",
    headline: "Welcomer, AutoRole & Embeds",
    copy: "Make every first impression unforgettable. Send rich custom-colored welcome embeds with banners, live member counters, optional DM greetings, farewell logs, automatic human/bot join roles, and full WYSIWYG custom server embeds.",
    points: [
      "Live {user}, {server} & {membercount} tags",
      "Embed Studio with banner & DM support",
      "Instant Human & Bot AutoRole + Sticky Nicks",
    ],
    command: `${prefix}greet setup #welcome`,
    demoTab: "welcomer",
    highlights: [
      { label: "Templates", value: "Dynamic Tags" },
      { label: "Preview", value: "Live Discord UI" },
      { label: "Roles", value: "Human + Bot" },
    ],
  },
  {
    key: "Utility & GWs",
    icon: "gift",
    category: "Engagement & Logs",
    headline: "Giveaways, AutoResponder & Logs",
    copy: "Replace five separate utility bots at once. Host role-gated giveaways with instant rerolls, build up to 50 smart keyword AutoResponders, route 6 dedicated audit log streams, and export/import full server config backups anytime.",
    points: [
      "Up to 50 exact/contains AutoResponders",
      "Timed giveaways with bypass & ping roles",
      "6-stream audit logging & JSON backups",
    ],
    command: `${prefix}gstart 24h 1w VIP Role`,
    demoTab: "utility",
    highlights: [
      { label: "Triggers", value: "50 Rules" },
      { label: "Audit Logs", value: "6 Streams" },
      { label: "Portability", value: "JSON Backup" },
    ],
  },
];

export const setupSteps = [
  {
    step: "01",
    phase: "AUTHORIZE",
    title: "Add LightCore to Discord",
    copy: `Invite ${site.name} using Discord's official OAuth2 flow and place its role near the top of your role hierarchy so moderation and rollback controls work cleanly.`,
    bullets: [
      "Official discord.com authorization screen",
      "Supports both prefix & slash commands",
      "Zero passwords or external installs ever",
    ],
  },
  {
    step: "02",
    phase: "INITIALIZE",
    title: "Arm the Guard Engine",
    copy: "Run a single command — or pick a 1-click Security Preset in the web dashboard — to arm Anti-Nuke, AutoMod, and server state snapshots immediately.",
    command: `${prefix}antinuke enable`,
    bullets: [
      "Activates all 14 Anti-Nuke rate gates",
      "Snapshots roles, channels & permissions",
      "Pairs with scoped staff whitelists",
    ],
  },
  {
    step: "03",
    phase: "COMMAND",
    title: "Customize Every Module",
    copy: "Fine-tune thresholds, design welcome & announcement embeds, deploy ticket panels, set up VoiceMaster, and export JSON backups from one unified control panel.",
    quadrants: [
      { title: "Whitelists", copy: "Scoped staff & extra owner trust" },
      { title: "12 Modules", copy: "Security, voice, tickets & embeds" },
      { title: "Audit Streams", copy: "6 dedicated event log channels" },
      { title: "Config Backup", copy: "1-click JSON export & presets" },
    ],
  },
] as const;

export const protocolStages = [
  {
    stage: "STAGE 01",
    badge: "INTERCEPT",
    title: "Gateway Event Intake",
    copy: "Subscribes directly to Discord guild audit and gateway events — bans, kicks, channel/role edits, webhook spawns, and message bursts — as they arrive.",
    detail: "Monitors 14 destructive event classes + 8 message heuristics",
  },
  {
    stage: "STAGE 02",
    badge: "VERIFY",
    title: "Trust & Whitelist Check",
    copy: "Cross-checks the acting user and their roles against server owner status, extra owners, and module-scoped whitelist grants stored in memory cache.",
    detail: "Supports All, Ban/Kick, Channels, Roles, Webhooks & Bot scopes",
  },
  {
    stage: "STAGE 03",
    badge: "EVALUATE",
    title: "Rolling Rate-Gate Engine",
    copy: "Evaluates action velocity inside your configured sliding window (e.g. max 2 channel deletes per 60s), plus Anti-Betray anomaly checks for staff.",
    detail: "Customizable 1–30 action thresholds across 10s–3600s windows",
  },
  {
    stage: "STAGE 04",
    badge: "RESTORE",
    title: "Mitigation & State Rollback",
    copy: "Executes your configured sanction (ban, kick, role strip, or quarantine), reconstructs affected channels/roles from snapshot, and posts a full audit entry.",
    detail: "Chronological security log routed straight to your alert channel",
  },
] as const;

export const voiceCards = [
  {
    kicker: "In-Chat Owner Console",
    title: "Lock, ghost, set member caps, rename, claim, or permit friends right from the built-in room interface.",
  },
  {
    kicker: "One-Command Deployment",
    title: "Auto-creates the VoiceMaster category, Join-to-Create hub, and button panel with custom room templates.",
  },
  {
    kicker: "Studio Audio & Zero Clutter",
    title: "Configure 64 to 384 kbps bitrate defaults and automatic deletion the moment the last member disconnects.",
  },
] as const;

export const modules = [
  "Anti-Nuke",
  "Anti-Raid",
  "Anti-Token Spam",
  "Anti-Betray",
  "Vanity Guard",
  "AutoMod",
  "Phishing Filter",
  "Anti-Invite",
  "Anti-Zalgo",
  "Mass Mention",
  "Verification",
  "Account-Age Gate",
  "Night Mode",
  "Instant Lockdown",
  "VoiceMaster",
  "Ticket Desk",
  "HTML Transcripts",
  "Welcomer Embeds",
  "Embed Studio",
  "AutoRole",
  "Sticky Nicks",
  "Scoped Whitelist",
  "Extra Owners",
  "Role Guard",
  "Channel Guard",
  "Webhook Guard",
  "Auto-Rollback",
  "Giveaways",
  "AutoResponder",
  "6-Stream Logs",
  "Security Presets",
  "JSON Backups",
] as const;

export const marqueeRowOne = [
  { tag: "SECURITY", name: "Anti Mass Ban & Kick" },
  { tag: "SECURITY", name: "Channel & Role Rollback" },
  { tag: "PRO", name: "Vanity URL Protection" },
  { tag: "SECURITY", name: "Rogue Bot Quarantine" },
  { tag: "SECURITY", name: "Webhook Nuke Blocker" },
  { tag: "PLUS", name: "Anti-Betray Burst Shield" },
  { tag: "AUTOMOD", name: "Phishing & Invite Filter" },
  { tag: "GATE", name: "Captcha & Button Verify" },
] as const;

export const marqueeRowTwo = [
  { tag: "VOICE", name: "Join-to-Create VoiceMaster" },
  { tag: "SUPPORT", name: "Threaded Ticket Panels" },
  { tag: "SHIELD", name: "Timezone Night Mode" },
  { tag: "STUDIO", name: "Custom Embed Builder" },
  { tag: "ONBOARD", name: "Rich Welcomer & AutoRole" },
  { tag: "ENGAGE", name: "Giveaways & AutoResponder" },
  { tag: "AUDIT", name: "6-Channel Event Streams" },
  { tag: "CONTROL", name: "JSON Config Export & Sync" },
] as const;

export const faqs = [
  {
    q: `What makes ${site.name} an all-in-one Discord bot?`,
    a: `${site.name} combines 14-rule Anti-Nuke protection, an 8-layer AutoMod firewall, member Verification, scheduled Night Mode, Join-to-Create VoiceMaster, multi-category Tickets with HTML transcripts, Welcomer embeds, AutoRole, a custom Embed Studio, AutoResponders, Giveaways, and 6-channel Audit Logging inside one lightweight bot and web dashboard.`,
  },
  {
    q: "Is signing in with Discord on this website safe?",
    a: `Yes. Authentication happens exclusively on Discord's official website (discord.com) using standard OAuth2 (identify, guilds, and guilds.join to show your servers and automatically welcome you into our official Discord server). ${site.name} never sees your password, email, DMs, or payment info, and you can also explore everything first in our no-login Demo Dashboard.`,
  },
  {
    q: "Will Anti-Nuke accidentally punish my trusted moderators?",
    a: "Never when whitelisted. Server owners automatically bypass every gate, you can designate trusted co-owners via Extra Owners, and you can grant granular scoped exemptions (Ban/Kick, Channels, Roles, Webhooks, Bots, or All) plus bypass roles for senior staff.",
  },
  {
    q: "Can damaged channels and roles be recovered after a nuke attempt?",
    a: "Yes. With Automatic Rollback enabled, confirmed rate-gate breaches trigger your selected sanction (Ban, Kick, Strip Roles, or Quarantine) alongside automated restoration of deleted channels, roles, and server settings, with every step recorded in your security log channel.",
  },
  {
    q: "What permissions does the bot need in my server?",
    a: `The standard invite link requests Administrator permission so Anti-Nuke, AutoRole, Night Mode, VoiceMaster, and Tickets can operate across channels seamlessly. Always place the ${site.name} role above the roles you want it to manage, and review permissions on Discord before authorizing.`,
  },
  {
    q: "Can I test the full web dashboard before inviting or logging in?",
    a: "Yes! Click 'Try Live Demo' anywhere on the site to open our interactive Demo Server Studio. You can toggle all 12 modules, test 1-click security presets, build custom Discord embeds, preview welcome and ticket cards, and generate setup commands instantly.",
  },
  {
    q: "Can I change the command prefix or export my server settings?",
    a: `Absolutely. Change the default "${prefix}" prefix to any 1–5 character trigger from General Settings or via ${prefix}setprefix, enable No-Prefix mode on Pro/Ultra plans, and export or import your complete server configuration as a portable JSON backup anytime.`,
  },
  {
    q: "How does LightCore Premium work?",
    a: "Core Anti-Nuke, AutoMod, Verification, Night Mode, VoiceMaster, Tickets, Welcomer, and Logging are free to configure. Plus, Pro, and Ultra Pro unlock advanced perks like Anti-Betray, Vanity URL Guard, No-Prefix, and a Custom Branded Bot — no payment details are ever collected on this website; simply generate an order summary and open a ticket in our official Support Server.",
  },
] as const;
