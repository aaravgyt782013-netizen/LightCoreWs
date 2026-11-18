"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { site, type LogEntry } from "@/lib/site";
import {
  ANTINUKE_RULE_META,
  mergeGuildConfig,
  type GuildConfig,
} from "@/lib/guild-config";
import type {
  DiscordChannelOption,
  DiscordRoleOption,
} from "@/lib/discord-guilds";
import { Logo, Wordmark } from "@/components/ui/Logo";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import {
  ArrowRight,
  BellIcon,
  BotIcon,
  CheckIcon,
  ChevronLeftIcon,
  CrownIcon,
  DiscordIcon,
  GiftIcon,
  GridIcon,
  LockIcon,
  LogListIcon,
  MoonIcon,
  PlusIcon,
  RefreshIcon,
  ShieldIcon,
  SlidersIcon,
  TicketIcon,
  UsersIcon,
  VoiceIcon,
} from "@/components/ui/Icons";
import { ModuleHeader, Toggle, ToggleRow } from "./Controls";
import {
  AntiNukeModule,
  AutoModModule,
  NightModeModule,
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

type ModuleId =
  | "overview"
  | "antinuke"
  | "whitelist"
  | "automod"
  | "nightmode"
  | "moderation"
  | "welcomer"
  | "voicemaster"
  | "tickets"
  | "logging"
  | "utility";

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
    badge?: string;
  }[];
}[] = [
  {
    heading: "General",
    items: [{ id: "overview", label: "Overview", icon: GridIcon }],
  },
  {
    heading: "Security Setup",
    items: [
      { id: "antinuke", label: "Anti-Nuke", icon: ShieldIcon },
      { id: "whitelist", label: "Whitelist & Owners", icon: UsersIcon },
      { id: "automod", label: "AutoMod", icon: BotIcon },
      { id: "nightmode", label: "Night Mode", icon: MoonIcon },
    ],
  },
  {
    heading: "Server Management",
    items: [
      { id: "moderation", label: "Moderation & Roles", icon: SlidersIcon },
      { id: "welcomer", label: "Welcomer", icon: BellIcon },
      { id: "voicemaster", label: "VoiceMaster", icon: VoiceIcon },
      { id: "tickets", label: "Tickets", icon: TicketIcon },
      { id: "logging", label: "Audit Logging", icon: LogListIcon },
      {
        id: "utility",
        label: "AutoResponder & GWs",
        icon: GiftIcon,
      },
    ],
  },
];

const MODULE_LABELS: Record<ModuleId, string> = {
  overview: "General Settings",
  antinuke: "Anti-Nuke",
  whitelist: "Whitelist & Extra Owners",
  automod: "AutoMod",
  nightmode: "Night Mode",
  moderation: "Moderation & AutoRole",
  welcomer: "Welcomer",
  voicemaster: "VoiceMaster",
  tickets: "Tickets",
  logging: "Audit Logging",
  utility: "AutoResponder & Giveaways",
};

const COLOR_PRESETS = [
  "#ef1010",
  "#ff2b2b",
  "#f59e0b",
  "#10b981",
  "#5865f2",
  "#a855f7",
  "#ffffff",
];

function stripMeta(cfg: GuildConfig): string {
  return JSON.stringify({ ...cfg, updatedAt: null, updatedBy: null });
}

function storageKey(guildId: string): string {
  return `lc_guild_cfg_${guildId}`;
}

