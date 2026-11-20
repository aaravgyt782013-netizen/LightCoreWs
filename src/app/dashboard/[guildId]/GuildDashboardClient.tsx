"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { site, type LogEntry } from "@/lib/site";
import {
  ANTINUKE_RULE_META,
  SECURITY_PRESETS,
  buildCliSetupCommands,
  computeSecurityScore,
  createDefaultGuildConfig,
  mergeGuildConfig,
  type GuildConfig,
} from "@/lib/guild-config";
import type {
  DiscordChannelOption,
  DiscordRoleOption,
} from "@/lib/discord-guilds";
import { useSiteConfig } from "@/components/site/SiteConfigProvider";
import { Logo, Wordmark } from "@/components/ui/Logo";
import { openCommandPalette } from "@/components/ui/CommandPalette";
import {
  ColorSwatchSelect,
  CustomSelect,
} from "@/components/ui/CustomSelect";
import {
  ArrowRight,
  BellIcon,
  BotIcon,
  CheckIcon,
  ChevronLeftIcon,
  CopyIcon,
  CrownIcon,
  DiscordIcon,
  DownloadIcon,
  GiftIcon,
  GridIcon,
  LockIcon,
  LogListIcon,
  MoonIcon,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
  ShieldIcon,
  SlidersIcon,
  TerminalIcon,
  TicketIcon,
  UploadIcon,
  UsersIcon,
  VerifiedIcon,
  VoiceIcon,
} from "@/components/ui/Icons";
import { ModuleHeader, Toggle, ToggleRow } from "./Controls";
import {
  AntiNukeModule,
  AutoModModule,
  NightModeModule,
  VerificationModule,
  WhitelistModule,
} from "./SecurityModules";
import {
  LoggingModule,
  ModerationModule,
  TicketsModule,
  UtilityModule,
  VoiceMasterModule,
  WelcomerModule,
} from "./ServerModules";

export type ModuleId =
  | "overview"
  | "antinuke"
  | "whitelist"
  | "automod"
  | "verification"
  | "nightmode"
  | "moderation"
  | "welcomer"
  | "voicemaster"
  | "tickets"
  | "logging"
  | "utility";

const ALL_MODULE_IDS = new Set<ModuleId>([
  "overview",
  "antinuke",
  "whitelist",
  "automod",
  "verification",
  "nightmode",
  "moderation",
  "welcomer",
  "voicemaster",
  "tickets",
  "logging",
  "utility",
]);

type GuildPayload = {
  user: {
    id: string;
    username: string;
    globalName: string | null;
    avatarUrl: string | null;
    isOwner: boolean;
  };
  guild: {
    id: string;
    name: string;
    iconUrl: string | null;
    owner: boolean;
    inviteUrl: string;
    botInGuild: boolean | null;
    memberCount: number | null;
    onlineCount: number | null;
    boostCount: number | null;
    boostTier: number | null;
    channels: DiscordChannelOption[];
    roles: DiscordRoleOption[];
  };
  switcherGuilds: {
    id: string;
    name: string;
    iconUrl: string | null;
    owner: boolean;
  }[];
  premium?: {
    activeTier: "plus" | "pro" | "ultra" | null;
    userSubscription: { tierName: string; expiresAt: string | null } | null;
    guildSubscription: { tierName: string; expiresAt: string | null } | null;
  };
  config: GuildConfig;
  syncedWithBot: boolean;
  logs: LogEntry[];
};

const NAV_GROUPS: {
  heading: string;
  items: {
    id: ModuleId;
    label: string;
    icon: (props: React.SVGProps<SVGSVGElement>) => React.JSX.Element;
  }[];
}[] = [
  {
    heading: "General",
    items: [{ id: "overview", label: "Overview & Presets", icon: GridIcon }],
  },
  {
    heading: "Security Setup",
    items: [
      { id: "antinuke", label: "Anti-Nuke", icon: ShieldIcon },
      { id: "whitelist", label: "Whitelist & Owners", icon: UsersIcon },
      { id: "automod", label: "AutoMod Firewall", icon: BotIcon },
      { id: "verification", label: "Verification Gate", icon: LockIcon },
      { id: "nightmode", label: "Night Mode", icon: MoonIcon },
    ],
  },
  {
    heading: "Server Management",
    items: [
      { id: "moderation", label: "Moderation & Roles", icon: SlidersIcon },
      { id: "welcomer", label: "Welcomer & Leave", icon: BellIcon },
      { id: "voicemaster", label: "VoiceMaster", icon: VoiceIcon },
      { id: "tickets", label: "Tickets Desk", icon: TicketIcon },
      { id: "logging", label: "Audit Logging", icon: LogListIcon },
      { id: "utility", label: "Embeds, AR & GWs", icon: GiftIcon },
    ],
  },
];

const MODULE_LABELS: Record<ModuleId, string> = {
  overview: "Overview & Security Posture",
  antinuke: "Anti-Nuke Protection",
  whitelist: "Whitelist & Extra Owners",
  automod: "AutoMod Firewall",
  verification: "Verification Gate",
  nightmode: "Night Mode & Lockdown",
  moderation: "Moderation & AutoRole",
  welcomer: "Welcomer & Leave",
  voicemaster: "VoiceMaster Hub",
  tickets: "Ticketing System",
  logging: "Audit Logging",
  utility: "Embed Studio, AutoResponder & Giveaways",
};

