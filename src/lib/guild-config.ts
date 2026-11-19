import { site } from "@/lib/site";

export type AntiNukeRuleKey =
  | "antiBan"
  | "antiKick"
  | "antiBotAdd"
  | "antiChannelCreate"
  | "antiChannelDelete"
  | "antiChannelUpdate"
  | "antiRoleCreate"
  | "antiRoleDelete"
  | "antiRoleUpdate"
  | "antiWebhook"
  | "antiEmoji"
  | "antiGuildUpdate"
  | "antiPrune"
  | "antiEveryone";

export type AntiNukeRule = {
  enabled: boolean;
  limit: number;
  windowSec: number;
};

export const ANTINUKE_RULE_META: {
  key: AntiNukeRuleKey;
  label: string;
  desc: string;
}[] = [
  { key: "antiBan", label: "Anti Mass Ban", desc: "Blocks unauthorized member bans above rate limit" },
  { key: "antiKick", label: "Anti Mass Kick", desc: "Intercepts rapid member kicks by compromised staff" },
  { key: "antiBotAdd", label: "Anti Bot Add", desc: "Instantly quarantines unverified bots added to guild" },
  { key: "antiChannelCreate", label: "Anti Channel Create", desc: "Stops spam channel creation floods" },
  { key: "antiChannelDelete", label: "Anti Channel Delete", desc: "Blocks channel wipes and restores deleted rooms" },
  { key: "antiChannelUpdate", label: "Anti Channel Update", desc: "Prevents unauthorized channel renames & permission edits" },
  { key: "antiRoleCreate", label: "Anti Role Create", desc: "Stops mass role creation attacks" },
  { key: "antiRoleDelete", label: "Anti Role Delete", desc: "Freezes role deletions and restores role hierarchy" },
  { key: "antiRoleUpdate", label: "Anti Role Escalation", desc: "Blocks dangerous Administrator/Manage permission grants" },
  { key: "antiWebhook", label: "Anti Webhook Nuke", desc: "Deletes rogue webhooks and punishes the creator" },
  { key: "antiEmoji", label: "Anti Emoji & Sticker", desc: "Prevents mass deletion of server emojis and stickers" },
  { key: "antiGuildUpdate", label: "Anti Server Update", desc: "Reverts unauthorized server name, icon, or region edits" },
  { key: "antiPrune", label: "Anti Member Prune", desc: "Blocks destructive member prune operations immediately" },
  { key: "antiEveryone", label: "Anti @everyone / @here", desc: "Stops mass ping raids and deletes offending messages" },
];

export type WhitelistUser = {
  id: string;
  tag: string;
  scopes: string[];
};

export type ExtraOwner = {
  id: string;
  tag: string;
};

export type AutoResponderItem = {
  id: string;
  trigger: string;
  response: string;
  match: "exact" | "contains";
};

export type CustomEmbedField = {
  name: string;
  value: string;
  inline: boolean;
};

export type CustomEmbedItem = {
  id: string;
  name: string;
  channel: string;
  author: string;
  title: string;
  description: string;
  color: string;
  imageUrl: string;
  thumbnailUrl: string;
  footer: string;
  timestamp: boolean;
  fields: CustomEmbedField[];
};

export type GuildConfig = {
  general: {
    prefix: string;
    embedColor: string;
    deleteCommands: boolean;
    dmOnPunish: boolean;
    ignoredChannels: string[];
    ignoredRoles: string[];
  };
  antinuke: {
    enabled: boolean;
    punishment: "ban" | "kick" | "strip_roles" | "quarantine";
    autoRollback: boolean;
    antiBetray: boolean;
    vanityGuard: boolean;
    logChannel: string;
    rules: Record<AntiNukeRuleKey, AntiNukeRule>;
  };
  whitelist: {
    users: WhitelistUser[];
    extraOwners: ExtraOwner[];
    bypassRoles: string[];
  };
  automod: {
    enabled: boolean;
    punishment: "timeout_5m" | "timeout_1h" | "warn" | "kick" | "ban";
    logChannel: string;
    antiSpam: { enabled: boolean; maxMessages: number; windowSec: number };
    antiLink: { enabled: boolean; allowedDomains: string[] };
    antiInvite: { enabled: boolean; allowSupportServer: boolean };
    antiMassMention: { enabled: boolean; maxMentions: number };
    antiCaps: { enabled: boolean; percent: number };
    antiBadWords: { enabled: boolean; words: string[] };
    antiZalgo: { enabled: boolean };
    antiTokenSpam: { enabled: boolean; joinRateLimit: number };
  };
  verification: {
    enabled: boolean;
    mode: "button" | "captcha" | "code";
    channel: string;
    verifiedRole: string;
    unverifiedRole: string;
    logChannel: string;
    minAccountAgeDays: number;
    autoRaidPause: boolean;
    dmOnVerify: boolean;
    panelTitle: string;
    panelDescription: string;
    buttonLabel: string;
  };
  nightmode: {
    enabled: boolean;
    lockdownActive: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
    autoOnRaid: boolean;
    stripDangerousPerms: boolean;
    lockChannels: boolean;
    autoRestoreMorning: boolean;
    bypassRole: string;
  };
  moderation: {
    muteRole: string;
    modLogChannel: string;
    warnMuteThreshold: number;
    warnBanThreshold: number;
    humanAutoRole: string;
    botAutoRole: string;
    stickyNicknames: boolean;
  };
  welcomer: {
    enabled: boolean;
    channel: string;
    message: string;
    useEmbed: boolean;
    embedTitle: string;
    bannerUrl: string;
    dmWelcome: boolean;
    leaveEnabled: boolean;
    leaveChannel: string;
    leaveMessage: string;
  };
  voicemaster: {
    enabled: boolean;
    category: string;
    joinChannel: string;
    controlChannel: string;
    nameTemplate: string;
    defaultLimit: number;
    bitrateKbps: number;
    sendInterface: boolean;
    autoCleanup: boolean;
  };
  tickets: {
    enabled: boolean;
    panelChannel: string;
    category: string;
    staffRole: string;
    transcriptChannel: string;
    panelTitle: string;
    panelDescription: string;
    maxOpenPerUser: number;
    saveTranscripts: boolean;
    categories: string[];
  };
  logging: {
    enabled: boolean;
    allChannel: string;
    modChannel: string;
    securityChannel: string;
    messageChannel: string;
    memberChannel: string;
    voiceChannel: string;
    serverChannel: string;
    events: {
      mod: boolean;
      security: boolean;
      messages: boolean;
      members: boolean;
      voice: boolean;
      server: boolean;
    };
  };
  utility: {
    autoResponders: AutoResponderItem[];
    embeds: CustomEmbedItem[];
    giveaways: {
      enabled: boolean;
      managerRole: string;
      pingRole: string;
      emoji: string;
      bypassRole: string;
    };
  };
  updatedAt: string | null;
  updatedBy: string | null;
};