export function GuildDashboardClient({ guildId }: { guildId: string }) {
  const router = useRouter();
  const [viewState, setViewState] = useState<
    "loading" | "guest" | "forbidden" | "error" | "ready"
  >("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [transitionMsg, setTransitionMsg] = useState<string | null>(null);

  const [data, setData] = useState<GuildPayload | null>(null);
  const [savedConfig, setSavedConfig] = useState<GuildConfig | null>(null);
  const [draft, setDraft] = useState<GuildConfig | null>(null);
  const [activeTab, setActiveTab] = useState<ModuleId>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(
    null,
  );

  // Ignored channels/roles inputs for Overview tab
  const [ignChanInput, setIgnChanInput] = useState("");
  const [ignRoleInput, setIgnRoleInput] = useState("");

  const showToast = useCallback((ok: boolean, text: string) => {
    setToast({ ok, text });
    window.setTimeout(() => {
      setToast((cur) => (cur?.text === text ? null : cur));
    }, 3800);
  }, []);

  const loadGuild = useCallback(
    async (isRefresh = false) => {
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
        let resolvedConfig = payload.config;

        // Recover browser backup if serverless instance cold-started without BOT_API_URL
        if (!payload.syncedWithBot && !payload.config.updatedAt) {
          try {
            const raw = window.localStorage.getItem(storageKey(guildId));
            if (raw) {
              const parsed = JSON.parse(raw) as GuildConfig;
              resolvedConfig = mergeGuildConfig(
                payload.config,
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
        setErrorMsg("Network error while connecting to LightCore gateway.");
        setViewState("error");
      } finally {
        setRefreshing(false);
      }
    },
    [guildId],
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

  const handleSave = async () => {
    if (!draft || saving) return;
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

      // Append fresh audit log item locally
      if (data) {
        setData({
          ...data,
          syncedWithBot: Boolean(json.syncedWithBot),
          logs: [
            {
              id: `local-${Date.now()}`,
              t: "CONFIG",
              ok: true,
              msg: `${MODULE_LABELS[activeTab]} updated by @${data.user.username}`,
              guild: data.guild.name,
              guildId: data.guild.id,
              ts: new Date().toISOString(),
            },
            ...data.logs,
          ].slice(0, 30),
        });
      }

      showToast(
        true,
        json.syncedWithBot
          ? `${MODULE_LABELS[activeTab]} saved & synced live with ${site.name}!`
          : `${MODULE_LABELS[activeTab]} saved successfully!`,
      );
    } catch {
      showToast(false, "Network error while saving settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!savedConfig) return;
    setDraft(structuredClone(savedConfig));
    showToast(true, "Reverted unsaved changes.");
  };

  const handleSwitchGuild = (nextId: string) => {
    if (!nextId || nextId === guildId) return;
    const target = data?.switcherGuilds.find((g) => g.id === nextId);
    setTransitionMsg(
      `Switching to ${target?.name || nextId} · loading configuration`,
    );
    router.push(`/dashboard/${nextId}`);
  };

  const handleLogout = async () => {
    setTransitionMsg("Closing session securely…");
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  if (viewState === "loading") {
    return (
      <LoadingScreen
        label="Connection Establishing..."
        sublabel={`Binding ${site.name} modules for server ${guildId}`}
      />
    );
  }

  if (transitionMsg) {
    return (
      <LoadingScreen
        label="Connection Establishing..."
        sublabel={transitionMsg}
      />
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
            Authenticate with Discord to manage {site.name} features and
            security controls for server{" "}
            <code className="font-mono text-zinc-300">{guildId}</code>.
          </p>
          <a
            href={`/api/auth/discord?next=${encodeURIComponent(`/dashboard/${guildId}`)}`}
            onClick={() =>
              setTransitionMsg("Redirecting to Discord OAuth2 gateway…")
            }
            className="btn-glow relative mt-6 inline-flex h-12 w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-[#5865F2] text-[14px] font-semibold text-white hover:bg-[#4752C4]"
          >
            <DiscordIcon className="size-[18px]" />
            Continue with Discord
          </a>
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
              className="inline-flex h-10 items-center gap-2 rounded-full bg-brand-600 px-5 text-[13px] font-semibold text-white hover:bg-brand-500"
            >
              Choose Another Server
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
  const activePrefix = draft.general.prefix || site.prefix;
  const premiumHref = `/premium?guild=${encodeURIComponent(guild.id)}&name=${encodeURIComponent(guild.name)}`;

  const armedGuards = ANTINUKE_RULE_META.filter(
    (r) => draft.antinuke.rules[r.key].enabled,
  ).length;

  const isModuleActive = (id: ModuleId): boolean | null => {
    switch (id) {
      case "antinuke":
        return draft.antinuke.enabled;
      case "automod":
        return draft.automod.enabled;
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
          draft.utility.autoResponders.length > 0
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
      desc: "Sub-500ms protection across bans, channels, roles, webhooks & bots.",
      cmd: `${activePrefix}antinuke`,
      enabled: draft.antinuke.enabled,
      onToggle: (enabled) =>
        updateDraft((p) => ({ ...p, antinuke: { ...p.antinuke, enabled } })),
      meta: `${armedGuards}/${ANTINUKE_RULE_META.length} guards · ${draft.antinuke.punishment}`,
    },
    {
      id: "whitelist",
      title: "Whitelist & Extra Owners",
      desc: "Trusted staff exemptions, extra owners, and bypass roles.",
      cmd: `${activePrefix}whitelist`,
      meta: `${draft.whitelist.users.length} users · ${draft.whitelist.extraOwners.length} extra owners`,
    },
    {
      id: "automod",
      title: "AutoMod Firewall",
      desc: "Anti-Spam, Anti-Link, Anti-Invite, Token Spam, Caps & Bad Words.",
      cmd: `${activePrefix}automod`,
      enabled: draft.automod.enabled,
      onToggle: (enabled) =>
        updateDraft((p) => ({ ...p, automod: { ...p.automod, enabled } })),
      meta: `Action: ${draft.automod.punishment.replace("_", " ")}`,
    },
    {
      id: "nightmode",
      title: "Night Mode",
      desc: "Scheduled overnight channel freeze & permission lockdown.",
      cmd: `${activePrefix}nightmode`,
      enabled: draft.nightmode.enabled,
      onToggle: (enabled) =>
        updateDraft((p) => ({ ...p, nightmode: { ...p.nightmode, enabled } })),
      meta: `${draft.nightmode.startTime}–${draft.nightmode.endTime} (${draft.nightmode.timezone})`,
    },
    {
      id: "moderation",
      title: "Moderation & AutoRole",
      desc: "Warning ladders, mute roles, human/bot join roles & sticky nicks.",
      cmd: `${activePrefix}autorole`,
      meta: `Mute @${draft.moderation.warnMuteThreshold}w · Ban @${draft.moderation.warnBanThreshold}w`,
    },
    {
      id: "welcomer",
      title: "Welcomer & Leave",
      desc: "Custom join/leave messages, rich embeds, banners & DM greets.",
      cmd: `${activePrefix}greet`,
      enabled: draft.welcomer.enabled,
      onToggle: (enabled) =>
        updateDraft((p) => ({ ...p, welcomer: { ...p.welcomer, enabled } })),
      meta: draft.welcomer.useEmbed ? "Rich embed active" : "Plain text mode",
    },
    {
      id: "voicemaster",
      title: "VoiceMaster",
      desc: "Join-to-Create temporary voice rooms with in-chat room controls.",
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
      title: "Ticketing",
      desc: "Category ticket panels, staff assignment & HTML transcripts.",
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
      title: "AutoResponder & Giveaways",
      desc: "Custom trigger replies and role-gated community giveaways.",
      cmd: `${activePrefix}gstart`,
      enabled: draft.utility.giveaways.enabled,
      onToggle: (enabled) =>
        updateDraft((p) => ({
          ...p,
          utility: {
            ...p.utility,
            giveaways: { ...p.utility.giveaways, enabled },
          },
        })),
      meta: `${draft.utility.autoResponders.length} triggers · ${draft.utility.giveaways.emoji} giveaways`,
    },
  ];

  const enabledModulesCount = overviewModules.filter(
    (m) => m.enabled === true,
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
    <div className="relative flex min-h-screen bg-ink-950 text-zinc-100">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Left Control Sidebar (Xieron + Zynrax style) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[274px] flex-col border-r border-white/[0.07] bg-ink-900/95 backdrop-blur-xl transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand + Back */}
        <div className="flex h-16 items-center justify-between border-b border-white/[0.07] px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={30} />
            <span className="font-display text-[14.5px] font-semibold tracking-[0.16em] text-white">
              <Wordmark />
            </span>
          </Link>
          <Link
            href="/dashboard"
            onClick={() => setTransitionMsg("Loading your server selector…")}
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-wider text-zinc-400 hover:border-white/25 hover:text-white"
          >
            <ChevronLeftIcon className="size-3" />
            Servers
          </Link>
        </div>

        {/* Quick Server Switcher */}
        <div className="border-b border-white/[0.07] p-3.5">
          <div className="flex items-center gap-2.5">
            {guild.iconUrl ? (
              <Image
                src={guild.iconUrl}
                alt={guild.name}
                width={36}
                height={36}
                unoptimized
                className="size-9 shrink-0 rounded-xl object-cover ring-1 ring-white/15"
              />
            ) : (
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-950/70 font-display text-xs font-bold text-brand-300 ring-1 ring-brand-500/30">
                {guild.name.slice(0, 2).toUpperCase()}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <select
                aria-label="Switch Discord server"
                value={guild.id}
                onChange={(e) => handleSwitchGuild(e.target.value)}
                className="w-full cursor-pointer truncate rounded-lg border border-white/[0.08] bg-ink-950/80 px-2.5 py-1.5 text-[12.5px] font-semibold text-white focus:border-brand-500/50 focus:outline-none"
              >
                {switcherGuilds.map((sg) => (
                  <option key={sg.id} value={sg.id}>
                    {sg.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
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
            className="block rounded-2xl border border-amber-400/30 bg-gradient-to-br from-brand-950/70 via-ink-950 to-amber-950/35 p-3.5 transition-all hover:border-amber-400/60"
          >
            <div className="flex items-center gap-2 text-amber-300">
              <CrownIcon className="size-4" />
              <span className="font-display text-[13px] font-semibold">
                Buy {site.name} Premium
              </span>
            </div>
            <p className="mt-1 text-[11px] leading-snug text-zinc-400">
              Unlock Anti-Betray, Vanity Guard, No-Prefix &amp; Custom Bot from
              ₹299/mo.
            </p>
          </Link>
        </nav>

        {/* User Profile Footer */}
        <div className="border-t border-white/[0.07] bg-ink-950/60 p-3.5">
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
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-white/[0.07] bg-ink-950/85 px-4 backdrop-blur-xl sm:px-7">
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
                    guild.owner
                      ? "border-amber-400/35 bg-amber-500/10 text-amber-300"
                      : "border-brand-500/30 bg-brand-950/40 text-brand-300"
                  }`}
                >
                  {guild.owner ? "Owner" : "Admin"}
                </span>
                {guild.botInGuild === true && (
                  <span className="hidden items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] uppercase text-emerald-400 md:inline-flex">
                    <span className="size-1.5 rounded-full bg-emerald-400" />
                    Bot Active
                  </span>
                )}
              </div>
              <p className="truncate font-mono text-[10px] text-zinc-500">
                {MODULE_LABELS[activeTab]} · ID {guild.id}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={premiumHref}
              className="btn-glow relative inline-flex h-9 items-center gap-1.5 overflow-hidden rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 px-3.5 text-[12px] font-semibold text-white shadow-[0_6px_24px_-6px_rgba(239,16,16,0.85)] transition-transform hover:-translate-y-0.5"
            >
              <CrownIcon className="size-3.5" />
              <span className="hidden sm:inline">Buy Premium</span>
              <span className="sm:hidden">Pro</span>
            </Link>

            {guild.botInGuild !== true && (
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
              title="Reload server data"
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
              className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-[12.5px] font-medium shadow-panel backdrop-blur-xl ${
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

        {/* Main Content Body */}
        <main className="mx-auto w-full max-w-[1120px] flex-1 space-y-6 px-4 pb-28 pt-6 sm:px-7">
          {/* Invite CTA banner when bot is verified NOT in guild */}
          {guild.botInGuild === false && (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-500/35 bg-brand-950/35 px-5 py-4">
              <div>
                <p className="font-display text-[15px] font-semibold text-white">
                  {site.name} is not in {guild.name} yet
                </p>
                <p className="mt-0.5 text-[12.5px] text-zinc-400">
                  Invite {site.name} now so your saved Anti-Nuke, AutoMod,
                  VoiceMaster, and Ticket settings activate immediately.
                </p>
              </div>
              <a
                href={guild.inviteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-600 px-4 text-[12.5px] font-semibold text-white hover:bg-brand-500"
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
                  accent
                />
                <StatCard
                  label="Active Modules"
                  value={`${enabledModulesCount}/8`}
                  sub={`${draft.whitelist.users.length} whitelisted · ${draft.whitelist.extraOwners.length} extra owners`}
                />
                <StatCard
                  label="Server Members"
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
                      : `Guild ${guild.id.slice(0, 10)}…`
                  }
                />
                <StatCard
                  label="Command Prefix"
                  value={activePrefix}
                  sub={
                    savedConfig?.updatedAt
                      ? `Saved by ${savedConfig.updatedBy || "staff"}`
                      : "Default profile active"
                  }
                />
              </div>

              {/* General Bot Settings */}
              <ModuleHeader
                eyebrow="General Configuration"
                title="Server Bot Settings"
                description={`Customize how ${site.name} responds inside ${guild.name}, including prefix, embed theme color, command cleanup, and ignored channels.`}
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
                    <div className="mt-1.5 flex items-center gap-2">
                      <input
                        type="color"
                        value={draft.general.embedColor}
                        onChange={(e) =>
                          updateDraft((p) => ({
                            ...p,
                            general: {
                              ...p.general,
                              embedColor: e.target.value,
                            },
                          }))
                        }
                        className="h-10 w-12 cursor-pointer rounded-xl border border-white/10 bg-ink-950 p-1"
                      />
                      <input
                        type="text"
                        maxLength={7}
                        value={draft.general.embedColor}
                        onChange={(e) =>
                          updateDraft((p) => ({
                            ...p,
                            general: {
                              ...p.general,
                              embedColor: e.target.value,
                            },
                          }))
                        }
                        className="h-10 w-28 rounded-xl border border-white/10 bg-ink-950/90 px-3 font-mono text-[12.5px] text-white focus:outline-none"
                      />
                      <div className="hidden items-center gap-1.5 sm:flex">
                        {COLOR_PRESETS.map((c) => (
                          <button
                            key={c}
                            type="button"
                            aria-label={`Set color ${c}`}
                            onClick={() =>
                              updateDraft((p) => ({
                                ...p,
                                general: { ...p.general, embedColor: c },
                              }))
                            }
                            className="size-6 rounded-full border border-white/20 transition-transform hover:scale-110"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
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
                        <select
                          value={ignChanInput}
                          onChange={(e) => setIgnChanInput(e.target.value)}
                          className="h-9 flex-1 rounded-lg border border-white/10 bg-ink-950 px-2.5 text-[12px] text-white focus:outline-none"
                        >
                          <option value="">Select channel…</option>
                          {guild.channels
                            .filter((c) => c.type === "text")
                            .map((c) => (
                              <option key={c.id} value={c.id}>
                                # {c.name}
                              </option>
                            ))}
                        </select>
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
                        <select
                          value={ignRoleInput}
                          onChange={(e) => setIgnRoleInput(e.target.value)}
                          className="h-9 flex-1 rounded-lg border border-white/10 bg-ink-950 px-2.5 text-[12px] text-white focus:outline-none"
                        >
                          <option value="">Select role…</option>
                          {guild.roles.map((r) => (
                            <option key={r.id} value={r.id}>
                              @ {r.name}
                            </option>
                          ))}
                        </select>
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
                    Click any module to configure
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
              roles={guild.roles}
              prefix={activePrefix}
            />
          )}
        </main>

        {/* Floating Unsaved Changes Save Bar (Discord / Xieron / Zynrax style) */}
        {isDirty && (
          <div className="fixed inset-x-0 bottom-4 z-40 px-4 lg:left-[274px]">
            <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-500/45 bg-ink-900/95 px-5 py-3.5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.9),0_0_30px_-8px_rgba(239,16,16,0.45)] backdrop-blur-xl">
              <div className="flex items-center gap-2.5">
                <span className="size-2 animate-ticker rounded-full bg-brand-500" />
                <p className="text-[13px] font-medium text-white">
                  Careful — you have unsaved changes!
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleReset}
                  className="h-9 rounded-xl border border-white/10 px-3.5 text-[12.5px] font-medium text-zinc-300 hover:border-white/25 hover:text-white disabled:opacity-50"
                >
                  Reset
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void handleSave()}
                  className="h-9 rounded-xl bg-emerald-600 px-4 text-[12.5px] font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-60"
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
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 ${
        accent
          ? "border-brand-500/30 bg-gradient-to-br from-brand-950/45 to-ink-900/80"
          : "border-white/[0.07] bg-white/[0.02]"
      }`}
    >
      <p className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 font-display text-[25px] font-bold tracking-tight text-white">
        {value}
      </p>
      <p className="mt-1 truncate font-mono text-[10px] text-zinc-500">{sub}</p>
    </div>
  );
}