function createDemoPayload(): GuildPayload {
  const cfg = createDefaultGuildConfig();
  cfg.antinuke.logChannel = "ch-sec-logs";
  cfg.antinuke.antiBetray = true;
  cfg.antinuke.vanityGuard = true;
  cfg.verification.enabled = true;
  cfg.verification.mode = "captcha";
  cfg.verification.channel = "ch-verify";
  cfg.verification.verifiedRole = "rl-verified";
  cfg.verification.logChannel = "ch-sec-logs";
  cfg.welcomer.enabled = true;
  cfg.welcomer.channel = "ch-welcome";
  cfg.voicemaster.enabled = true;
  cfg.voicemaster.category = "cat-voice";
  cfg.voicemaster.joinChannel = "vc-j2c";
  cfg.voicemaster.controlChannel = "ch-vc-panel";
  cfg.tickets.enabled = true;
  cfg.tickets.panelChannel = "ch-support";
  cfg.tickets.category = "cat-support";
  cfg.tickets.staffRole = "rl-staff";
  cfg.tickets.transcriptChannel = "ch-transcripts";
  cfg.logging.allChannel = "ch-all-logs";
  cfg.logging.securityChannel = "ch-sec-logs";
  cfg.logging.modChannel = "ch-mod-logs";
  cfg.whitelist.users = [
    { id: "984210394810293841", tag: "nyx (Head Admin)", scopes: ["Ban/Kick", "Roles"] },
  ];
  cfg.utility.autoResponders = [
    {
      id: "demo-ar-1",
      trigger: "support",
      response: "Open a private ticket in #open-a-ticket and staff will reply shortly!",
      match: "exact",
    },
  ];
  cfg.utility.embeds = [
    {
      id: "demo-emb-1",
      name: "welcome-rules",
      channel: "ch-rules",
      author: "",
      title: "LightCore Sanctuary · Official Rules",
      description:
        "1. Respect every member & staff decision.\n2. Zero phishing links, self-promo, or token spam.\n3. Open a ticket in #open-a-ticket for fast assistance.",
      color: "#facc15",
      imageUrl: "",
      thumbnailUrl: "",
      footer: "Guarded 24/7 by LightCore",
      timestamp: true,
      fields: [],
    },
  ];

  const now = Date.now();
  return {
    user: {
      id: "100000000000000001",
      username: "guest_admin",
      globalName: "Demo Owner",
      avatarUrl: site.logo,
      isOwner: false,
    },
    guild: {
      id: "demo",
      name: "LightCore Sanctuary",
      iconUrl: site.logo,
      owner: true,
      inviteUrl: site.invite,
      botInGuild: true,
      memberCount: 18420,
      onlineCount: 3194,
      boostCount: 42,
      boostTier: 3,
      channels: [
        { id: "ch-verify", name: "verify", type: "text", position: 1 },
        { id: "ch-rules", name: "rules", type: "text", position: 2 },
        { id: "ch-welcome", name: "welcome", type: "text", position: 3 },
        { id: "ch-announcements", name: "announcements", type: "text", position: 4 },
        { id: "ch-general", name: "general-chat", type: "text", position: 5 },
        { id: "ch-bot-spam", name: "bot-commands", type: "text", position: 6 },
        { id: "ch-support", name: "open-a-ticket", type: "text", position: 7 },
        { id: "ch-vc-panel", name: "vc-interface", type: "text", position: 8 },
        { id: "ch-sec-logs", name: "antinuke-logs", type: "text", position: 9 },
        { id: "ch-mod-logs", name: "mod-logs", type: "text", position: 10 },
        { id: "ch-transcripts", name: "ticket-transcripts", type: "text", position: 11 },
        { id: "ch-all-logs", name: "audit-stream", type: "text", position: 12 },
        { id: "vc-j2c", name: "➕ Join to Create", type: "voice", position: 13 },
        { id: "vc-lounge", name: "Main Lounge", type: "voice", position: 14 },
        { id: "cat-voice", name: "VoiceMaster Rooms", type: "category", position: 15 },
        { id: "cat-support", name: "Support Desk", type: "category", position: 16 },
      ],
      roles: [
        { id: "rl-head", name: "Head Admin", color: "#facc15", position: 9 },
        { id: "rl-staff", name: "Support Staff", color: "#f43f5e", position: 8 },
        { id: "rl-night", name: "Night Watch", color: "#8b5cf6", position: 7 },
        { id: "rl-gw", name: "Giveaway Host", color: "#f59e0b", position: 6 },
        { id: "rl-vip", name: "Server Booster", color: "#ec4899", position: 5 },
        { id: "rl-verified", name: "Verified", color: "#10b981", position: 4 },
        { id: "rl-unverified", name: "Unverified", color: "#71717a", position: 3 },
        { id: "rl-muted", name: "Quarantined", color: "#dc2626", position: 2 },
        { id: "rl-bots", name: "Bots", color: "#38bdf8", position: 1 },
      ],
    },
    switcherGuilds: [
      { id: "demo", name: "LightCore Sanctuary (Demo)", iconUrl: site.logo, owner: true },
    ],
    premium: {
      activeTier: "pro",
      userSubscription: { tierName: "LightCore Pro (Sandbox)", expiresAt: null },
      guildSubscription: null,
    },
    config: cfg,
    syncedWithBot: true,
    logs: [
      {
        id: "dm-1",
        t: "ANTINUKE",
        ok: true,
        msg: "Blocked rogue webhook creation in #announcements (actor stripped in 184ms)",
        guild: "LightCore Sanctuary",
        guildId: "demo",
        ts: new Date(now - 90_000).toISOString(),
      },
      {
        id: "dm-2",
        t: "ROLLBACK",
        ok: true,
        msg: "Restored #general-chat overwrites + slowmode snapshot automatically",
        guild: "LightCore Sanctuary",
        guildId: "demo",
        ts: new Date(now - 240_000).toISOString(),
      },
      {
        id: "dm-3",
        t: "AUTOMOD",
        ok: true,
        msg: "Intercepted phishing invite burst (6 msgs purged · 5m timeout applied)",
        guild: "LightCore Sanctuary",
        guildId: "demo",
        ts: new Date(now - 620_000).toISOString(),
      },
      {
        id: "dm-4",
        t: "VERIFY",
        ok: true,
        msg: "Held 4 fresh burner accounts (<3d old) at Captcha Verification Gate",
        guild: "LightCore Sanctuary",
        guildId: "demo",
        ts: new Date(now - 1_200_000).toISOString(),
      },
    ],
  };
}

function stripMeta(cfg: GuildConfig): string {
  return JSON.stringify({ ...cfg, updatedAt: null, updatedBy: null });
}

function storageKey(guildId: string): string {
  return `lc_guild_cfg_${guildId}`;
}