export function createDefaultGuildConfig(): GuildConfig {
  return {
    general: {
      prefix: site.prefix,
      embedColor: "#facc15",
      deleteCommands: false,
      dmOnPunish: true,
      ignoredChannels: [],
      ignoredRoles: [],
    },
    antinuke: {
      enabled: true,
      punishment: "ban",
      autoRollback: true,
      antiBetray: false,
      vanityGuard: false,
      logChannel: "",
      rules: {
        antiBan: { enabled: true, limit: 3, windowSec: 60 },
        antiKick: { enabled: true, limit: 3, windowSec: 60 },
        antiBotAdd: { enabled: true, limit: 1, windowSec: 60 },
        antiChannelCreate: { enabled: true, limit: 3, windowSec: 60 },
        antiChannelDelete: { enabled: true, limit: 2, windowSec: 60 },
        antiChannelUpdate: { enabled: true, limit: 4, windowSec: 60 },
        antiRoleCreate: { enabled: true, limit: 3, windowSec: 60 },
        antiRoleDelete: { enabled: true, limit: 2, windowSec: 60 },
        antiRoleUpdate: { enabled: true, limit: 3, windowSec: 60 },
        antiWebhook: { enabled: true, limit: 2, windowSec: 60 },
        antiEmoji: { enabled: true, limit: 4, windowSec: 60 },
        antiGuildUpdate: { enabled: true, limit: 1, windowSec: 60 },
        antiPrune: { enabled: true, limit: 1, windowSec: 60 },
        antiEveryone: { enabled: true, limit: 2, windowSec: 60 },
      },
    },
    whitelist: {
      users: [],
      extraOwners: [],
      bypassRoles: [],
    },
    automod: {
      enabled: true,
      punishment: "timeout_5m",
      logChannel: "",
      antiSpam: { enabled: true, maxMessages: 5, windowSec: 10 },
      antiLink: {
        enabled: true,
        allowedDomains: ["discord.com", "youtube.com", "tenor.com"],
      },
      antiInvite: { enabled: true, allowSupportServer: true },
      antiMassMention: { enabled: true, maxMentions: 5 },
      antiCaps: { enabled: false, percent: 70 },
      antiBadWords: { enabled: true, words: [] },
      antiZalgo: { enabled: true },
      antiTokenSpam: { enabled: true, joinRateLimit: 10 },
    },
    verification: {
      enabled: false,
      mode: "button",
      channel: "",
      verifiedRole: "",
      unverifiedRole: "",
      logChannel: "",
      minAccountAgeDays: 3,
      autoRaidPause: true,
      dmOnVerify: false,
      panelTitle: "Verify to Unlock Server",
      panelDescription:
        "Welcome to {server}! Complete verification below to accept our community rules and unlock all channels.",
      buttonLabel: "Verify Account",
    },
    nightmode: {
      enabled: false,
      lockdownActive: false,
      startTime: "00:00",
      endTime: "08:00",
      timezone: "Asia/Kolkata",
      autoOnRaid: true,
      stripDangerousPerms: true,
      lockChannels: true,
      autoRestoreMorning: true,
      bypassRole: "",
    },
    moderation: {
      muteRole: "",
      modLogChannel: "",
      warnMuteThreshold: 3,
      warnBanThreshold: 5,
      humanAutoRole: "",
      botAutoRole: "",
      stickyNicknames: false,
    },
    welcomer: {
      enabled: false,
      channel: "",
      message:
        "Welcome {user} to **{server}**! You are member **#{membercount}**.",
      useEmbed: true,
      embedTitle: "Welcome to {server}",
      bannerUrl: "",
      dmWelcome: false,
      leaveEnabled: false,
      leaveChannel: "",
      leaveMessage: "**{username}** left **{server}**.",
    },
    voicemaster: {
      enabled: false,
      category: "",
      joinChannel: "",
      controlChannel: "",
      nameTemplate: "{user}'s room",
      defaultLimit: 0,
      bitrateKbps: 96,
      sendInterface: true,
      autoCleanup: true,
    },
    tickets: {
      enabled: false,
      panelChannel: "",
      category: "",
      staffRole: "",
      transcriptChannel: "",
      panelTitle: `${site.name} Support Desk`,
      panelDescription:
        "Select a category below to open a private support ticket with our staff team.",
      maxOpenPerUser: 1,
      saveTranscripts: true,
      categories: [
        "General Support",
        "Report User",
        "Ban Appeal",
        "Partnership",
      ],
    },
    logging: {
      enabled: true,
      allChannel: "",
      modChannel: "",
      securityChannel: "",
      messageChannel: "",
      memberChannel: "",
      voiceChannel: "",
      serverChannel: "",
      events: {
        mod: true,
        security: true,
        messages: true,
        members: true,
        voice: false,
        server: true,
      },
    },
    utility: {
      autoResponders: [],
      embeds: [],
      giveaways: {
        enabled: true,
        managerRole: "",
        pingRole: "",
        emoji: "🎉",
        bypassRole: "",
      },
    },
    updatedAt: null,
    updatedBy: null,
  };
}

