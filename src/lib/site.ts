export const site = {
  name: "XIERON",
  tagline: "XIERON SECURITY",
  description:
    "Real-time raid prevention, auto-moderation, and nuke blocking. Keep your Discord server protected around the clock, with zero setup latency.",
  url: "https://xieron.com",
  invite:
    "https://discord.com/oauth2/authorize?client_id=1391639072405196932&permissions=8&scope=bot%20applications.commands",
  dashboard: "/login",
  discord: "https://discord.gg/xieron",
} as const;

export const nav = [
  { label: "Features", href: "#features" },
  { label: "Setup", href: "#setup" },
  { label: "Protocol", href: "#protocol" },
  { label: "VoiceMaster", href: "#voicemaster" },
  { label: "FAQ", href: "#faq" },
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
    command: "&antinuke enable",
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
    command: "&automod strict",
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
    command: "&nightmode 00:00 08:00",
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
    command: "&ticket setup",
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
    command: "/voicemaster setup",
  },
];

export const stats = [
  { value: 2.4, suffix: "M+", label: "Servers Protected", hint: "guilds", decimals: 1 },
  { value: 38, suffix: "M+", label: "Users Safeguarded", hint: "members", decimals: 0 },
  { value: 99.99, suffix: "%", label: "Uptime Guaranteed", hint: "SLA", decimals: 2 },
  { value: 480, suffix: "ms", label: "Avg. Response Time", hint: "median", decimals: 0 },
] as const;

export type Partner = {
  name: string;
  members: string;
  icon: string;
  short?: string;
  verified?: boolean;
};

