export type CommandCategory =
  | "Anti-Nuke"
  | "Whitelist"
  | "AutoMod"
  | "Verification"
  | "Night Mode"
  | "Moderation"
  | "VoiceMaster"
  | "Tickets"
  | "Welcomer"
  | "Logging"
  | "Utility"
  | "Premium";

export type BotCommandSpec = {
  name: string;
  args?: string;
  category: CommandCategory;
  desc: string;
  permission: "Everyone" | "Manage Messages" | "Manage Channels" | "Moderate Members" | "Ban Members" | "Manage Server" | "Administrator" | "Server Owner";
  aliases?: string[];
  tier?: "Plus" | "Pro" | "Ultra";
  example?: string;
};

export const COMMAND_CATEGORIES: {
  id: "All" | CommandCategory;
  label: string;
  summary: string;
}[] = [
  { id: "All", label: "All Commands", summary: "Complete LightCore command catalog" },
  { id: "Anti-Nuke", label: "Anti-Nuke", summary: "14 real-time anti-nuke guards, rate limits & state rollback" },
  { id: "Whitelist", label: "Whitelist", summary: "Scoped trust overrides, extra owners & bypass roles" },
  { id: "AutoMod", label: "AutoMod", summary: "Layered anti-spam, phishing, invite, mention & token-raid filters" },
  { id: "Verification", label: "Verification", summary: "Button & captcha member gates with account-age screening" },
  { id: "Night Mode", label: "Night Mode", summary: "Scheduled overnight freezes & emergency server lockdown" },
  { id: "Moderation", label: "Moderation", summary: "Bans, kicks, timeouts, warnings, purges, locks & AutoRole" },
  { id: "VoiceMaster", label: "VoiceMaster", summary: "Join-to-create personal voice rooms & live room controls" },
  { id: "Tickets", label: "Tickets", summary: "Multi-category support panels, staff claim & HTML transcripts" },
  { id: "Welcomer", label: "Welcomer", summary: "Dynamic join/leave embeds, DM greetings & custom banners" },
  { id: "Logging", label: "Logging", summary: "6-channel chronological audit streams across all guild events" },
  { id: "Utility", label: "Utility & GWs", summary: "AutoResponders, custom embeds, giveaways, AFK & server info" },
  { id: "Premium", label: "Premium", summary: "No-prefix mode, subscription status & server slot controls" },
];