export type SecurityPresetId = "fortress" | "balanced" | "creator" | "chill";

export const SECURITY_PRESETS: {
  id: SecurityPresetId;
  name: string;
  badge: string;
  summary: string;
  apply: (base: GuildConfig) => GuildConfig;
}[] = [
  {
    id: "fortress",
    name: "Maximum Fortress",
    badge: "Zero-Trust",
    summary:
      "All 14 Anti-Nuke guards at strict 1/60s limits, instant ban + rollback, full AutoMod, Captcha verify & Night Mode.",
    apply: (base) => {
      const next = structuredClone(base);
      next.antinuke.enabled = true;
      next.antinuke.punishment = "ban";
      next.antinuke.autoRollback = true;
      next.antinuke.antiBetray = true;
      next.antinuke.vanityGuard = true;
      for (const { key } of ANTINUKE_RULE_META) {
        next.antinuke.rules[key] = { enabled: true, limit: 1, windowSec: 120 };
      }
      next.automod.enabled = true;
      next.automod.punishment = "timeout_1h";
      next.automod.antiSpam = { enabled: true, maxMessages: 4, windowSec: 8 };
      next.automod.antiLink.enabled = true;
      next.automod.antiInvite.enabled = true;
      next.automod.antiMassMention = { enabled: true, maxMentions: 3 };
      next.automod.antiCaps = { enabled: true, percent: 65 };
      next.automod.antiBadWords.enabled = true;
      next.automod.antiZalgo.enabled = true;
      next.automod.antiTokenSpam = { enabled: true, joinRateLimit: 5 };
      next.verification.enabled = true;
      next.verification.mode = "captcha";
      next.verification.minAccountAgeDays = 7;
      next.verification.autoRaidPause = true;
      next.nightmode.enabled = true;
      next.nightmode.autoOnRaid = true;
      next.logging.enabled = true;
      next.logging.events = {
        mod: true,
        security: true,
        messages: true,
        members: true,
        voice: true,
        server: true,
      };
      return next;
    },
  },
  {
    id: "balanced",
    name: "Balanced Community",
    badge: "Recommended",
    summary:
      "All 14 Anti-Nuke guards with mod-friendly limits, smart AutoMod 5m timeouts, Button verification & 5 log streams.",
    apply: (base) => {
      const next = structuredClone(base);
      const defaults = createDefaultGuildConfig();
      next.antinuke = defaults.antinuke;
      next.automod = defaults.automod;
      next.verification.enabled = true;
      next.verification.mode = "button";
      next.verification.minAccountAgeDays = 3;
      next.nightmode.enabled = false;
      next.nightmode.lockdownActive = false;
      next.logging.enabled = true;
      return next;
    },
  },
  {
    id: "creator",
    name: "Creator & Esports Hub",
    badge: "High-Traffic",
    summary:
      "Tuned for big drops & streams — Anti-Nuke role-strip, anti-invite/mention walls, VoiceMaster, Tickets & Welcomer on.",
    apply: (base) => {
      const next = structuredClone(base);
      next.antinuke.enabled = true;
      next.antinuke.punishment = "strip_roles";
      next.antinuke.autoRollback = true;
      for (const { key } of ANTINUKE_RULE_META) {
        next.antinuke.rules[key] = { enabled: true, limit: 2, windowSec: 60 };
      }
      next.automod.enabled = true;
      next.automod.punishment = "timeout_5m";
      next.automod.antiSpam = { enabled: true, maxMessages: 6, windowSec: 8 };
      next.automod.antiInvite.enabled = true;
      next.automod.antiMassMention = { enabled: true, maxMentions: 4 };
      next.automod.antiTokenSpam = { enabled: true, joinRateLimit: 8 };
      next.verification.enabled = true;
      next.verification.mode = "button";
      next.voicemaster.enabled = true;
      next.tickets.enabled = true;
      next.welcomer.enabled = true;
      next.utility.giveaways.enabled = true;
      next.logging.enabled = true;
      return next;
    },
  },
  {
    id: "chill",
    name: "Relaxed Hangout",
    badge: "Light Touch",
    summary:
      "Essential nuke protection (quarantine mode) while letting members share links & caps freely + VoiceMaster & Welcomer.",
    apply: (base) => {
      const next = structuredClone(base);
      next.antinuke.enabled = true;
      next.antinuke.punishment = "quarantine";
      next.antinuke.autoRollback = true;
      next.automod.enabled = true;
      next.automod.punishment = "warn";
      next.automod.antiLink.enabled = false;
      next.automod.antiCaps.enabled = false;
      next.automod.antiSpam = { enabled: true, maxMessages: 8, windowSec: 10 };
      next.verification.enabled = false;
      next.nightmode.enabled = false;
      next.nightmode.lockdownActive = false;
      next.voicemaster.enabled = true;
      next.welcomer.enabled = true;
      return next;
    },
  },
];