export const partners: Partner[] = [
  {
    name: "Relationship 💕 | Dating 18+ ・Active・Social・VC・Egirls・Gaming・edating",
    short: "Relationship 💕",
    members: "180,463 members",
    icon: "850309920133873664/a_6259712d1ec7ecca6e153404add48b33.gif",
  },
  {
    name: "TheRawKnee",
    members: "145,437 members",
    icon: "341192458019012609/a_d3737f379b68bd78f943b3c554c1b65a.gif",
    verified: true,
  },
  {
    name: "UnGraduate Gamer",
    members: "139,158 members",
    icon: "570963836408954920/ebceaf4465fcb5872cd938dddc242184.png",
  },
  {
    name: "Ayush More",
    members: "97,086 members",
    icon: "757673765726453823/f3744e9f2c5c1bdf56ed9029a081761b.png",
    verified: true,
  },
  {
    name: "Basu City",
    members: "36,635 members",
    icon: "904309763888807987/a_abb0d0964ebcacb51b753c0ac47f0954.gif",
    verified: true,
  },
  {
    name: "PRASHANT GAMER",
    members: "19,071 members",
    icon: "1203645499597652028/a_99a45802cfc48555efdf24ea41c65fd4.gif",
  },
  {
    name: "BetterDark",
    members: "12,287 members",
    icon: "1319276768712200243/4b27ef4f8425a89685356bf3d9ed50e1.png",
  },
  {
    name: "ADITECH ARMY",
    members: "26,240 members",
    icon: "671189230164115501/408c240003377d44fee74c3d99fe83c6.png",
  },
  {
    name: "Burnout . GG",
    members: "39,668 members",
    icon: "1114118166998679632/a_82704138b1f31cbc5eea9fff07fdde3b.gif",
  },
  {
    name: "heavencloud.in",
    members: "14,814 members",
    icon: "1404309800518549534/6dd23ddd8b8f4df06e3e360a5fcfc04a.png",
  },
  {
    name: "Skelly⚡Kingdom",
    members: "13,618 members",
    icon: "1368164676721971241/a_7148c4747cc5ae9d63e25eb9eb098618.gif",
  },
  {
    name: "Mani 22",
    members: "33,724 members",
    icon: "993725349387051070/07e56e7cf782a9caa860d2d71a78eb83.png",
  },
  {
    name: "Takila Blox",
    members: "25,088 members",
    icon: "1214910672719319060/95c6c7da0a3f940067b31adbf2d264f7.png",
  },
  {
    name: "FOZYAJAY",
    members: "24,570 members",
    icon: "641247475822493702/6080e5dfea536ec6e6e8cd882902e2fa.png",
  },
  {
    name: "Sujal Mundlia",
    members: "101,557 members",
    icon: "1122546853074960456/3c72f442c47279b756398a0aad6d15cd.png",
  },
  {
    name: "Bug Wheel",
    members: "50,935 members",
    icon: "779246640648683540/c9faef4fa3e1e269500a54ef7495837c.png",
  },
  {
    name: "/cutecafe 🎀 •⩊• egirl ♡ social ♡ vc ♡ active ♡ ask to dm",
    short: "/cutecafe 🎀",
    members: "99,301 members",
    icon: "1370442573889671318/9a5675796cecf13788142813a3823a4f.png",
  },
  {
    name: "/smex 🎀",
    members: "100,945 members",
    icon: "374050847379685379/b66bdc5e773a971958287aaf5067dda7.png",
  },
  {
    name: "/babies 🎀 •⩊• social ♡ vc ♡ active",
    short: "/babies 🎀",
    members: "108,916 members",
    icon: "1353636298249863199/cf502684f5f9fb5790a5afddd8797693.png",
  },
  {
    name: "Ratings™ | E-Girls | SFW・Roles・Social・Rate・Community・Chat・VC・Gaming・E-life・Nitro・Anime・Chill・",
    short: "Ratings™",
    members: "344,879 members",
    icon: "1002105365829259264/a_6ee0d93532bfe6e32bfae0a5e9442527.gif",
  },
  {
    name: "First Love .™、♡ || Chilling • Indian & International Community • Gaming • Hangout • Vc • Events!",
    short: "First Love .™",
    members: "34,941 members",
    icon: "1004262053181136996/a_5645338609fe3c5e40eefdbbc9a9d667.gif",
  },
  {
    name: "۶ৎ /Aesthetic .",
    members: "48,337 members",
    icon: "733296721731387493/a_48c9cbfc65b8db93cfaaea879f1bfad8.gif",
  },
  {
    name: "Nata Citizen‛s",
    members: "56,403 members",
    icon: "1104565172183515218/5bcf07d519dadc0b4f3d32bc25b11a0a.png",
  },
  {
    name: "Λgєиτѕ Λямγ™",
    members: "56,884 members",
    icon: "1534611665511911546/fde1e1d405a991b33872b22947f5e601.png",
  },
  {
    name: "Dialing 📞 Active VC Server Hangout Voice Chat Call Social Chill Egirl Ask To DM",
    short: "Dialing 📞",
    members: "89,383 members",
    icon: "1379056322514911315/b1d5169c5ec296e342d3963f41113679.png",
  },
  {
    name: "LivingLegend's Hometown",
    members: "25,817 members",
    icon: "1116639606985728070/a_d27a90d93609d7349c1aed34ad574536.gif",
  },
];

export const setupSteps = [
  {
    step: "01",
    phase: "AUTH",
    title: "Invite the Bot",
    copy: "Integrate Xieron into your guild instantly. A single authorization step securely binds the guard engine to your server with optimized administrative privileges.",
    bullets: [
      "Instant OAuth2 gateway link",
      "Requires Manage Server permission only",
      "Pre-configured secure default hierarchy",
    ],
  },
  {
    step: "02",
    phase: "ACTIVATE",
    title: "Initialize Anti-Nuke",
    copy: "Run the setup trigger command to configure database state and start active scanning.",
    command: "&antinuke enable",
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
    q: "How fast does Xieron react to a nuke attempt?",
    a: "Gateway events are intercepted in-process and evaluated against per-actor rate gates before the action is committed. Median detection-to-mitigation latency is 480ms, and rollback begins immediately after a threat is confirmed.",
  },
  {
    q: "What permissions does the bot need?",
    a: "Only what is required to defend your server: Manage Server plus the moderation scopes for the modules you enable. Administrative access is optional and never assumed by default.",
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
    a: "Under 30 seconds. Invite the bot, run &antinuke enable, and the default hierarchy, caches and all 26 modules initialise automatically. Fine-tuning happens in the dashboard whenever you want it.",
  },
] as const;