export const BOT_COMMANDS: BotCommandSpec[] = [
  // Anti-Nuke
  {
    name: "antinuke enable",
    category: "Anti-Nuke",
    desc: "Initialize all 14 destructive-action guards, rate gates, and server state snapshots.",
    permission: "Server Owner",
    aliases: ["an enable", "an on"],
    example: "antinuke enable",
  },
  {
    name: "antinuke disable",
    category: "Anti-Nuke",
    desc: "Pause active Anti-Nuke interception while retaining saved thresholds and whitelists.",
    permission: "Server Owner",
    aliases: ["an disable", "an off"],
  },
  {
    name: "antinuke status",
    category: "Anti-Nuke",
    desc: "Inspect every armed Anti-Nuke guard, active punishment mode, and rollback readiness.",
    permission: "Administrator",
    aliases: ["an config", "an show"],
  },
  {
    name: "antinuke punishment",
    args: "<ban|kick|strip|quarantine>",
    category: "Anti-Nuke",
    desc: "Set the automatic sanction applied when a non-whitelisted actor breaches a rate limit.",
    permission: "Server Owner",
    example: "antinuke punishment ban",
  },
  {
    name: "limits",
    args: "<guard> <count> [windowSec]",
    category: "Anti-Nuke",
    desc: "Configure per-actor rolling rate thresholds for bans, kicks, channels, roles, or webhooks.",
    permission: "Server Owner",
    aliases: ["limit", "rategate"],
    tier: "Plus",
    example: "limits ban 3 60",
  },
  {
    name: "rollback",
    args: "[on|off|now]",
    category: "Anti-Nuke",
    desc: "Toggle automatic restoration of deleted channels, roles, and permissions after an incident.",
    permission: "Server Owner",
    example: "rollback on",
  },
  {
    name: "antibetray",
    args: "<on|off>",
    category: "Anti-Nuke",
    desc: "Monitor whitelisted administrators for abnormal high-velocity burst spikes and freeze access.",
    permission: "Server Owner",
    tier: "Plus",
    example: "antibetray on",
  },
  {
    name: "vanityguard",
    args: "<on|off>",
    category: "Anti-Nuke",
    desc: "Lock your server's custom vanity invite URL and revert unauthorized modifications.",
    permission: "Server Owner",
    tier: "Pro",
    example: "vanityguard on",
  },
  {
    name: "antibot",
    args: "<on|off>",
    category: "Anti-Nuke",
    desc: "Automatically quarantine or remove unverified bots added without owner authorization.",
    permission: "Server Owner",
    example: "antibot on",
  },
  {
    name: "antiwebhook",
    args: "<on|off>",
    category: "Anti-Nuke",
    desc: "Delete unauthorized webhooks on creation and sanction the responsible actor.",
    permission: "Server Owner",
  },

  // Whitelist
  {
    name: "whitelist add",
    args: "<@user> [scope]",
    category: "Whitelist",
    desc: "Grant a trusted staff member full or module-scoped exemption from Anti-Nuke gates.",
    permission: "Server Owner",
    aliases: ["wl add", "wl"],
    example: "whitelist add @HeadMod channels",
  },
  {
    name: "whitelist remove",
    args: "<@user>",
    category: "Whitelist",
    desc: "Revoke a member's Anti-Nuke whitelist privileges immediately.",
    permission: "Server Owner",
    aliases: ["wl remove", "unwl"],
  },
  {
    name: "whitelist list",
    category: "Whitelist",
    desc: "Display all whitelisted staff members along with their exact granted scopes.",
    permission: "Administrator",
    aliases: ["wl show"],
  },
  {
    name: "whitelist reset",
    category: "Whitelist",
    desc: "Clear the entire Anti-Nuke user whitelist after owner confirmation.",
    permission: "Server Owner",
  },
  {
    name: "extraowner set",
    args: "<@user>",
    category: "Whitelist",
    desc: "Authorize a trusted co-owner to manage Anti-Nuke and Whitelist settings alongside you.",
    permission: "Server Owner",
    aliases: ["eo add"],
    example: "extraowner set @CoOwner",
  },
  {
    name: "extraowner remove",
    args: "<@user>",
    category: "Whitelist",
    desc: "Remove co-owner security clearance from a user.",
    permission: "Server Owner",
    aliases: ["eo remove"],
  },
  {
    name: "mainrole",
    args: "<add|remove|list> [@role]",
    category: "Whitelist",
    desc: "Manage trusted bypass roles that pass AutoMod filters and standard rate limits.",
    permission: "Administrator",
    example: "mainrole add @Moderators",
  },

  // AutoMod
  {
    name: "automod strict",
    category: "AutoMod",
    desc: "Enable the complete high-sensitivity content firewall across spam, links, invites, and mentions.",
    permission: "Manage Server",
    aliases: ["am strict"],
    example: "automod strict",
  },
  {
    name: "automod config",
    category: "AutoMod",
    desc: "View active AutoMod filters, allowed domains, punishment tier, and log channel.",
    permission: "Manage Server",
    aliases: ["am status"],
  },
  {
    name: "antispam",
    args: "<on|off> [maxMsgs] [seconds]",
    category: "AutoMod",
    desc: "Detect and mute rapid message floods from a single user inside a rolling window.",
    permission: "Manage Server",
    example: "antispam on 5 10",
  },
  {
    name: "antilink",
    args: "<on|off|allow> [domain]",
    category: "AutoMod",
    desc: "Block unauthorized external URLs and phishing links while allowing trusted domains.",
    permission: "Manage Server",
    example: "antilink allow youtube.com",
  },
  {
    name: "antiinvite",
    args: "<on|off>",
    category: "AutoMod",
    desc: "Automatically delete external Discord invite advertisements posted in chat.",
    permission: "Manage Server",
  },
  {
    name: "antimention",
    args: "<on|off> [maxMentions]",
    category: "AutoMod",
    desc: "Stop mass user/role mention floods and ghost-ping bursts.",
    permission: "Manage Server",
    example: "antimention on 5",
  },
  {
    name: "antitoken",
    args: "<on|off> [joinsPer10s]",
    category: "AutoMod",
    desc: "Intercept coordinated automated join waves and synchronized raid spam.",
    permission: "Administrator",
    tier: "Plus",
    example: "antitoken on 8",
  },
  {
    name: "antizalgo",
    args: "<on|off>",
    category: "AutoMod",
    desc: "Strip corrupted combining Unicode characters and client-lag text payloads.",
    permission: "Manage Server",
  },
  {
    name: "badwords",
    args: "<add|remove|list> [word]",
    category: "AutoMod",
    desc: "Maintain your server's custom blocked keyword and scam-phrase dictionary.",
    permission: "Manage Server",
    example: "badwords add spam-phrase",
  },

  // Verification
  {
    name: "verify setup",
    args: "<#channel> <@verifiedRole>",
    category: "Verification",
    desc: "Deploy an interactive verification gate panel so joining members unlock access cleanly.",
    permission: "Administrator",
    example: "verify setup #verify @Member",
  },
  {
    name: "verify mode",
    args: "<button|captcha|code>",
    category: "Verification",
    desc: "Switch between 1-click button verification, image captcha, or 6-digit challenge code.",
    permission: "Administrator",
    example: "verify mode captcha",
  },
  {
    name: "verify minage",
    args: "<days>",
    category: "Verification",
    desc: "Hold newly created Discord accounts younger than the configured day threshold.",
    permission: "Administrator",
    example: "verify minage 7",
  },
  {
    name: "antiraid",
    args: "<on|off>",
    category: "Verification",
    desc: "Pause invites and elevate verification challenges when abnormal join spikes occur.",
    permission: "Administrator",
    example: "antiraid on",
  },

  // Night Mode
  {
    name: "nightmode",
    args: "<HH:MM> <HH:MM> [timezone]",
    category: "Night Mode",
    desc: "Schedule automatic overnight channel freeze and dangerous-permission snapshot until morning.",
    permission: "Administrator",
    aliases: ["nm"],
    example: "nightmode 00:00 08:00 Asia/Kolkata",
  },
  {
    name: "nightmode off",
    category: "Night Mode",
    desc: "Disable the nightly schedule and immediately restore any snapshotted permissions.",
    permission: "Administrator",
  },
  {
    name: "lockdown",
    args: "[reason]",
    category: "Night Mode",
    desc: "Trigger an immediate emergency freeze across public channels and high-risk staff perms.",
    permission: "Administrator",
    example: "lockdown Active raid mitigation",
  },
  {
    name: "unlockdown",
    category: "Night Mode",
    desc: "Lift an active server lockdown and restore every channel to its prior state.",
    permission: "Administrator",
  },

  // Moderation
  {
    name: "ban",
    args: "<@user> [reason]",
    category: "Moderation",
    desc: "Permanently ban a member, send an optional DM case notice, and record an audit case.",
    permission: "Ban Members",
    example: "ban @Raider Spam raid",
  },
  {
    name: "unban",
    args: "<userId> [reason]",
    category: "Moderation",
    desc: "Revoke a member's server ban by Discord ID and log the reinstatement.",
    permission: "Ban Members",
  },
  {
    name: "kick",
    args: "<@user> [reason]",
    category: "Moderation",
    desc: "Remove a member from the server and log the case in your mod-log channel.",
    permission: "Moderate Members",
  },
  {
    name: "mute",
    args: "<@user> <duration> [reason]",
    category: "Moderation",
    desc: "Apply a timed Discord timeout or configured Muted role with case logging.",
    permission: "Moderate Members",
    aliases: ["timeout"],
    example: "mute @User 30m Flood spam",
  },
  {
    name: "unmute",
    args: "<@user>",
    category: "Moderation",
    desc: "Lift an active timeout or remove the Muted role from a member.",
    permission: "Moderate Members",
  },
  {
    name: "warn",
    args: "<@user> <reason>",
    category: "Moderation",
    desc: "Issue a tracked strike that automatically triggers mute/ban escalation thresholds.",
    permission: "Moderate Members",
    aliases: ["strike"],
    example: "warn @User Advertising in general",
  },
  {
    name: "warnings",
    args: "<@user>",
    category: "Moderation",
    desc: "Inspect or clear recorded moderation strikes for a server member.",
    permission: "Moderate Members",
    aliases: ["warns", "cases"],
  },
  {
    name: "purge",
    args: "<amount> [@user|bots|links]",
    category: "Moderation",
    desc: "Bulk-delete up to 1,000 recent messages with optional author, bot, or link filters.",
    permission: "Manage Messages",
    aliases: ["clear", "prune"],
    example: "purge 50 bots",
  },
  {
    name: "lock",
    args: "[#channel]",
    category: "Moderation",
    desc: "Freeze @everyone message sending in the current or specified text channel.",
    permission: "Manage Channels",
    aliases: ["unlock"],
  },
  {
    name: "hide",
    args: "[#channel]",
    category: "Moderation",
    desc: "Hide or unhide the current channel from @everyone view permissions.",
    permission: "Manage Channels",
    aliases: ["unhide"],
  },
  {
    name: "slowmode",
    args: "<seconds> [#channel]",
    category: "Moderation",
    desc: "Adjust per-user message cooldown in a channel during high-traffic moments.",
    permission: "Manage Channels",
    example: "slowmode 5",
  },
  {
    name: "autorole",
    args: "<humans|bots> <@role>",
    category: "Moderation",
    desc: "Automatically grant designated roles when verified humans or bots join the guild.",
    permission: "Manage Server",
    example: "autorole humans @Member",
  },
  {
    name: "stickynick",
    args: "<on|off>",
    category: "Moderation",
    desc: "Preserve and re-apply member nicknames automatically if they leave and rejoin.",
    permission: "Manage Server",
  },

  // VoiceMaster
  {
    name: "voicemaster setup",
    category: "VoiceMaster",
    desc: "Create the VoiceMaster category, Join-to-Create hub, and interactive control panel.",
    permission: "Manage Server",
    aliases: ["vm setup"],
    example: "voicemaster setup",
  },
  {
    name: "vc lock",
    category: "VoiceMaster",
    desc: "Lock your personal temporary voice room so only permitted members can connect.",
    permission: "Everyone",
    aliases: ["vc unlock"],
  },
  {
    name: "vc hide",
    category: "VoiceMaster",
    desc: "Turn your temporary voice channel into a hidden ghost room invisible to non-members.",
    permission: "Everyone",
    aliases: ["vc unhide"],
  },
  {
    name: "vc limit",
    args: "<0-99>",
    category: "VoiceMaster",
    desc: "Set the maximum member capacity of your personal voice channel (0 for unlimited).",
    permission: "Everyone",
    example: "vc limit 5",
  },
  {
    name: "vc rename",
    args: "<name>",
    category: "VoiceMaster",
    desc: "Rename your active VoiceMaster room right from chat.",
    permission: "Everyone",
    example: "vc rename Ranked Squad",
  },
  {
    name: "vc permit",
    args: "<@user>",
    category: "VoiceMaster",
    desc: "Grant or revoke a specific user's access to join your locked/hidden room.",
    permission: "Everyone",
    aliases: ["vc reject"],
  },
  {
    name: "vc claim",
    category: "VoiceMaster",
    desc: "Claim room ownership if the original creator has disconnected from the channel.",
    permission: "Everyone",
  },

  // Tickets
  {
    name: "ticket setup",
    args: "[#channel]",
    category: "Tickets",
    desc: "Deploy an interactive multi-category support ticket panel with staff routing.",
    permission: "Manage Server",
    example: "ticket setup #support",
  },
  {
    name: "ticket close",
    args: "[reason]",
    category: "Tickets",
    desc: "Close the current ticket and archive an HTML transcript to your transcript channel.",
    permission: "Manage Messages",
  },
  {
    name: "ticket claim",
    category: "Tickets",
    desc: "Assign yourself as the handling staff member on an open support ticket.",
    permission: "Manage Messages",
  },
  {
    name: "ticket add",
    args: "<@user>",
    category: "Tickets",
    desc: "Add or remove an extra user from the current private ticket thread.",
    permission: "Manage Messages",
    aliases: ["ticket remove"],
  },
  {
    name: "ticket transcript",
    category: "Tickets",
    desc: "Generate an on-demand HTML message transcript of the active support ticket.",
    permission: "Manage Messages",
  },

  // Welcomer
  {
    name: "greet setup",
    args: "<#channel>",
    category: "Welcomer",
    desc: "Configure automated welcome embeds with dynamic {user}, {server}, and {membercount} tags.",
    permission: "Manage Server",
    aliases: ["welcome setup"],
    example: "greet setup #welcome",
  },
  {
    name: "greet test",
    category: "Welcomer",
    desc: "Send a live preview of your configured welcome embed into the welcome channel.",
    permission: "Manage Server",
  },
  {
    name: "leave setup",
    args: "<#channel>",
    category: "Welcomer",
    desc: "Configure member departure messages in a dedicated farewell or staff channel.",
    permission: "Manage Server",
  },

  // Logging
  {
    name: "logall",
    args: "<#channel>",
    category: "Logging",
    desc: "Bind all 6 audit streams (security, mod, message, member, voice, server) in one command.",
    permission: "Administrator",
    example: "logall #audit-logs",
  },
  {
    name: "modlog",
    args: "<#channel>",
    category: "Logging",
    desc: "Route moderation bans, kicks, timeouts, warnings, and purges to a dedicated room.",
    permission: "Manage Server",
  },
  {
    name: "msglog",
    args: "<#channel>",
    category: "Logging",
    desc: "Log edited and deleted messages with timestamps, channel links, and author tags.",
    permission: "Manage Server",
  },
  {
    name: "voicelog",
    args: "<#channel>",
    category: "Logging",
    desc: "Track voice channel joins, moves, disconnects, and VoiceMaster room lifecycle.",
    permission: "Manage Server",
  },

  // Utility & Giveaways
  {
    name: "autoresponder add",
    args: "<trigger> | <reply>",
    category: "Utility",
    desc: "Create an automatic exact-match or keyword-contains bot reply for common questions.",
    permission: "Manage Server",
    aliases: ["ar add"],
    example: "autoresponder add rules | Please read #rules!",
  },
  {
    name: "embed create",
    args: "<#channel> <json>",
    category: "Utility",
    desc: "Post a custom rich embed designed in the LightCore Dashboard Embed Studio.",
    permission: "Manage Messages",
    example: "embed create #announcements {...}",
  },
  {
    name: "gstart",
    args: "<duration> <winners> <prize>",
    category: "Utility",
    desc: "Launch an interactive giveaway with timer countdown and automatic winner drawing.",
    permission: "Manage Server",
    tier: "Pro",
    example: "gstart 24h 2w VIP Server Role",
  },
  {
    name: "greroll",
    args: "<messageId>",
    category: "Utility",
    desc: "Draw a replacement winner for a completed giveaway fairly and transparently.",
    permission: "Manage Server",
    aliases: ["gend"],
  },
  {
    name: "setprefix",
    args: "<newPrefix>",
    category: "Utility",
    desc: "Change LightCore's command trigger symbol for your Discord server (up to 5 chars).",
    permission: "Administrator",
    aliases: ["prefix"],
    example: "setprefix !",
  },
  {
    name: "serverinfo",
    category: "Utility",
    desc: "Display rich guild analytics, boost tier, role counts, verification level, and security posture.",
    permission: "Everyone",
    aliases: ["si", "userinfo", "avatar"],
  },
  {
    name: "afk",
    args: "[reason]",
    category: "Utility",
    desc: "Set an AFK status so LightCore notifies anyone who mentions you until you return.",
    permission: "Everyone",
    example: "afk Studying — back in 2h",
  },
  {
    name: "help",
    args: "[command|module]",
    category: "Utility",
    desc: "Open LightCore's interactive categorized command menu inside Discord.",
    permission: "Everyone",
    aliases: ["h", "commands"],
  },

  // Premium
  {
    name: "noprefix",
    args: "<add|remove|list> [@user]",
    category: "Premium",
    desc: "Toggle effortless prefix-free command execution on eligible Pro and Ultra accounts.",
    permission: "Everyone",
    aliases: ["np"],
    tier: "Pro",
    example: "noprefix add @me",
  },
  {
    name: "premium status",
    category: "Premium",
    desc: "Check your active LightCore Premium tier, unlocked perks, assigned guild, and expiry countdown.",
    permission: "Everyone",
    aliases: ["validity", "plan"],
  },
];

export function formatCommand(
  spec: Pick<BotCommandSpec, "name" | "args" | "example">,
  prefix: string,
  useExample = false,
): string {
  const p = prefix || ".";
  if (useExample && spec.example) return `${p}${spec.example}`;
  return spec.args ? `${p}${spec.name} ${spec.args}` : `${p}${spec.name}`;
}