export function computeSecurityScore(cfg: GuildConfig): {
  score: number;
  grade: "S+" | "A" | "B" | "C" | "D";
  label: string;
} {
  let pts = 0;

  if (cfg.antinuke.enabled) {
    const enabledRules = ANTINUKE_RULE_META.filter(
      (r) => cfg.antinuke.rules[r.key]?.enabled,
    ).length;
    pts += Math.round((enabledRules / ANTINUKE_RULE_META.length) * 42);
    if (cfg.antinuke.autoRollback) pts += 8;
    if (cfg.antinuke.antiBetray) pts += 3;
    if (cfg.antinuke.vanityGuard) pts += 3;
  }

  if (cfg.automod.enabled) {
    const filters = [
      cfg.automod.antiSpam.enabled,
      cfg.automod.antiLink.enabled,
      cfg.automod.antiInvite.enabled,
      cfg.automod.antiMassMention.enabled,
      cfg.automod.antiCaps.enabled,
      cfg.automod.antiBadWords.enabled,
      cfg.automod.antiZalgo.enabled,
      cfg.automod.antiTokenSpam.enabled,
    ].filter(Boolean).length;
    pts += Math.round((filters / 8) * 22);
  }

  if (cfg.verification.enabled) {
    pts += cfg.verification.mode === "captcha" ? 10 : 8;
  }

  if (cfg.nightmode.enabled || cfg.nightmode.lockdownActive) {
    pts += 5;
  }

  if (cfg.logging.enabled) {
    const streams = Object.values(cfg.logging.events).filter(Boolean).length;
    pts += Math.round((streams / 6) * 9);
  }

  const score = Math.max(0, Math.min(100, pts));
  if (score >= 90) return { score, grade: "S+", label: "Fortress Grade" };
  if (score >= 75) return { score, grade: "A", label: "Strongly Protected" };
  if (score >= 55) return { score, grade: "B", label: "Moderate Shield" };
  if (score >= 35) return { score, grade: "C", label: "Partial Coverage" };
  return { score, grade: "D", label: "Exposed — Enable Guards" };
}

export function buildCliSetupCommands(cfg: GuildConfig): string[] {
  const p = cfg.general.prefix || site.prefix;
  const cmds: string[] = [];
  if (p !== ".") cmds.push(`${p}setprefix ${p}`);
  if (cfg.antinuke.enabled) {
    cmds.push(`${p}antinuke enable`);
    cmds.push(
      `${p}antinuke punishment ${cfg.antinuke.punishment === "strip_roles" ? "strip" : cfg.antinuke.punishment}`,
    );
    cmds.push(`${p}rollback ${cfg.antinuke.autoRollback ? "on" : "off"}`);
    cmds.push(
      `${p}limits ban ${cfg.antinuke.rules.antiBan.limit} ${cfg.antinuke.rules.antiBan.windowSec}`,
    );
    cmds.push(
      `${p}limits channeldelete ${cfg.antinuke.rules.antiChannelDelete.limit} ${cfg.antinuke.rules.antiChannelDelete.windowSec}`,
    );
    if (cfg.antinuke.antiBetray) cmds.push(`${p}antibetray on`);
    if (cfg.antinuke.vanityGuard) cmds.push(`${p}vanityguard on`);
  }
  if (cfg.automod.enabled) {
    cmds.push(`${p}automod strict`);
    if (cfg.automod.antiSpam.enabled) {
      cmds.push(
        `${p}antispam on ${cfg.automod.antiSpam.maxMessages} ${cfg.automod.antiSpam.windowSec}`,
      );
    }
    if (cfg.automod.antiTokenSpam.enabled) {
      cmds.push(`${p}antitoken on ${cfg.automod.antiTokenSpam.joinRateLimit}`);
    }
  }
  if (cfg.verification.enabled) {
    cmds.push(
      `${p}verify setup ${cfg.verification.channel || "#verify"} ${cfg.verification.verifiedRole || "@Member"}`,
    );
    cmds.push(`${p}verify mode ${cfg.verification.mode}`);
    if (cfg.verification.minAccountAgeDays > 0) {
      cmds.push(`${p}verify minage ${cfg.verification.minAccountAgeDays}`);
    }
  }
  if (cfg.nightmode.enabled) {
    cmds.push(
      `${p}nightmode ${cfg.nightmode.startTime} ${cfg.nightmode.endTime} ${cfg.nightmode.timezone}`,
    );
  }
  if (cfg.voicemaster.enabled) cmds.push(`${p}voicemaster setup`);
  if (cfg.tickets.enabled) {
    cmds.push(`${p}ticket setup ${cfg.tickets.panelChannel || "#support"}`);
  }
  if (cfg.welcomer.enabled) {
    cmds.push(`${p}greet setup ${cfg.welcomer.channel || "#welcome"}`);
  }
  if (cfg.logging.enabled) {
    cmds.push(`${p}logall ${cfg.logging.allChannel || "#audit-logs"}`);
  }
  return cmds;
}