export function GuildDashboardClient({
  guildId,
  demoMode = false,
}: {
  guildId: string;
  demoMode?: boolean;
}) {
  const router = useRouter();
  const { config: siteCfg } = useSiteConfig();
  const brandName = siteCfg.brandName || site.name;
  const currency = siteCfg.currencySymbol || "₹";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [viewState, setViewState] = useState<
    "loading" | "guest" | "forbidden" | "error" | "ready"
  >(demoMode ? "ready" : "loading");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const [data, setData] = useState<GuildPayload | null>(() =>
    demoMode ? createDemoPayload() : null,
  );
  const [savedConfig, setSavedConfig] = useState<GuildConfig | null>(() =>
    demoMode ? createDemoPayload().config : null,
  );
  const [draft, setDraft] = useState<GuildConfig | null>(() =>
    demoMode ? createDemoPayload().config : null,
  );
  const [activeTab, setActiveTab] = useState<ModuleId>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [cliOpen, setCliOpen] = useState(false);
  const [cliCopied, setCliCopied] = useState(false);
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(
    null,
  );

  const [ignChanInput, setIgnChanInput] = useState("");
  const [ignRoleInput, setIgnRoleInput] = useState("");

  const showToast = useCallback((ok: boolean, text: string) => {
    setToast({ ok, text });
    window.setTimeout(() => {
      setToast((cur) => (cur?.text === text ? null : cur));
    }, 3600);
  }, []);

  // Read optional ?tab= query param on mount so landing-page deep links open the exact module
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const rawTab = sp.get("tab") as ModuleId | null;
      if (rawTab && ALL_MODULE_IDS.has(rawTab)) {
        setActiveTab(rawTab);
      }
    } catch {
      // Ignore
    }
  }, []);

  const loadGuild = useCallback(
    async (isRefresh = false) => {
      if (demoMode) {
        const base = createDemoPayload();
        try {
          const raw = window.localStorage.getItem(storageKey("demo"));
          if (raw) {
            const parsed = JSON.parse(raw) as GuildConfig;
            const merged = mergeGuildConfig(base.config, parsed, "@guest_admin");
            merged.updatedAt = parsed.updatedAt ?? null;
            merged.updatedBy = parsed.updatedBy ?? "@guest_admin";
            base.config = merged;
          }
        } catch {
          // Ignore malformed sandbox state
        }
        setData(base);
        setSavedConfig(structuredClone(base.config));
        setDraft(structuredClone(base.config));
        setViewState("ready");
        if (isRefresh) showToast(true, "Sandbox state reloaded from browser.");
        return;
      }

      if (isRefresh) setRefreshing(true);
      try {
        const res = await fetch(
          `/api/guilds/${encodeURIComponent(guildId)}`,
          { cache: "no-store" },
        );
        if (res.status === 401) {
          setViewState("guest");
          return;
        }
        if (res.status === 403) {
          const j = (await res.json().catch(() => ({}))) as { error?: string };
          setErrorMsg(
            j.error ||
              "You need Manage Server or Administrator permission in this server.",
          );
          setViewState("forbidden");
          return;
        }
        if (!res.ok) {
          const j = (await res.json().catch(() => ({}))) as { error?: string };
          setErrorMsg(j.error || "Unable to load this server right now.");
          setViewState("error");
          return;
        }

        const payload = (await res.json()) as GuildPayload;
        let resolvedConfig = mergeGuildConfig(
          createDefaultGuildConfig(),
          payload.config,
          payload.config.updatedBy || `@${payload.user.username}`,
        );
        resolvedConfig.updatedAt = payload.config.updatedAt ?? null;
        resolvedConfig.updatedBy = payload.config.updatedBy ?? null;

        if (!payload.syncedWithBot && !payload.config.updatedAt) {
          try {
            const raw = window.localStorage.getItem(storageKey(guildId));
            if (raw) {
              const parsed = JSON.parse(raw) as GuildConfig;
              resolvedConfig = mergeGuildConfig(
                resolvedConfig,
                parsed,
                parsed.updatedBy || `@${payload.user.username}`,
              );
              resolvedConfig.updatedAt = parsed.updatedAt ?? null;
              resolvedConfig.updatedBy = parsed.updatedBy ?? null;
            }
          } catch {
            // Ignore malformed local backup.
          }
        } else {
          try {
            window.localStorage.setItem(
              storageKey(guildId),
              JSON.stringify(resolvedConfig),
            );
          } catch {
            // Ignore storage quota issues.
          }
        }

        setData(payload);
        setSavedConfig(resolvedConfig);
        setDraft(structuredClone(resolvedConfig));
        setViewState("ready");
      } catch {
        setErrorMsg(`Network error while connecting to ${brandName} gateway.`);
        setViewState("error");
      } finally {
        setRefreshing(false);
      }
    },
    [brandName, demoMode, guildId, showToast],
  );

  useEffect(() => {
    void loadGuild(false);
  }, [loadGuild]);

  const isDirty = useMemo(() => {
    if (!draft || !savedConfig) return false;
    return stripMeta(draft) !== stripMeta(savedConfig);
  }, [draft, savedConfig]);

  const updateDraft = useCallback(
    (updater: (prev: GuildConfig) => GuildConfig) => {
      setDraft((prev) => (prev ? updater(prev) : prev));
    },
    [],
  );

  const handleSave = useCallback(async () => {
    if (!draft || saving) return;

    if (demoMode) {
      setSaving(true);
      const stamped: GuildConfig = {
        ...structuredClone(draft),
        updatedAt: new Date().toISOString(),
        updatedBy: "@demo_owner",
      };
      try {
        window.localStorage.setItem(storageKey("demo"), JSON.stringify(stamped));
      } catch {
        // Ignore quota limits
      }
      setSavedConfig(stamped);
      setDraft(structuredClone(stamped));
      setData((prev) =>
        prev
          ? {
              ...prev,
              logs: [
                {
                  id: `demo-${Date.now()}`,
                  t: "CONFIG",
                  ok: true,
                  msg: `${MODULE_LABELS[activeTab]} saved in interactive sandbox`,
                  guild: prev.guild.name,
                  guildId: prev.guild.id,
                  ts: new Date().toISOString(),
                },
                ...prev.logs,
              ].slice(0, 30),
            }
          : prev,
      );
      setSaving(false);
      showToast(true, `${MODULE_LABELS[activeTab]} saved to your Demo Sandbox!`);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/guilds/${encodeURIComponent(guildId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: MODULE_LABELS[activeTab],
          config: draft,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        config?: GuildConfig;
        syncedWithBot?: boolean;
        error?: string;
      };
      if (!res.ok || !json.ok || !json.config) {
        showToast(false, json.error || "Failed to save configuration.");
        return;
      }

      setSavedConfig(json.config);
      setDraft(structuredClone(json.config));
      try {
        window.localStorage.setItem(
          storageKey(guildId),
          JSON.stringify(json.config),
        );
      } catch {
        // Ignore storage quota issues.
      }

      setData((prev) =>
        prev
          ? {
              ...prev,
              syncedWithBot: Boolean(json.syncedWithBot),
              logs: [
                {
                  id: `local-${Date.now()}`,
                  t: "CONFIG",
                  ok: true,
                  msg: `${MODULE_LABELS[activeTab]} updated by @${prev.user.username}`,
                  guild: prev.guild.name,
                  guildId: prev.guild.id,
                  ts: new Date().toISOString(),
                },
                ...prev.logs,
              ].slice(0, 30),
            }
          : prev,
      );

      showToast(
        true,
        json.syncedWithBot
          ? `${MODULE_LABELS[activeTab]} saved & synced live with ${brandName}!`
          : `${MODULE_LABELS[activeTab]} saved successfully!`,
      );
    } catch {
      showToast(false, "Network error while saving settings.");
    } finally {
      setSaving(false);
    }
  }, [activeTab, brandName, demoMode, draft, guildId, saving, showToast]);

  // Ctrl+S / Cmd+S keyboard shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        if (isDirty) {
          e.preventDefault();
          void handleSave();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleSave, isDirty]);

  const handleReset = () => {
    if (!savedConfig) return;
    setDraft(structuredClone(savedConfig));
    showToast(true, "Reverted unsaved changes.");
  };

  const handleFactoryDefaults = () => {
    const fresh = demoMode
      ? createDemoPayload().config
      : createDefaultGuildConfig();
    if (demoMode) {
      try {
        window.localStorage.removeItem(storageKey("demo"));
      } catch {
        // Ignore
      }
    }
    setDraft(structuredClone(fresh));
    showToast(
      true,
      demoMode
        ? "Restored clean sandbox profile — click Save to keep."
        : "Loaded default profile — click Save Changes to apply.",
    );
  };

  const handleExportJson = () => {
    if (!draft || !data) return;
    const blob = new Blob([JSON.stringify(draft, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lightcore-${data.guild.id}-config.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast(true, "Exported server configuration JSON backup.");
  };

  const handleImportJson = async (file: File | null) => {
    if (!file || !draft) return;
    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw) as Partial<GuildConfig>;
      const merged = mergeGuildConfig(
        createDefaultGuildConfig(),
        parsed,
        data?.user.username ? `@${data.user.username}` : "import",
      );
      setDraft(merged);
      showToast(
        true,
        `Imported "${file.name}" — review & click Save Changes to commit.`,
      );
    } catch {
      showToast(false, "Invalid JSON backup file.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSwitchGuild = (nextId: string) => {
    if (!nextId || nextId === guildId) return;
    router.push(`/dashboard/${nextId}`);
  };

  const handleLogout = async () => {
    if (demoMode) {
      router.push("/dashboard");
      return;
    }
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  // Layout-locked skeleton (zero fullscreen flash / zero layout shift)
  if (viewState === "loading") {
    return (
      <div className="flex min-h-screen bg-ink-950 text-zinc-100">
        <aside className="hidden w-[274px] shrink-0 border-r border-white/[0.07] bg-ink-900/95 p-4 lg:block">
          <div className="skeleton-shimmer h-10 rounded-xl" />
          <div className="skeleton-shimmer mt-4 h-11 rounded-xl" />
          <div className="mt-6 space-y-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="skeleton-shimmer h-9 rounded-xl" />
            ))}
          </div>
        </aside>
        <div className="flex-1">
          <div className="flex h-16 items-center justify-between border-b border-white/[0.07] px-6">
            <div className="skeleton-shimmer h-6 w-48 rounded-lg" />
            <div className="skeleton-shimmer h-9 w-28 rounded-full" />
          </div>
          <div className="mx-auto max-w-[1120px] space-y-5 p-6">
            <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="skeleton-shimmer h-28 rounded-2xl" />
              ))}
            </div>
            <div className="skeleton-shimmer h-40 rounded-2xl" />
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="skeleton-shimmer h-40 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (viewState === "guest") {
    return (
      <main className="relative flex min-h-screen items-center justify-center px-5 py-16">
        <div className="panel panel-inner w-full max-w-md rounded-3xl p-8 text-center shadow-panel">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-brand-500/30 bg-brand-950/40 text-brand-400">
            <LockIcon className="size-5" />
          </div>
          <h1 className="mt-4 font-display text-[24px] font-semibold text-white">
            Sign in to Manage Server
          </h1>
          <p className="mt-2 text-[13.5px] leading-relaxed text-zinc-400">
            Authenticate via official Discord OAuth2 to manage{" "}
            {brandName} controls for server{" "}
            <code className="font-mono text-zinc-300">{guildId}</code>.
          </p>
          <form method="POST" action="/api/auth/discord" className="mt-6">
            <input type="hidden" name="next" value={`/dashboard/${guildId}`} />
            <button
              type="submit"
              className="btn-primary btn-glow relative inline-flex h-12 w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl text-[14px] font-semibold text-white transition-all duration-300 ease-smooth hover:-translate-y-0.5 active:scale-[0.985]"
            >
              <ShieldIcon className="size-[18px]" />
              Authorize with Discord
            </button>
          </form>
          <Link
            href="/dashboard/demo"
            className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-white/[0.11] bg-ink-950/75 text-[13px] font-medium text-zinc-200 hover:border-brand-500/40 hover:text-white"
          >
            Try Interactive Demo Instead →
          </Link>
          <Link
            href="/dashboard"
            className="mt-4 inline-block font-mono text-[10.5px] uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-200"
          >
            ← Back to server list
          </Link>
        </div>
      </main>
    );
  }

  if (viewState === "forbidden" || viewState === "error" || !data || !draft) {
    return (
      <main className="relative flex min-h-screen items-center justify-center px-5 py-16">
        <div className="panel panel-inner w-full max-w-md rounded-3xl p-8 text-center shadow-panel">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-brand-500/30 bg-brand-950/40 text-brand-400">
            <ShieldIcon className="size-5" />
          </div>
          <h1 className="mt-4 font-display text-[22px] font-semibold text-white">
            {viewState === "forbidden" ? "Access Restricted" : "Unable to Load"}
          </h1>
          <p className="mt-2 text-[13.5px] leading-relaxed text-zinc-400">
            {errorMsg}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="btn-primary inline-flex h-10 items-center gap-2 rounded-full px-5 text-[13px] font-semibold"
            >
              Choose Another Server
            </Link>
            <Link
              href="/dashboard/demo"
              className="inline-flex h-10 items-center rounded-full border border-white/15 px-4 text-[13px] text-zinc-200 hover:text-white"
            >
              Open Demo
            </Link>
            {viewState === "error" && (
              <button
                type="button"
                onClick={() => {
                  setViewState("loading");
                  void loadGuild(false);
                }}
                className="inline-flex h-10 items-center rounded-full border border-white/15 px-4 text-[13px] text-zinc-300 hover:text-white"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      </main>
    );
  }

  const { user, guild, switcherGuilds } = data;
  const activePrefix = draft.general.prefix || siteCfg.prefix || site.prefix;
  const premiumHref = demoMode
    ? "/premium"
    : `/premium?guild=${encodeURIComponent(guild.id)}&name=${encodeURIComponent(guild.name)}`;

  const armedGuards = ANTINUKE_RULE_META.filter(
    (r) => draft.antinuke.rules[r.key].enabled,
  ).length;
  const posture = computeSecurityScore(draft);
  const cliCommands = buildCliSetupCommands(draft);

  const isModuleActive = (id: ModuleId): boolean | null => {
    switch (id) {
      case "antinuke":
        return draft.antinuke.enabled;
      case "automod":
        return draft.automod.enabled;
      case "verification":
        return draft.verification.enabled;
      case "nightmode":
        return draft.nightmode.enabled || draft.nightmode.lockdownActive;
      case "welcomer":
        return draft.welcomer.enabled;
      case "voicemaster":
        return draft.voicemaster.enabled;
      case "tickets":
        return draft.tickets.enabled;
      case "logging":
        return draft.logging.enabled;
      case "utility":
        return (
          draft.utility.giveaways.enabled ||
          draft.utility.autoResponders.length > 0 ||
          (draft.utility.embeds?.length ?? 0) > 0
        );
      default:
        return null;
    }
  };

  const overviewModules: {
    id: ModuleId;
    title: string;
    desc: string;
    cmd: string;
    enabled?: boolean;
    onToggle?: (v: boolean) => void;
    meta: string;
  }[] = [
    {
      id: "antinuke",
      title: "Anti-Nuke",
      desc: "Sub-500ms protection across bans, channels, roles, webhooks & rogue bots.",
      cmd: `${activePrefix}antinuke`,
      enabled: draft.antinuke.enabled,
      onToggle: (enabled) =>
        updateDraft((p) => ({ ...p, antinuke: { ...p.antinuke, enabled } })),
      meta: `${armedGuards}/${ANTINUKE_RULE_META.length} guards · ${draft.antinuke.punishment}`,
    },
    {
      id: "whitelist",
      title: "Whitelist & Extra Owners",
      desc: "Scoped staff exemptions, trusted co-owners, and bypass roles.",
      cmd: `${activePrefix}whitelist`,
      meta: `${draft.whitelist.users.length} users · ${draft.whitelist.extraOwners.length} extra owners`,
    },
    {
      id: "automod",
      title: "AutoMod Firewall",
      desc: "Anti-Spam, Phishing Links, Invites, Token Raids, Mentions & Zalgo.",
      cmd: `${activePrefix}automod`,
      enabled: draft.automod.enabled,
      onToggle: (enabled) =>
        updateDraft((p) => ({ ...p, automod: { ...p.automod, enabled } })),
      meta: `Action: ${draft.automod.punishment.replace("_", " ")}`,
    },
    {
      id: "verification",
      title: "Verification Gate",
      desc: "Button, visual Captcha, or 6-digit code gate with burner-account age wall.",
      cmd: `${activePrefix}verify`,
      enabled: draft.verification.enabled,
      onToggle: (enabled) =>
        updateDraft((p) => ({
          ...p,
          verification: { ...p.verification, enabled },
        })),
      meta: `${draft.verification.mode} · min ${draft.verification.minAccountAgeDays}d age`,
    },
    {
      id: "nightmode",
      title: "Night Mode",
      desc: "Scheduled overnight channel freeze, emergency lockdown & dawn restore.",
      cmd: `${activePrefix}nightmode`,
      enabled: draft.nightmode.enabled,
      onToggle: (enabled) =>
        updateDraft((p) => ({ ...p, nightmode: { ...p.nightmode, enabled } })),
      meta: `${draft.nightmode.startTime}–${draft.nightmode.endTime} (${draft.nightmode.timezone})`,
    },
    {
      id: "moderation",
      title: "Moderation & AutoRole",
      desc: "Warning ladders, quarantine role, human/bot join roles & sticky nicks.",
      cmd: `${activePrefix}autorole`,
      meta: `Mute @${draft.moderation.warnMuteThreshold}w · Ban @${draft.moderation.warnBanThreshold}w`,
    },
    {
      id: "welcomer",
      title: "Welcomer & Leave",
      desc: "Rich greeting embeds with live Discord preview, banners & DM greets.",
      cmd: `${activePrefix}greet`,
      enabled: draft.welcomer.enabled,
      onToggle: (enabled) =>
        updateDraft((p) => ({ ...p, welcomer: { ...p.welcomer, enabled } })),
      meta: draft.welcomer.useEmbed ? "Rich embed active" : "Plain text mode",
    },
    {
      id: "voicemaster",
      title: "VoiceMaster",
      desc: "Join-to-Create temporary voice rooms with in-chat lock/claim buttons.",
      cmd: `${activePrefix}voicemaster`,
      enabled: draft.voicemaster.enabled,
      onToggle: (enabled) =>
        updateDraft((p) => ({
          ...p,
          voicemaster: { ...p.voicemaster, enabled },
        })),
      meta: `${draft.voicemaster.bitrateKbps} kbps · auto-cleanup`,
    },
    {
      id: "tickets",
      title: "Ticketing Desk",
      desc: "Multi-category ticket panels, staff routing & HTML transcript archive.",
      cmd: `${activePrefix}ticket`,
      enabled: draft.tickets.enabled,
      onToggle: (enabled) =>
        updateDraft((p) => ({ ...p, tickets: { ...p.tickets, enabled } })),
      meta: `${draft.tickets.categories.length} categories`,
    },
    {
      id: "logging",
      title: "Audit Logging",
      desc: "6 dedicated event streams across security, mod, voice & messages.",
      cmd: `${activePrefix}logall`,
      enabled: draft.logging.enabled,
      onToggle: (enabled) =>
        updateDraft((p) => ({ ...p, logging: { ...p.logging, enabled } })),
      meta: `${Object.values(draft.logging.events).filter(Boolean).length}/6 streams active`,
    },
    {
      id: "utility",
      title: "Embed Studio, AR & GWs",
      desc: "Visual Discord embed designer, keyword auto-replies & role giveaways.",
      cmd: `${activePrefix}embed`,
      enabled: draft.utility.giveaways.enabled,
      onToggle: (enabled) =>
        updateDraft((p) => ({
          ...p,
          utility: {
            ...p.utility,
            giveaways: { ...p.utility.giveaways, enabled },
          },
        })),
      meta: `${draft.utility.embeds?.length ?? 0} embeds · ${draft.utility.autoResponders.length} triggers`,
    },
  ];

  const enabledModulesCount = overviewModules.filter(
    (m) => m.enabled === true,
  ).length;
  const toggleableModulesCount = overviewModules.filter(
    (m) => typeof m.enabled === "boolean",
  ).length;

  const resolveChannelLabel = (idOrName: string) => {
    const found = guild.channels.find((c) => c.id === idOrName);
    return found ? `#${found.name}` : idOrName;
  };
  const resolveRoleLabel = (idOrName: string) => {
    const found = guild.roles.find((r) => r.id === idOrName);
    return found ? `@${found.name}` : idOrName;
  };

  return (
    <div
      style={{ paddingTop: "var(--top-banner-offset, 0px)" }}
      className="relative flex min-h-screen bg-ink-950 text-zinc-100"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => void handleImportJson(e.target.files?.[0] ?? null)}
      />

      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Left Control Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[274px] flex-col border-r border-white/[0.07] bg-ink-900/95 backdrop-blur-xl transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/[0.07] px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={30} />
            <span className="font-display text-[14.5px] font-semibold tracking-[0.16em] text-white">
              <Wordmark />
            </span>
          </Link>
          <Link
            href={demoMode ? "/" : "/dashboard"}
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-wider text-zinc-400 hover:border-white/25 hover:text-white"
          >
            <ChevronLeftIcon className="size-3" />
            {demoMode ? "Home" : "Servers"}
          </Link>
        </div>

        {/* Quick Server Switcher */}
        <div className="border-b border-brand-200/[0.08] p-3.5">
          {demoMode ? (
            <div className="flex items-center justify-between gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.07] px-3 py-2.5">
              <div className="flex min-w-0 items-center gap-2.5">
                <Logo size={28} />
                <div className="min-w-0">
                  <p className="truncate text-[12.5px] font-semibold text-white">
                    {guild.name}
                  </p>
                  <p className="font-mono text-[9.5px] uppercase tracking-wider text-emerald-300">
                    Server Preview
                  </p>
                </div>
              </div>
              <VerifiedIcon className="size-4 shrink-0 text-emerald-400" />
            </div>
          ) : (
            <CustomSelect
              title="Switch Discord Server"
              value={guild.id}
              onChange={handleSwitchGuild}
              searchable={switcherGuilds.length >= 5}
              options={switcherGuilds.map((sg) => ({
                value: sg.id,
                label: sg.name,
                iconUrl: sg.iconUrl,
                badge: sg.owner ? "Owner" : "Admin",
                description: `ID ${sg.id}`,
              }))}
            />
          )}
        </div>

        {/* Module Navigation */}
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.heading}>
              <p className="px-2.5 font-mono text-[9px] uppercase tracking-[0.26em] text-zinc-600">
                {group.heading}
              </p>
              <div className="mt-1.5 space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const selected = activeTab === item.id;
                  const on = isModuleActive(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition-all ${
                        selected
                          ? "border border-brand-500/40 bg-brand-600/15 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                          : "border border-transparent text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <Icon
                          className={`size-4 shrink-0 ${
                            selected ? "text-brand-400" : "text-zinc-500"
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </span>
                      {on !== null && (
                        <span
                          className={`size-1.5 shrink-0 rounded-full ${
                            on
                              ? "bg-emerald-400 shadow-[0_0_6px_#34d399]"
                              : "bg-zinc-700"
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Sidebar Premium Card */}
          <Link
            href={premiumHref}
            className="block rounded-2xl border border-brand-400/35 bg-gradient-to-br from-brand-950/85 via-ink-950 to-ink-950 p-3.5 transition-all hover:border-brand-400/65 hover:shadow-glow"
          >
            <div className="flex items-center gap-2 text-brand-300">
              <CrownIcon className="size-4" />
              <span className="font-display text-[13px] font-semibold text-white">
                {demoMode
                  ? `${brandName} Premium`
                  : data.premium?.activeTier
                    ? `${data.premium.activeTier.toUpperCase()} Active`
                    : `Upgrade to Premium`}
              </span>
            </div>
            <p className="mt-1 text-[11px] leading-snug text-zinc-400">
              {data.premium?.activeTier && !demoMode
                ? "Premium security guards & account perks unlocked."
                : `Anti-Betray, Vanity Guard, No-Prefix & Custom Bot from ${currency}299/mo.`}
            </p>
          </Link>
        </nav>

        {/* User Profile Footer */}
        <div className="border-t border-white/[0.07] bg-ink-950/60 p-3.5">
          {demoMode ? (
            <Link
              href="/login?next=/dashboard"
              className="btn-primary flex h-10 w-full items-center justify-center gap-2 rounded-xl text-[12.5px] font-semibold text-white"
            >
              <DiscordIcon className="size-4" />
              Connect Real Server
            </Link>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt=""
                      width={34}
                      height={34}
                      unoptimized
                      className="size-[34px] shrink-0 rounded-full ring-1 ring-brand-500/40"
                    />
                  ) : (
                    <span className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-brand-600/20 font-mono text-xs text-brand-300">
                      {user.username.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-[12.5px] font-semibold text-white">
                      {user.globalName || user.username}
                    </p>
                    <p className="truncate font-mono text-[9.5px] text-zinc-500">
                      @{user.username}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="shrink-0 rounded-lg border border-white/10 px-2.5 py-1 font-mono text-[9.5px] uppercase text-zinc-400 hover:border-brand-500/40 hover:text-white"
                >
                  Exit
                </button>
              </div>
              {user.isOwner && (
                <Link
                  href="/admin"
                  className="mt-2.5 flex items-center justify-center gap-1.5 rounded-lg border border-brand-500/30 bg-brand-950/40 py-1.5 font-mono text-[9.5px] uppercase tracking-wider text-brand-300 hover:text-white"
                >
                  <ShieldIcon className="size-3" />
                  Owner Admin Panel
                </Link>
              )}
            </>
          )}
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-white/[0.07] bg-ink-950/88 px-4 backdrop-blur-xl sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open module menu"
              className="inline-flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-zinc-200 lg:hidden"
            >
              <span className="flex flex-col gap-1">
                <span className="block h-[1.5px] w-4 bg-current" />
                <span className="block h-[1.5px] w-4 bg-current" />
                <span className="block h-[1.5px] w-4 bg-current" />
              </span>
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate font-display text-[16px] font-semibold text-white sm:text-[18px]">
                  {guild.name}
                </h1>
                <span
                  className={`hidden rounded-md border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider sm:inline-block ${
                    demoMode
                      ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-300"
                      : guild.owner
                        ? "border-amber-400/35 bg-amber-500/10 text-amber-300"
                        : "border-brand-500/30 bg-brand-950/40 text-brand-300"
                  }`}
                >
                  {demoMode ? "Live Demo" : guild.owner ? "Owner" : "Admin"}
                </span>
                <span className="hidden items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[9px] uppercase text-zinc-300 md:inline-flex">
                  Score {posture.score}/100 ({posture.grade})
                </span>
              </div>
              <p className="truncate font-mono text-[10px] text-zinc-500">
                {MODULE_LABELS[activeTab]} · Prefix {activePrefix}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={openCommandPalette}
              title="Search commands (⌘K)"
              className="hidden h-9 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 text-[11.5px] text-zinc-400 hover:border-brand-500/40 hover:text-white md:inline-flex"
            >
              <SearchIcon className="size-3.5 text-brand-400" />
              <span className="font-mono text-[10px]">⌘K</span>
            </button>

            <button
              type="button"
              onClick={() => setCliOpen(true)}
              title="Generate CLI setup commands"
              className="hidden h-9 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 text-[11.5px] font-medium text-zinc-300 hover:border-brand-500/40 hover:text-white sm:inline-flex"
            >
              <TerminalIcon className="size-3.5 text-brand-400" />
              <span>CLI</span>
            </button>

            <Link
              href={premiumHref}
              className="btn-primary btn-glow relative inline-flex h-9 items-center gap-1.5 overflow-hidden rounded-full px-4 text-[12px] font-semibold transition-all duration-300 ease-smooth hover:-translate-y-0.5 active:scale-[0.985]"
            >
              <CrownIcon className="size-3.5" />
              <span className="hidden sm:inline">
                {data.premium?.activeTier && !demoMode
                  ? `${data.premium.activeTier.toUpperCase()} Plan`
                  : "Premium"}
              </span>
              <span className="sm:hidden">Pro</span>
            </Link>

            {!demoMode && guild.botInGuild !== true && (
              <a
                href={guild.inviteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden h-9 items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.04] px-3.5 text-[12px] font-medium text-zinc-200 hover:border-brand-500/40 hover:text-white sm:inline-flex"
              >
                <PlusIcon className="size-3.5 text-brand-400" />
                Invite Bot
              </a>
            )}

            <button
              type="button"
              onClick={() => void loadGuild(true)}
              disabled={refreshing}
              title="Reload configuration"
              className="inline-flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-zinc-300 hover:border-white/25 hover:text-white disabled:opacity-50"
            >
              <RefreshIcon
                className={`size-3.5 ${refreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </header>

        {/* Toast notification */}
        {toast && (
          <div className="fixed right-5 top-20 z-50 max-w-sm">
            <div
              className={`animate-pop-in flex items-center gap-2.5 rounded-xl border px-4 py-3 text-[12.5px] font-medium shadow-panel backdrop-blur-xl ${
                toast.ok
                  ? "border-emerald-500/35 bg-ink-900/95 text-emerald-300"
                  : "border-brand-500/45 bg-ink-900/95 text-brand-200"
              }`}
            >
              {toast.ok && <CheckIcon className="size-4 shrink-0" />}
              <span>{toast.text}</span>
            </div>
          </div>
        )}

        {/* CLI Setup Modal */}
        {cliOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Generated CLI commands"
            onClick={() => setCliOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="animate-pop-in w-full max-w-xl rounded-3xl border border-brand-500/35 bg-ink-900 p-6 shadow-panel"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-brand-400">
                    Equivalent Bot CLI Script
                  </p>
                  <h2 className="mt-1 font-display text-[18px] font-semibold text-white">
                    Run in Discord ({cliCommands.length} commands)
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setCliOpen(false)}
                  className="rounded-lg border border-white/10 px-2.5 py-1 font-mono text-[11px] text-zinc-400 hover:text-white"
                >
                  ESC
                </button>
              </div>
              <pre className="mt-4 max-h-72 overflow-auto rounded-2xl border border-white/[0.07] bg-ink-950 p-4 font-mono text-[12px] leading-relaxed text-brand-200">
                {cliCommands.join("\n") || `${activePrefix}help`}
              </pre>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-[10.5px] text-zinc-500">
                  Generated live from your current dashboard config
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(cliCommands.join("\n"));
                      setCliCopied(true);
                      window.setTimeout(() => setCliCopied(false), 1800);
                    } catch {
                      // Ignore
                    }
                  }}
                  className="btn-primary inline-flex h-10 items-center gap-2 rounded-xl px-4 text-[12.5px] font-semibold text-white"
                >
                  {cliCopied ? (
                    <>
                      <CheckIcon className="size-3.5" />
                      Copied All Commands
                    </>
                  ) : (
                    <>
                      <CopyIcon className="size-3.5" />
                      Copy Script
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Body */}
        <main className="mx-auto w-full max-w-[1120px] flex-1 space-y-6 px-4 pb-28 pt-6 sm:px-7">
          {/* Server Preview Banner */}
          {demoMode && (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-400/30 bg-gradient-to-r from-brand-950/70 via-ink-900/90 to-ink-950 px-5 py-3.5">
              <div className="flex items-center gap-3">
                <ShieldIcon className="size-4 shrink-0 text-brand-300" />
                <p className="text-[12.5px] text-zinc-200">
                  <strong className="font-semibold text-white">
                    Server Control Preview:
                  </strong>{" "}
                  Explore all 12 modules, configure security shields, customize embeds, and test server settings.
                </p>
              </div>
              <Link
                href="/login?next=/dashboard"
                className="btn-primary inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3.5 font-mono text-[10.5px] font-semibold text-white"
              >
                Connect Your Server →
              </Link>
            </div>
          )}

          {/* Invite CTA banner when bot is verified NOT in guild */}
          {!demoMode && guild.botInGuild === false && (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-500/35 bg-brand-950/35 px-5 py-4">
              <div>
                <p className="font-display text-[15px] font-semibold text-white">
                  {brandName} is not in {guild.name} yet
                </p>
                <p className="mt-0.5 text-[12.5px] text-zinc-400">
                  Invite {brandName} now so your saved Anti-Nuke, AutoMod,
                  VoiceMaster, and Ticket settings activate immediately.
                </p>
              </div>
              <a
                href={guild.inviteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex h-10 items-center gap-2 rounded-full px-5 text-[12.5px] font-semibold active:scale-[0.985]"
              >
                Invite to {guild.name}
                <ArrowRight className="size-3.5" />
              </a>
            </div>
          )}

          {/* OVERVIEW & GENERAL */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stat Row */}
              <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
                <StatCard
                  label="Security Posture"
                  value={`${posture.score}/100`}
                  badge={posture.grade}
                  sub={posture.label}
                  barPct={posture.score}
                  accent
                />
                <StatCard
                  label="Anti-Nuke Shield"
                  value={
                    draft.antinuke.enabled
                      ? `${armedGuards}/${ANTINUKE_RULE_META.length}`
                      : "Paused"
                  }
                  sub={
                    draft.antinuke.autoRollback
                      ? `Punish: ${draft.antinuke.punishment} · rollback on`
                      : `Punish: ${draft.antinuke.punishment}`
                  }
                />
                <StatCard
                  label="Active Modules"
                  value={`${enabledModulesCount}/${toggleableModulesCount}`}
                  sub={`${draft.whitelist.users.length} whitelisted · ${draft.utility.embeds?.length ?? 0} embeds`}
                />
                <StatCard
                  label="Server Reach"
                  value={
                    guild.memberCount !== null
                      ? guild.memberCount.toLocaleString()
                      : guild.botInGuild === false
                        ? "Invite Bot"
                        : "Protected"
                  }
                  sub={
                    guild.onlineCount !== null
                      ? `${guild.onlineCount.toLocaleString()} online${guild.boostCount ? ` · ${guild.boostCount} boosts` : ""}`
                      : `Prefix "${activePrefix}" active`
                  }
                />
              </div>

              {/* 1-Click Security Presets + Config Backup Toolkit */}
              <div className="panel panel-inner space-y-4 rounded-2xl p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-brand-400">
                      One-Click Protection Profiles
                    </p>
                    <p className="mt-0.5 text-[12.5px] text-zinc-400">
                      Apply an engineered security profile instantly, or back up &amp; restore your server configuration as JSON.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExportJson}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-ink-950/80 px-3 font-mono text-[10.5px] text-zinc-300 transition hover:border-brand-500/40 hover:text-white"
                    >
                      <DownloadIcon className="size-3.5 text-brand-400" />
                      Export JSON
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-ink-950/80 px-3 font-mono text-[10.5px] text-zinc-300 transition hover:border-brand-500/40 hover:text-white"
                    >
                      <UploadIcon className="size-3.5 text-brand-400" />
                      Import JSON
                    </button>
                    <button
                      type="button"
                      onClick={() => setCliOpen(true)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-ink-950/80 px-3 font-mono text-[10.5px] text-zinc-300 transition hover:border-brand-500/40 hover:text-white"
                    >
                      <TerminalIcon className="size-3.5 text-brand-400" />
                      CLI Script
                    </button>
                    <button
                      type="button"
                      onClick={handleFactoryDefaults}
                      className="inline-flex h-8 items-center rounded-lg border border-white/10 bg-ink-950/80 px-3 font-mono text-[10.5px] text-zinc-400 transition hover:border-white/25 hover:text-white"
                    >
                      Defaults
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {SECURITY_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        updateDraft((prev) => preset.apply(prev));
                        showToast(
                          true,
                          `Applied "${preset.name}" preset — click Save Changes to commit.`,
                        );
                      }}
                      className="group flex flex-col justify-between rounded-xl border border-white/[0.08] bg-ink-950/75 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-brand-500/45 hover:bg-brand-950/25"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="rounded-md border border-brand-500/30 bg-brand-950/50 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-brand-300">
                            {preset.badge}
                          </span>
                          <span className="font-mono text-[10px] text-zinc-600 transition group-hover:text-brand-300">
                            Apply →
                          </span>
                        </div>
                        <p className="mt-2.5 font-display text-[14.5px] font-semibold text-white">
                          {preset.name}
                        </p>
                        <p className="mt-1 text-[11.5px] leading-relaxed text-zinc-400">
                          {preset.summary}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* General Bot Settings */}
              <ModuleHeader
                eyebrow="General Configuration"
                title="Server Bot Settings"
                description={`Customize how ${brandName} responds inside ${guild.name}, including prefix, embed theme color, command cleanup, and ignored channels.`}
                command={`${activePrefix}help`}
              />

              <div className="panel panel-inner space-y-5 rounded-2xl p-5 sm:p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                      Command Prefix
                    </span>
                    <input
                      type="text"
                      maxLength={5}
                      value={draft.general.prefix}
                      onChange={(e) =>
                        updateDraft((p) => ({
                          ...p,
                          general: { ...p.general, prefix: e.target.value },
                        }))
                      }
                      placeholder={site.prefix}
                      className="mt-1.5 h-10 w-full rounded-xl border border-white/10 bg-ink-950/90 px-3.5 font-mono text-[14px] text-white focus:border-brand-500/50 focus:outline-none"
                    />
                  </label>

                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                      Embed Accent Color
                    </span>
                    <div className="mt-1.5">
                      <ColorSwatchSelect
                        value={draft.general.embedColor}
                        onChange={(embedColor) =>
                          updateDraft((p) => ({
                            ...p,
                            general: {
                              ...p.general,
                              embedColor,
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <ToggleRow
                    title="Auto-Delete Command Triggers"
                    description="Remove user command messages after execution for cleaner chats"
                    checked={draft.general.deleteCommands}
                    onChange={(deleteCommands) =>
                      updateDraft((p) => ({
                        ...p,
                        general: { ...p.general, deleteCommands },
                      }))
                    }
                  />
                  <ToggleRow
                    title="DM Users on Moderation Action"
                    description="Notify sanctioned members via DM with case reason & server name"
                    checked={draft.general.dmOnPunish}
                    onChange={(dmOnPunish) =>
                      updateDraft((p) => ({
                        ...p,
                        general: { ...p.general, dmOnPunish },
                      }))
                    }
                  />
                </div>

                {/* Ignored Channels & Roles */}
                <div className="grid gap-4 border-t border-white/[0.06] pt-4 sm:grid-cols-2">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                      Ignored Channels ({draft.general.ignoredChannels.length})
                    </span>
                    <div className="mt-1.5 flex gap-2">
                      {guild.channels.filter((c) => c.type === "text").length >
                      0 ? (
                        <CustomSelect
                          className="flex-1"
                          size="sm"
                          title="Select Ignored Channel"
                          placeholder="Select channel…"
                          value={ignChanInput}
                          onChange={setIgnChanInput}
                          options={guild.channels
                            .filter((c) => c.type === "text")
                            .map((c) => ({
                              value: c.id,
                              label: c.name,
                              prefix: "#",
                            }))}
                        />
                      ) : (
                        <input
                          type="text"
                          value={ignChanInput}
                          onChange={(e) => setIgnChanInput(e.target.value)}
                          placeholder="#bot-spam or Channel ID"
                          className="h-9 flex-1 rounded-lg border border-white/10 bg-ink-950 px-3 font-mono text-[11.5px] text-white placeholder:text-zinc-600 focus:outline-none"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (!ignChanInput.trim()) return;
                          updateDraft((p) => ({
                            ...p,
                            general: {
                              ...p.general,
                              ignoredChannels: Array.from(
                                new Set([
                                  ...p.general.ignoredChannels,
                                  ignChanInput.trim(),
                                ]),
                              ),
                            },
                          }));
                          setIgnChanInput("");
                        }}
                        className="h-9 rounded-lg border border-white/15 bg-white/[0.05] px-3 text-[12px] text-white hover:bg-white/[0.1]"
                      >
                        Add
                      </button>
                    </div>
                    {draft.general.ignoredChannels.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {draft.general.ignoredChannels.map((ch) => (
                          <span
                            key={ch}
                            className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-ink-950 px-2 py-0.5 font-mono text-[10.5px] text-zinc-300"
                          >
                            {resolveChannelLabel(ch)}
                            <button
                              type="button"
                              onClick={() =>
                                updateDraft((p) => ({
                                  ...p,
                                  general: {
                                    ...p.general,
                                    ignoredChannels:
                                      p.general.ignoredChannels.filter(
                                        (x) => x !== ch,
                                      ),
                                  },
                                }))
                              }
                              className="text-zinc-500 hover:text-brand-400"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                      Ignored Roles ({draft.general.ignoredRoles.length})
                    </span>
                    <div className="mt-1.5 flex gap-2">
                      {guild.roles.length > 0 ? (
                        <CustomSelect
                          className="flex-1"
                          size="sm"
                          title="Select Ignored Role"
                          placeholder="Select role…"
                          value={ignRoleInput}
                          onChange={setIgnRoleInput}
                          options={guild.roles.map((r) => ({
                            value: r.id,
                            label: `@${r.name}`,
                            colorDot: r.color || "#facc15",
                          }))}
                        />
                      ) : (
                        <input
                          type="text"
                          value={ignRoleInput}
                          onChange={(e) => setIgnRoleInput(e.target.value)}
                          placeholder="@Muted or Role ID"
                          className="h-9 flex-1 rounded-lg border border-white/10 bg-ink-950 px-3 font-mono text-[11.5px] text-white placeholder:text-zinc-600 focus:outline-none"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (!ignRoleInput.trim()) return;
                          updateDraft((p) => ({
                            ...p,
                            general: {
                              ...p.general,
                              ignoredRoles: Array.from(
                                new Set([
                                  ...p.general.ignoredRoles,
                                  ignRoleInput.trim(),
                                ]),
                              ),
                            },
                          }));
                          setIgnRoleInput("");
                        }}
                        className="h-9 rounded-lg border border-white/15 bg-white/[0.05] px-3 text-[12px] text-white hover:bg-white/[0.1]"
                      >
                        Add
                      </button>
                    </div>
                    {draft.general.ignoredRoles.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {draft.general.ignoredRoles.map((rl) => (
                          <span
                            key={rl}
                            className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-ink-950 px-2 py-0.5 font-mono text-[10.5px] text-zinc-300"
                          >
                            {resolveRoleLabel(rl)}
                            <button
                              type="button"
                              onClick={() =>
                                updateDraft((p) => ({
                                  ...p,
                                  general: {
                                    ...p.general,
                                    ignoredRoles: p.general.ignoredRoles.filter(
                                      (x) => x !== rl,
                                    ),
                                  },
                                }))
                              }
                              className="text-zinc-500 hover:text-brand-400"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* All Bot Modules Grid */}
              <div>
                <div className="mb-3.5 flex items-center justify-between">
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.26em] text-brand-400">
                    All Server Modules ({overviewModules.length})
                  </p>
                  <span className="font-mono text-[10px] text-zinc-500">
                    Toggle directly or click Configure
                  </span>
                </div>
                <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                  {overviewModules.map((mod) => (
                    <div
                      key={mod.id}
                      className="panel panel-inner flex flex-col justify-between rounded-2xl p-5 transition-all hover:border-brand-500/35"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-display text-[15.5px] font-semibold text-white">
                              {mod.title}
                            </h3>
                            <code className="font-mono text-[10px] text-zinc-500">
                              {mod.cmd}
                            </code>
                          </div>
                          {typeof mod.enabled === "boolean" && mod.onToggle && (
                            <Toggle
                              checked={mod.enabled}
                              onChange={mod.onToggle}
                              label={`Toggle ${mod.title}`}
                            />
                          )}
                        </div>
                        <p className="mt-2.5 text-[12.5px] leading-relaxed text-zinc-400">
                          {mod.desc}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/[0.06] pt-3">
                        <span className="truncate font-mono text-[10px] text-zinc-500">
                          {mod.meta}
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveTab(mod.id)}
                          className="group inline-flex shrink-0 items-center gap-1 font-mono text-[10.5px] uppercase tracking-wider text-brand-400 hover:text-brand-300"
                        >
                          Configure
                          <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "antinuke" && (
            <AntiNukeModule
              config={draft}
              update={updateDraft}
              channels={guild.channels}
              premiumHref={premiumHref}
              prefix={activePrefix}
            />
          )}

          {activeTab === "whitelist" && (
            <WhitelistModule
              config={draft}
              update={updateDraft}
              roles={guild.roles}
              prefix={activePrefix}
            />
          )}

          {activeTab === "automod" && (
            <AutoModModule
              config={draft}
              update={updateDraft}
              channels={guild.channels}
              prefix={activePrefix}
            />
          )}

          {activeTab === "verification" && (
            <VerificationModule
              config={draft}
              update={updateDraft}
              channels={guild.channels}
              roles={guild.roles}
              guildName={guild.name}
              prefix={activePrefix}
            />
          )}

          {activeTab === "nightmode" && (
            <NightModeModule
              config={draft}
              update={updateDraft}
              roles={guild.roles}
              prefix={activePrefix}
            />
          )}

          {activeTab === "moderation" && (
            <ModerationModule
              config={draft}
              update={updateDraft}
              channels={guild.channels}
              roles={guild.roles}
              prefix={activePrefix}
            />
          )}

          {activeTab === "welcomer" && (
            <WelcomerModule
              config={draft}
              update={updateDraft}
              channels={guild.channels}
              guildName={guild.name}
              memberCount={guild.memberCount}
              username={user.username}
              prefix={activePrefix}
            />
          )}

          {activeTab === "voicemaster" && (
            <VoiceMasterModule
              config={draft}
              update={updateDraft}
              channels={guild.channels}
              prefix={activePrefix}
            />
          )}

          {activeTab === "tickets" && (
            <TicketsModule
              config={draft}
              update={updateDraft}
              channels={guild.channels}
              roles={guild.roles}
              prefix={activePrefix}
            />
          )}

          {activeTab === "logging" && (
            <LoggingModule
              config={draft}
              update={updateDraft}
              channels={guild.channels}
              logs={data.logs}
              prefix={activePrefix}
            />
          )}

          {activeTab === "utility" && (
            <UtilityModule
              config={draft}
              update={updateDraft}
              channels={guild.channels}
              roles={guild.roles}
              prefix={activePrefix}
            />
          )}
        </main>

        {/* Floating Unsaved Changes Save Bar */}
        {isDirty && (
          <div className="pb-safe fixed inset-x-0 bottom-3 z-40 px-3 sm:bottom-4 sm:px-4 lg:left-[274px]">
            <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-400/45 bg-ink-900/95 px-4 py-3 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.92),0_0_34px_-8px_rgb(var(--brand-500)/0.45)] backdrop-blur-2xl sm:px-5 sm:py-3.5">
              <div className="flex items-center gap-2.5">
                <span className="size-2 animate-ticker rounded-full bg-brand-400 shadow-[0_0_8px_rgb(var(--brand-400))]" />
                <p className="text-[12.5px] font-medium text-white sm:text-[13px]">
                  Unsaved changes ready{" "}
                  <span className="hidden font-mono text-[10px] text-zinc-500 sm:inline">
                    (⌘S)
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleReset}
                  className="h-9 rounded-xl border border-brand-200/15 px-3.5 text-[12.5px] font-medium text-zinc-300 transition-colors hover:border-brand-200/35 hover:text-white disabled:opacity-50"
                >
                  Reset
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void handleSave()}
                  className="btn-primary h-9 rounded-full px-5 text-[12.5px] font-semibold active:scale-[0.985] disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  badge,
  barPct,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  badge?: string;
  barPct?: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 ${
        accent
          ? "border-brand-500/35 bg-gradient-to-br from-brand-950/50 to-ink-900/85"
          : "border-white/[0.07] bg-white/[0.02]"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-zinc-500">
          {label}
        </p>
        {badge && (
          <span className="rounded-md border border-emerald-500/35 bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[9.5px] font-semibold text-emerald-300">
            {badge}
          </span>
        )}
      </div>
      <p className="mt-2 font-display text-[25px] font-bold tracking-tight text-white">
        {value}
      </p>
      {typeof barPct === "number" && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
          <div
            style={{ width: `${barPct}%` }}
            className={`h-full rounded-full transition-all duration-500 ${
              barPct >= 80
                ? "bg-gradient-to-r from-emerald-500 to-emerald-300"
                : barPct >= 55
                  ? "bg-gradient-to-r from-amber-500 to-amber-300"
                  : "bg-gradient-to-r from-brand-600 to-brand-400"
            }`}
          />
        </div>
      )}
      <p className="mt-1.5 truncate font-mono text-[10px] text-zinc-500">
        {sub}
      </p>
    </div>
  );
}