function clampInt(val: unknown, fallback: number, min: number, max: number): number {
  const n = typeof val === "number" ? val : Number(val);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function cleanStr(val: unknown, fallback: string, maxLen = 200): string {
  if (typeof val !== "string") return fallback;
  return val.slice(0, maxLen);
}

function cleanStrList(
  val: unknown,
  fallback: string[],
  maxItems = 50,
  maxLen = 80,
): string[] {
  if (!Array.isArray(val)) return fallback;
  return Array.from(
    new Set(
      val
        .filter((x): x is string => typeof x === "string")
        .map((x) => x.trim().slice(0, maxLen))
        .filter(Boolean),
    ),
  ).slice(0, maxItems);
}

function cleanBool(val: unknown, fallback: boolean): boolean {
  return typeof val === "boolean" ? val : fallback;
}

function cleanEnum<T extends string>(
  val: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  return typeof val === "string" && (allowed as readonly string[]).includes(val)
    ? (val as T)
    : fallback;
}

export function mergeGuildConfig(
  base: GuildConfig,
  patch: unknown,
  updatedBy: string,
): GuildConfig {
  if (!patch || typeof patch !== "object") return base;
  const p = patch as Record<string, unknown>;
  const next: GuildConfig = structuredClone(base);

  if (p.general && typeof p.general === "object") {
    const g = p.general as Record<string, unknown>;
    const rawPrefix = cleanStr(g.prefix, next.general.prefix, 5).trim();
    next.general.prefix = rawPrefix || site.prefix;
    const color = cleanStr(g.embedColor, next.general.embedColor, 9).trim();
    if (/^#[0-9a-fA-F]{6}$/.test(color)) next.general.embedColor = color;
    next.general.deleteCommands = cleanBool(g.deleteCommands, next.general.deleteCommands);
    next.general.dmOnPunish = cleanBool(g.dmOnPunish, next.general.dmOnPunish);
    next.general.ignoredChannels = cleanStrList(g.ignoredChannels, next.general.ignoredChannels);
    next.general.ignoredRoles = cleanStrList(g.ignoredRoles, next.general.ignoredRoles);
  }

  if (p.antinuke && typeof p.antinuke === "object") {
    const a = p.antinuke as Record<string, unknown>;
    next.antinuke.enabled = cleanBool(a.enabled, next.antinuke.enabled);
    next.antinuke.punishment = cleanEnum(
      a.punishment,
      ["ban", "kick", "strip_roles", "quarantine"] as const,
      next.antinuke.punishment,
    );
    next.antinuke.autoRollback = cleanBool(a.autoRollback, next.antinuke.autoRollback);
    next.antinuke.antiBetray = cleanBool(a.antiBetray, next.antinuke.antiBetray);
    next.antinuke.vanityGuard = cleanBool(a.vanityGuard, next.antinuke.vanityGuard);
    next.antinuke.logChannel = cleanStr(a.logChannel, next.antinuke.logChannel, 60).trim();
    if (a.rules && typeof a.rules === "object") {
      const r = a.rules as Record<string, unknown>;
      for (const { key } of ANTINUKE_RULE_META) {
        if (r[key] && typeof r[key] === "object") {
          const item = r[key] as Record<string, unknown>;
          const cur = next.antinuke.rules[key];
          next.antinuke.rules[key] = {
            enabled: cleanBool(item.enabled, cur.enabled),
            limit: clampInt(item.limit, cur.limit, 1, 30),
            windowSec: clampInt(item.windowSec, cur.windowSec, 10, 3600),
          };
        }
      }
    }
  }

  if (p.whitelist && typeof p.whitelist === "object") {
    const w = p.whitelist as Record<string, unknown>;
    if (Array.isArray(w.users)) {
      next.whitelist.users = w.users
        .filter((u): u is Record<string, unknown> => Boolean(u && typeof u === "object"))
        .map((u) => ({
          id: cleanStr(u.id, "", 24).replace(/[^\d]/g, ""),
          tag: cleanStr(u.tag, "", 48).trim(),
          scopes: cleanStrList(u.scopes, ["All"], 10, 24),
        }))
        .filter((u) => u.id.length >= 15)
        .slice(0, 100);
    }
    if (Array.isArray(w.extraOwners)) {
      next.whitelist.extraOwners = w.extraOwners
        .filter((u): u is Record<string, unknown> => Boolean(u && typeof u === "object"))
        .map((u) => ({
          id: cleanStr(u.id, "", 24).replace(/[^\d]/g, ""),
          tag: cleanStr(u.tag, "", 48).trim(),
        }))
        .filter((u) => u.id.length >= 15)
        .slice(0, 20);
    }
    next.whitelist.bypassRoles = cleanStrList(w.bypassRoles, next.whitelist.bypassRoles, 40, 60);
  }

  if (p.automod && typeof p.automod === "object") {
    const m = p.automod as Record<string, unknown>;
    next.automod.enabled = cleanBool(m.enabled, next.automod.enabled);
    next.automod.punishment = cleanEnum(
      m.punishment,
      ["timeout_5m", "timeout_1h", "warn", "kick", "ban"] as const,
      next.automod.punishment,
    );
    next.automod.logChannel = cleanStr(m.logChannel, next.automod.logChannel, 60).trim();
    if (m.antiSpam && typeof m.antiSpam === "object") {
      const s = m.antiSpam as Record<string, unknown>;
      next.automod.antiSpam = {
        enabled: cleanBool(s.enabled, next.automod.antiSpam.enabled),
        maxMessages: clampInt(s.maxMessages, next.automod.antiSpam.maxMessages, 2, 30),
        windowSec: clampInt(s.windowSec, next.automod.antiSpam.windowSec, 3, 60),
      };
    }
    if (m.antiLink && typeof m.antiLink === "object") {
      const s = m.antiLink as Record<string, unknown>;
      next.automod.antiLink = {
        enabled: cleanBool(s.enabled, next.automod.antiLink.enabled),
        allowedDomains: cleanStrList(s.allowedDomains, next.automod.antiLink.allowedDomains, 40, 80),
      };
    }
    if (m.antiInvite && typeof m.antiInvite === "object") {
      const s = m.antiInvite as Record<string, unknown>;
      next.automod.antiInvite = {
        enabled: cleanBool(s.enabled, next.automod.antiInvite.enabled),
        allowSupportServer: cleanBool(s.allowSupportServer, next.automod.antiInvite.allowSupportServer),
      };
    }
    if (m.antiMassMention && typeof m.antiMassMention === "object") {
      const s = m.antiMassMention as Record<string, unknown>;
      next.automod.antiMassMention = {
        enabled: cleanBool(s.enabled, next.automod.antiMassMention.enabled),
        maxMentions: clampInt(s.maxMentions, next.automod.antiMassMention.maxMentions, 2, 30),
      };
    }
    if (m.antiCaps && typeof m.antiCaps === "object") {
      const s = m.antiCaps as Record<string, unknown>;
      next.automod.antiCaps = {
        enabled: cleanBool(s.enabled, next.automod.antiCaps.enabled),
        percent: clampInt(s.percent, next.automod.antiCaps.percent, 40, 100),
      };
    }
    if (m.antiBadWords && typeof m.antiBadWords === "object") {
      const s = m.antiBadWords as Record<string, unknown>;
      next.automod.antiBadWords = {
        enabled: cleanBool(s.enabled, next.automod.antiBadWords.enabled),
        words: cleanStrList(s.words, next.automod.antiBadWords.words, 100, 40),
      };
    }
    if (m.antiZalgo && typeof m.antiZalgo === "object") {
      const s = m.antiZalgo as Record<string, unknown>;
      next.automod.antiZalgo = {
        enabled: cleanBool(s.enabled, next.automod.antiZalgo.enabled),
      };
    }
    if (m.antiTokenSpam && typeof m.antiTokenSpam === "object") {
      const s = m.antiTokenSpam as Record<string, unknown>;
      next.automod.antiTokenSpam = {
        enabled: cleanBool(s.enabled, next.automod.antiTokenSpam.enabled),
        joinRateLimit: clampInt(s.joinRateLimit, next.automod.antiTokenSpam.joinRateLimit, 3, 50),
      };
    }
  }

  if (p.verification && typeof p.verification === "object") {
    const v = p.verification as Record<string, unknown>;
    next.verification.enabled = cleanBool(v.enabled, next.verification.enabled);
    next.verification.mode = cleanEnum(
      v.mode,
      ["button", "captcha", "code"] as const,
      next.verification.mode,
    );
    next.verification.channel = cleanStr(v.channel, next.verification.channel, 60).trim();
    next.verification.verifiedRole = cleanStr(v.verifiedRole, next.verification.verifiedRole, 60).trim();
    next.verification.unverifiedRole = cleanStr(v.unverifiedRole, next.verification.unverifiedRole, 60).trim();
    next.verification.logChannel = cleanStr(v.logChannel, next.verification.logChannel, 60).trim();
    next.verification.minAccountAgeDays = clampInt(
      v.minAccountAgeDays,
      next.verification.minAccountAgeDays,
      0,
      90,
    );
    next.verification.autoRaidPause = cleanBool(v.autoRaidPause, next.verification.autoRaidPause);
    next.verification.dmOnVerify = cleanBool(v.dmOnVerify, next.verification.dmOnVerify);
    next.verification.panelTitle = cleanStr(v.panelTitle, next.verification.panelTitle, 100);
    next.verification.panelDescription = cleanStr(
      v.panelDescription,
      next.verification.panelDescription,
      500,
    );
    next.verification.buttonLabel =
      cleanStr(v.buttonLabel, next.verification.buttonLabel, 40).trim() ||
      "Verify Account";
  }

  if (p.nightmode && typeof p.nightmode === "object") {
    const n = p.nightmode as Record<string, unknown>;
    next.nightmode.enabled = cleanBool(n.enabled, next.nightmode.enabled);
    next.nightmode.lockdownActive = cleanBool(n.lockdownActive, next.nightmode.lockdownActive);
    const st = cleanStr(n.startTime, next.nightmode.startTime, 5);
    const et = cleanStr(n.endTime, next.nightmode.endTime, 5);
    if (/^\d{2}:\d{2}$/.test(st)) next.nightmode.startTime = st;
    if (/^\d{2}:\d{2}$/.test(et)) next.nightmode.endTime = et;
    next.nightmode.timezone = cleanStr(n.timezone, next.nightmode.timezone, 50).trim();
    next.nightmode.autoOnRaid = cleanBool(n.autoOnRaid, next.nightmode.autoOnRaid);
    next.nightmode.stripDangerousPerms = cleanBool(n.stripDangerousPerms, next.nightmode.stripDangerousPerms);
    next.nightmode.lockChannels = cleanBool(n.lockChannels, next.nightmode.lockChannels);
    next.nightmode.autoRestoreMorning = cleanBool(n.autoRestoreMorning, next.nightmode.autoRestoreMorning);
    next.nightmode.bypassRole = cleanStr(n.bypassRole, next.nightmode.bypassRole, 60).trim();
  }

  if (p.moderation && typeof p.moderation === "object") {
    const m = p.moderation as Record<string, unknown>;
    next.moderation.muteRole = cleanStr(m.muteRole, next.moderation.muteRole, 60).trim();
    next.moderation.modLogChannel = cleanStr(m.modLogChannel, next.moderation.modLogChannel, 60).trim();
    next.moderation.warnMuteThreshold = clampInt(m.warnMuteThreshold, next.moderation.warnMuteThreshold, 1, 20);
    next.moderation.warnBanThreshold = clampInt(m.warnBanThreshold, next.moderation.warnBanThreshold, 2, 30);
    next.moderation.humanAutoRole = cleanStr(m.humanAutoRole, next.moderation.humanAutoRole, 60).trim();
    next.moderation.botAutoRole = cleanStr(m.botAutoRole, next.moderation.botAutoRole, 60).trim();
    next.moderation.stickyNicknames = cleanBool(m.stickyNicknames, next.moderation.stickyNicknames);
  }

  if (p.welcomer && typeof p.welcomer === "object") {
    const w = p.welcomer as Record<string, unknown>;
    next.welcomer.enabled = cleanBool(w.enabled, next.welcomer.enabled);
    next.welcomer.channel = cleanStr(w.channel, next.welcomer.channel, 60).trim();
    next.welcomer.message = cleanStr(w.message, next.welcomer.message, 600);
    next.welcomer.useEmbed = cleanBool(w.useEmbed, next.welcomer.useEmbed);
    next.welcomer.embedTitle = cleanStr(w.embedTitle, next.welcomer.embedTitle, 120);
    next.welcomer.bannerUrl = cleanStr(w.bannerUrl, next.welcomer.bannerUrl, 300).trim();
    next.welcomer.dmWelcome = cleanBool(w.dmWelcome, next.welcomer.dmWelcome);
    next.welcomer.leaveEnabled = cleanBool(w.leaveEnabled, next.welcomer.leaveEnabled);
    next.welcomer.leaveChannel = cleanStr(w.leaveChannel, next.welcomer.leaveChannel, 60).trim();
    next.welcomer.leaveMessage = cleanStr(w.leaveMessage, next.welcomer.leaveMessage, 400);
  }

  if (p.voicemaster && typeof p.voicemaster === "object") {
    const v = p.voicemaster as Record<string, unknown>;
    next.voicemaster.enabled = cleanBool(v.enabled, next.voicemaster.enabled);
    next.voicemaster.category = cleanStr(v.category, next.voicemaster.category, 60).trim();
    next.voicemaster.joinChannel = cleanStr(v.joinChannel, next.voicemaster.joinChannel, 60).trim();
    next.voicemaster.controlChannel = cleanStr(v.controlChannel, next.voicemaster.controlChannel, 60).trim();
    next.voicemaster.nameTemplate = cleanStr(v.nameTemplate, next.voicemaster.nameTemplate, 80);
    next.voicemaster.defaultLimit = clampInt(v.defaultLimit, next.voicemaster.defaultLimit, 0, 99);
    next.voicemaster.bitrateKbps = clampInt(v.bitrateKbps, next.voicemaster.bitrateKbps, 32, 384);
    next.voicemaster.sendInterface = cleanBool(v.sendInterface, next.voicemaster.sendInterface);
    next.voicemaster.autoCleanup = cleanBool(v.autoCleanup, next.voicemaster.autoCleanup);
  }

  if (p.tickets && typeof p.tickets === "object") {
    const t = p.tickets as Record<string, unknown>;
    next.tickets.enabled = cleanBool(t.enabled, next.tickets.enabled);
    next.tickets.panelChannel = cleanStr(t.panelChannel, next.tickets.panelChannel, 60).trim();
    next.tickets.category = cleanStr(t.category, next.tickets.category, 60).trim();
    next.tickets.staffRole = cleanStr(t.staffRole, next.tickets.staffRole, 60).trim();
    next.tickets.transcriptChannel = cleanStr(t.transcriptChannel, next.tickets.transcriptChannel, 60).trim();
    next.tickets.panelTitle = cleanStr(t.panelTitle, next.tickets.panelTitle, 100);
    next.tickets.panelDescription = cleanStr(t.panelDescription, next.tickets.panelDescription, 500);
    next.tickets.maxOpenPerUser = clampInt(t.maxOpenPerUser, next.tickets.maxOpenPerUser, 1, 10);
    next.tickets.saveTranscripts = cleanBool(t.saveTranscripts, next.tickets.saveTranscripts);
    next.tickets.categories = cleanStrList(t.categories, next.tickets.categories, 15, 40);
  }

  if (p.logging && typeof p.logging === "object") {
    const l = p.logging as Record<string, unknown>;
    next.logging.enabled = cleanBool(l.enabled, next.logging.enabled);
    next.logging.allChannel = cleanStr(l.allChannel, next.logging.allChannel, 60).trim();
    next.logging.modChannel = cleanStr(l.modChannel, next.logging.modChannel, 60).trim();
    next.logging.securityChannel = cleanStr(l.securityChannel, next.logging.securityChannel, 60).trim();
    next.logging.messageChannel = cleanStr(l.messageChannel, next.logging.messageChannel, 60).trim();
    next.logging.memberChannel = cleanStr(l.memberChannel, next.logging.memberChannel, 60).trim();
    next.logging.voiceChannel = cleanStr(l.voiceChannel, next.logging.voiceChannel, 60).trim();
    next.logging.serverChannel = cleanStr(l.serverChannel, next.logging.serverChannel, 60).trim();
    if (l.events && typeof l.events === "object") {
      const ev = l.events as Record<string, unknown>;
      next.logging.events = {
        mod: cleanBool(ev.mod, next.logging.events.mod),
        security: cleanBool(ev.security, next.logging.events.security),
        messages: cleanBool(ev.messages, next.logging.events.messages),
        members: cleanBool(ev.members, next.logging.events.members),
        voice: cleanBool(ev.voice, next.logging.events.voice),
        server: cleanBool(ev.server, next.logging.events.server),
      };
    }
  }

  if (p.utility && typeof p.utility === "object") {
    const u = p.utility as Record<string, unknown>;
    if (Array.isArray(u.autoResponders)) {
      next.utility.autoResponders = u.autoResponders
        .filter((x): x is Record<string, unknown> => Boolean(x && typeof x === "object"))
        .map((x, idx) => ({
          id: cleanStr(x.id, `ar-${idx}`, 40),
          trigger: cleanStr(x.trigger, "", 80).trim(),
          response: cleanStr(x.response, "", 400).trim(),
          match: cleanEnum(x.match, ["exact", "contains"] as const, "exact"),
        }))
        .filter((x) => x.trigger && x.response)
        .slice(0, 50);
    }
    if (Array.isArray(u.embeds)) {
      next.utility.embeds = u.embeds
        .filter((x): x is Record<string, unknown> => Boolean(x && typeof x === "object"))
        .map((x, idx) => {
          const rawColor = cleanStr(x.color, next.general.embedColor, 9).trim();
          const color = /^#[0-9a-fA-F]{6}$/.test(rawColor)
            ? rawColor
            : next.general.embedColor;
          const rawFields = Array.isArray(x.fields) ? x.fields : [];
          const fields: CustomEmbedField[] = rawFields
            .filter(
              (f): f is Record<string, unknown> =>
                Boolean(f && typeof f === "object"),
            )
            .map((f) => ({
              name: cleanStr(f.name, "", 120).trim(),
              value: cleanStr(f.value, "", 400).trim(),
              inline: cleanBool(f.inline, false),
            }))
            .filter((f) => f.name && f.value)
            .slice(0, 8);
          return {
            id: cleanStr(x.id, `emb-${idx}`, 40),
            name: cleanStr(x.name, `Template ${idx + 1}`, 60).trim() || `Template ${idx + 1}`,
            channel: cleanStr(x.channel, "", 60).trim(),
            author: cleanStr(x.author, "", 80),
            title: cleanStr(x.title, "", 160),
            description: cleanStr(x.description, "", 1500),
            color,
            imageUrl: cleanStr(x.imageUrl, "", 300).trim(),
            thumbnailUrl: cleanStr(x.thumbnailUrl, "", 300).trim(),
            footer: cleanStr(x.footer, "", 120),
            timestamp: cleanBool(x.timestamp, true),
            fields,
          };
        })
        .filter((x) => x.title || x.description)
        .slice(0, 20);
    }
    if (u.giveaways && typeof u.giveaways === "object") {
      const gv = u.giveaways as Record<string, unknown>;
      next.utility.giveaways = {
        enabled: cleanBool(gv.enabled, next.utility.giveaways.enabled),
        managerRole: cleanStr(gv.managerRole, next.utility.giveaways.managerRole, 60).trim(),
        pingRole: cleanStr(gv.pingRole, next.utility.giveaways.pingRole, 60).trim(),
        emoji: cleanStr(gv.emoji, next.utility.giveaways.emoji, 16).trim() || "🎉",
        bypassRole: cleanStr(gv.bypassRole, next.utility.giveaways.bypassRole, 60).trim(),
      };
    }
  }

  next.updatedAt = new Date().toISOString();
  next.updatedBy = updatedBy;
  return next;
}
