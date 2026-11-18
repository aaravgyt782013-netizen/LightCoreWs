"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { site, type LogEntry } from "@/lib/site";
import type { PublicAuthorizedUser } from "@/lib/auth-store";
import type { PremiumInvoice, PremiumRecord } from "@/lib/premium-plans";
import type { SiteConfig } from "@/lib/site-config";
import { useSiteConfig } from "@/components/site/SiteConfigProvider";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { CustomSelect } from "@/components/ui/CustomSelect";
import {
  ArrowRight,
  CheckIcon,
  CopyIcon,
  CrownIcon,
  DiscordIcon,
  InvoiceIcon,
  LockIcon,
  LogListIcon,
  PaletteIcon,
  RefreshIcon,
  SearchIcon,
  ServerIcon,
  ShieldIcon,
  UsersIcon,
} from "@/components/ui/Icons";
import { InvoicesAdminTab, PremiumManagerTab } from "./PremiumManagerTab";
import { SiteCustomizerTab } from "./SiteCustomizerTab";

type AdminOverview = {
  owner: {
    id: string;
    username: string;
    globalName: string | null;
    avatarUrl: string | null;
  };
  config: {
    ownerIds: string[];
    clientId: string;
    prefix: string;
    oauthScopes: string;
    redirectUri?: string;
    inviteUrl?: string;
    autoJoinGuildId: string | null;
    storageEngine: string;
    integrations: {
      oauthConfigured: boolean;
      botTokenConfigured: boolean;
      logSecretConfigured: boolean;
      webhookConfigured: boolean;
      autoJoinConfigured: boolean;
      botApiConfigured: boolean;
    };
  };
  stats: {
    authorizedUsers: number;
    joinCapableUsers: number;
    botGuilds: number | null;
    storedLogs: number;
    activePremium: number;
    activePremiumUsers: number;
    activePremiumGuilds: number;
    totalPremiumRecords: number;
    pendingInvoices: number;
  };
  siteConfig: SiteConfig;
  premium: {
    records: PremiumRecord[];
    invoices: PremiumInvoice[];
  };
  botGuilds: { id: string; name: string; iconUrl: string | null }[];
  users: PublicAuthorizedUser[];
  logs: LogEntry[];
  liveLogs: boolean;
};

type AdminTabId =
  | "premium"
  | "invoices"
  | "customize"
  | "users"
  | "servers"
  | "logs"
  | "config";

const LOG_TAGS = ["GUARD", "SCAN", "WARN", "DENY", "FIX", "AUDIT", "PREMIUM"];

export function AdminClient() {
  const { config: siteCfg } = useSiteConfig();
  const [status, setStatus] = useState<
    "loading" | "guest" | "forbidden" | "ready"
  >("loading");
  const [deniedUserId, setDeniedUserId] = useState<string | null>(null);
  const [data, setData] = useState<AdminOverview | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<AdminTabId>("premium");
  const [prefillInvoice, setPrefillInvoice] = useState<PremiumInvoice | null>(
    null,
  );

  // Logged-In Users tab state
  const [userSearch, setUserSearch] = useState("");
  const [targetGuildId, setTargetGuildId] = useState("");
  const [joinBusy, setJoinBusy] = useState<string | null>(null);
  const [joinFeedback, setJoinFeedback] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  // Servers tab search & copy
  const [serverSearch, setServerSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Admin log composer state
  const [logTag, setLogTag] = useState("GUARD");
  const [logMsg, setLogMsg] = useState("");
  const [logAlert, setLogAlert] = useState(false);
  const [logBusy, setLogBusy] = useState(false);
  const [logFeedback, setLogFeedback] = useState<string | null>(null);

  const loadOverview = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await fetch("/api/admin/overview", { cache: "no-store" });
      if (res.status === 401) {
        setStatus("guest");
        return;
      }
      if (res.status === 403) {
        const err = (await res.json().catch(() => ({}))) as {
          userId?: string;
        };
        setDeniedUserId(err.userId ?? null);
        setStatus("forbidden");
        return;
      }
      if (!res.ok) {
        setStatus("guest");
        return;
      }
      const payload = (await res.json()) as AdminOverview;
      setData(payload);
      setStatus("ready");
      setTargetGuildId(
        (prev) =>
          prev ||
          payload.config.autoJoinGuildId ||
          payload.botGuilds[0]?.id ||
          "",
      );
    } catch {
      setStatus("guest");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadOverview(false);
  }, [loadOverview]);

  const filteredUsers = useMemo(() => {
    if (!data) return [];
    const q = userSearch.trim().toLowerCase();
    if (!q) return data.users;
    return data.users.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        (u.globalName && u.globalName.toLowerCase().includes(q)) ||
        u.id.includes(q) ||
        (u.email && u.email.toLowerCase().includes(q)),
    );
  }, [data, userSearch]);

  const filteredServers = useMemo(() => {
    if (!data) return [];
    const q = serverSearch.trim().toLowerCase();
    if (!q) return data.botGuilds;
    return data.botGuilds.filter(
      (g) => g.name.toLowerCase().includes(q) || g.id.includes(q),
    );
  }, [data, serverSearch]);

  const handleJoinGuild = async (userIds?: string[]) => {
    const guildId = targetGuildId.trim();
    if (!/^\d{15,22}$/.test(guildId)) {
      setJoinFeedback({
        ok: false,
        text: "Select or enter a valid Discord Server (Guild) ID first.",
      });
      return;
    }

    const key = userIds ? userIds[0] : "all";
    setJoinBusy(key);
    setJoinFeedback(null);
    try {
      const res = await fetch("/api/admin/join-guild", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guildId, userIds }),
      });
      const json = (await res.json()) as {
        error?: string;
        added?: number;
        alreadyMember?: number;
        failed?: number;
        total?: number;
      };
      if (!res.ok) {
        setJoinFeedback({
          ok: false,
          text: json.error || "Failed to add users to server.",
        });
      } else {
        setJoinFeedback({
          ok: true,
          text: `Processed ${json.total ?? 0}: ${json.added ?? 0} added, ${json.alreadyMember ?? 0} already in server, ${json.failed ?? 0} failed.`,
        });
      }
    } catch {
      setJoinFeedback({ ok: false, text: "Network error while calling API." });
    } finally {
      setJoinBusy(null);
    }
  };

  const handlePostLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logMsg.trim()) return;
    setLogBusy(true);
    setLogFeedback(null);
    try {
      const res = await fetch("/api/admin/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          t: logTag,
          ok: !logAlert,
          msg: logMsg.trim(),
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        webhookSent?: boolean;
        error?: string;
      };
      if (res.ok && json.ok) {
        setLogMsg("");
        setLogFeedback(
          json.webhookSent
            ? "Log stored & forwarded to Discord webhook."
            : "Log saved to live stream.",
        );
        await loadOverview(true);
      } else {
        setLogFeedback(json.error || "Could not create log.");
      }
    } finally {
      setLogBusy(false);
    }
  };

  const handleClearLogs = async () => {
    setLogBusy(true);
    setLogFeedback(null);
    try {
      const res = await fetch("/api/admin/logs", { method: "DELETE" });
      if (res.ok) {
        setLogFeedback("Cleared live log buffer.");
        await loadOverview(true);
      }
    } finally {
      setLogBusy(false);
    }
  };

  const handleLogout = async () => {
    setStatus("loading");
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  if (status === "loading") {
    return (
      <LoadingScreen
        label={siteCfg.loaderText || "Connection Establishing..."}
        sublabel="Verifying owner clearance & loading control center"
      />
    );
  }

  if (status === "guest") {
    return (
      <div className="panel panel-inner max-w-lg rounded-3xl p-7 shadow-panel">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-brand-400">
          <LockIcon className="size-3.5" />
          owner clearance required
        </div>
        <h2 className="mt-3 font-display text-[24px] font-semibold text-white">
          Owner Control Panel
        </h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-zinc-400">
          Restricted to {siteCfg.brandName} owner ID{" "}
          <code className="rounded bg-brand-950/70 px-1.5 py-0.5 font-mono text-[12px] text-brand-300">
            {site.ownerId}
          </code>
          . Sign in with Discord to manage Premium users &amp; guilds, review
          invoices, customize website theme &amp; logos, view logged-in users,
          and monitor logs.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="/api/auth/discord?next=/admin"
            className="btn-primary btn-glow relative inline-flex h-12 items-center gap-2.5 overflow-hidden rounded-full px-6 text-[14px] font-semibold text-white transition-all duration-300 ease-smooth hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <DiscordIcon className="size-4" />
            Sign in as Owner
          </a>
          <Link
            href="/dashboard"
            className="group inline-flex h-11 items-center gap-2 rounded-full border border-brand-200/15 bg-white/[0.03] px-5 text-[13.5px] font-medium text-zinc-200 transition-colors hover:border-brand-400/40 hover:text-white"
          >
            User Dashboard
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    );
  }

  if (status === "forbidden" || !data) {
    return (
      <div className="panel panel-inner max-w-lg rounded-3xl border-brand-400/35 p-7 shadow-panel">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-brand-400">
          <ShieldIcon className="size-3.5" />
          403 · access denied
        </div>
        <h2 className="mt-3 font-display text-[22px] font-semibold text-white">
          Owner Only
        </h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-zinc-400">
          Your Discord account
          {deniedUserId ? (
            <>
              {" "}
              (
              <code className="font-mono text-[12px] text-zinc-300">
                {deniedUserId}
              </code>
              )
            </>
          ) : null}{" "}
          is not registered as the {siteCfg.brandName} bot owner (
          <code className="font-mono text-[12px] text-brand-300">
            {site.ownerId}
          </code>
          ).
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-brand-600 px-5 text-[13px] font-semibold text-white hover:bg-brand-500"
          >
            Go to Dashboard
          </Link>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="inline-flex h-10 items-center rounded-full border border-brand-200/15 px-4 text-[13px] text-zinc-400 hover:text-white"
          >
            Switch Account
          </button>
        </div>
      </div>
    );
  }

  const tabs: {
    id: AdminTabId;
    label: string;
    badge?: string;
    desc: string;
    Icon: typeof CrownIcon;
  }[] = [
    {
      id: "premium",
      label: "Premium Users",
      badge: String(data.stats.activePremium),
      desc: "Add/remove users & guilds, live countdown table & full details",
      Icon: CrownIcon,
    },
    {
      id: "invoices",
      label: "Invoices",
      badge:
        data.stats.pendingInvoices > 0
          ? `${data.stats.pendingInvoices} new`
          : String(data.premium.invoices.length),
      desc: "Verify & fulfill customer ticket invoices",
      Icon: InvoiceIcon,
    },
    {
      id: "customize",
      label: "Website & Theme",
      desc: "Edit live website colors, logos, branding, banners & prices",
      Icon: PaletteIcon,
    },
    {
      id: "users",
      label: "Logged-In Users",
      badge: String(data.users.length),
      desc: "All authenticated Discord users & server pull",
      Icon: UsersIcon,
    },
    {
      id: "servers",
      label: "Bot Servers",
      badge: String(data.botGuilds.length),
      desc: "Every Discord server with bot installed",
      Icon: ServerIcon,
    },
    {
      id: "logs",
      label: "Audit Logs",
      badge: String(data.logs.length),
      desc: "Broadcast logs & Discord webhook stream",
      Icon: LogListIcon,
    },
    {
      id: "config",
      label: "System Health",
      desc: "Environment integrations & storage telemetry",
      Icon: ShieldIcon,
    },
  ];

  const integrationItems = [
    {
      label: "Discord OAuth2 (DISCORD_CLIENT_SECRET + SESSION_SECRET)",
      ok: data.config.integrations.oauthConfigured,
    },
    {
      label: "Bot Token (DISCORD_BOT_TOKEN — server list, roles & guild join)",
      ok: data.config.integrations.botTokenConfigured,
    },
    {
      label: "Bot Log & Premium API (LOG_INGEST_SECRET — /api/logs & /api/premium/check)",
      ok: data.config.integrations.logSecretConfigured,
    },
    {
      label: "Discord Log Webhook (DISCORD_LOG_WEBHOOK_URL)",
      ok: data.config.integrations.webhookConfigured,
    },
    {
      label: "Auto-Join Server on Login (DISCORD_AUTO_JOIN_GUILD_ID)",
      ok: data.config.integrations.autoJoinConfigured,
    },
    {
      label: "External Bot API Sync (BOT_API_URL)",
      ok: data.config.integrations.botApiConfigured,
    },
  ];

  const ownerDefaultGranter = data.owner.globalName
    ? `${data.owner.globalName} (@${data.owner.username})`
    : `@${data.owner.username}`;

  return (
    <div className="space-y-6">
      {/* Owner Header */}
      <div className="panel panel-inner flex flex-wrap items-center justify-between gap-4 rounded-2xl border-brand-400/30 px-4 py-4 shadow-panel sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          {data.owner.avatarUrl ? (
            <Image
              src={data.owner.avatarUrl}
              alt=""
              width={44}
              height={44}
              unoptimized
              className="size-[44px] shrink-0 rounded-full ring-2 ring-brand-400/50"
            />
          ) : (
            <span className="flex size-[44px] shrink-0 items-center justify-center rounded-full bg-brand-500/20 font-display text-sm font-semibold text-brand-200">
              {(data.owner.globalName || data.owner.username)
                .slice(0, 2)
                .toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-[14.5px] font-semibold text-white">
                {data.owner.globalName || data.owner.username}
              </p>
              <span className="rounded-md border border-brand-400/45 bg-brand-500/20 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-brand-200">
                owner
              </span>
            </div>
            <p className="truncate font-mono text-[10px] text-zinc-400">
              @{data.owner.username} · ID {data.owner.id} · prefix{" "}
              <span className="text-brand-300">{data.config.prefix}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={refreshing}
            onClick={() => void loadOverview(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-brand-200/15 bg-white/[0.03] px-3.5 font-mono text-[10.5px] uppercase tracking-wider text-zinc-200 hover:border-brand-400/40 hover:text-white disabled:opacity-50"
          >
            <RefreshIcon
              className={`size-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          <Link
            href="/premium"
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-brand-400/35 bg-brand-500/15 px-3.5 text-[12px] font-medium text-brand-100 hover:bg-brand-500/25 hover:text-white"
          >
            <CrownIcon className="size-3.5 text-brand-300" />
            Premium
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center rounded-full border border-brand-200/15 bg-white/[0.03] px-3.5 text-[12px] font-medium text-zinc-200 hover:border-brand-400/40 hover:text-white"
          >
            Dashboard
          </Link>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="inline-flex h-9 items-center rounded-full border border-brand-200/12 bg-white/[0.03] px-3.5 text-[12px] font-medium text-zinc-400 hover:border-brand-400/40 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          label="Active Premium"
          value={String(data.stats.activePremium)}
          sub={`${data.stats.activePremiumUsers} users · ${data.stats.activePremiumGuilds} guilds`}
          accent
          onClick={() => setTab("premium")}
        />
        <KpiCard
          label="Pending Invoices"
          value={String(data.stats.pendingInvoices)}
          sub={`${data.premium.invoices.length} total generated`}
          onClick={() => setTab("invoices")}
        />
        <KpiCard
          label="Logged-In Users"
          value={String(data.stats.authorizedUsers)}
          sub={`${data.stats.joinCapableUsers} with guilds.join`}
          onClick={() => setTab("users")}
        />
        <KpiCard
          label="Theme & Servers"
          value={
            data.stats.botGuilds !== null
              ? `${data.stats.botGuilds} servers`
              : data.siteConfig.themePreset.toUpperCase()
          }
          sub={`theme: ${data.siteConfig.themePreset} · ${data.config.storageEngine}`}
          onClick={() => setTab("customize")}
        />
      </div>

      {/* Section Switcher: Custom Bottom-Sheet Picker on Mobile + Segmented Tab Bar on Desktop */}
      <div className="space-y-3">
        <div className="md:hidden">
          <span className="mb-1.5 block font-mono text-[9.5px] uppercase tracking-[0.22em] text-zinc-400">
            Owner Panel Section
          </span>
          <CustomSelect
            title="Select Owner Panel Section"
            value={tab}
            onChange={(v) => setTab(v as AdminTabId)}
            options={tabs.map((t) => ({
              value: t.id,
              label: t.badge ? `${t.label} (${t.badge})` : t.label,
              description: t.desc,
            }))}
          />
        </div>

        <nav
          aria-label="Owner Panel Sections"
          className="hidden flex-wrap gap-2 rounded-2xl border border-brand-200/10 bg-ink-900/75 p-2 shadow-panel md:flex"
        >
          {tabs.map((t) => {
            const active = tab === t.id;
            const Icon = t.Icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-[12.5px] font-medium transition-all duration-200 ${
                  active
                    ? "border-brand-400/55 bg-gradient-to-r from-brand-600/30 to-brand-500/20 text-white shadow-[0_0_22px_-8px_rgb(var(--brand-400))]"
                    : "border-transparent text-zinc-400 hover:border-brand-200/10 hover:bg-white/[0.03] hover:text-white"
                }`}
              >
                <Icon
                  className={`size-4 ${
                    active ? "text-brand-300" : "text-zinc-500"
                  }`}
                />
                <span>{t.label}</span>
                {t.badge !== undefined && (
                  <span
                    className={`rounded-md px-1.5 py-0.5 font-mono text-[9.5px] ${
                      active
                        ? "bg-brand-400/25 text-brand-100"
                        : "bg-ink-950/90 text-zinc-400"
                    }`}
                  >
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* TAB 1: PREMIUM USERS & GUILDS (Add/Remove + Live Countdown Table + Click Inspector) */}
      {tab === "premium" && (
        <PremiumManagerTab
          records={data.premium.records}
          invoices={data.premium.invoices}
          users={data.users}
          botGuilds={data.botGuilds}
          ownerDefaultGranter={ownerDefaultGranter}
          siteConfig={data.siteConfig}
          prefillInvoice={prefillInvoice}
          onClearPrefill={() => setPrefillInvoice(null)}
          onReload={() => loadOverview(true)}
        />
      )}

      {/* TAB 2: CUSTOMER INVOICES */}
      {tab === "invoices" && (
        <InvoicesAdminTab
          invoices={data.premium.invoices}
          siteConfig={data.siteConfig}
          onCustomizeGrant={(inv) => {
            setPrefillInvoice(inv);
            setTab("premium");
          }}
          onReload={() => loadOverview(true)}
        />
      )}

      {/* TAB 3: LIVE WEBSITE, THEME & LOGO CUSTOMIZER */}
      {tab === "customize" && (
        <SiteCustomizerTab
          initialConfig={data.siteConfig}
          onSaved={(nextCfg) => {
            setData((prev) =>
              prev
                ? {
                    ...prev,
                    siteConfig: nextCfg,
                    config: { ...prev.config, prefix: nextCfg.prefix },
                  }
                : prev,
            );
          }}
        />
      )}

      {/* TAB 4: LOGGED-IN OAUTH2 USERS + PULL TO SERVER */}
      {tab === "users" && (
        <div className="space-y-4">
          <div className="panel panel-inner rounded-2xl p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-brand-400">
              guilds.join · add authorized users to server
            </p>
            <p className="mt-1.5 text-[12.5px] text-zinc-400">
              Choose a server where {data.siteConfig.brandName} is installed (or
              paste its Server ID) to add consenting OAuth2 users.
            </p>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-[260px_1fr_auto]">
              {data.botGuilds.length > 0 && (
                <CustomSelect
                  title="Choose Target Bot Server"
                  placeholder="Choose bot server…"
                  value={
                    data.botGuilds.some((g) => g.id === targetGuildId)
                      ? targetGuildId
                      : ""
                  }
                  onChange={(val) => {
                    if (val) setTargetGuildId(val);
                  }}
                  options={data.botGuilds.map((g) => ({
                    value: g.id,
                    label: g.name,
                    iconUrl: g.iconUrl,
                    description: `ID ${g.id}`,
                  }))}
                />
              )}

              <input
                type="text"
                value={targetGuildId}
                onChange={(e) => setTargetGuildId(e.target.value)}
                placeholder="Target Server ID (e.g. 123456789012345678)"
                className="input-aqua font-mono text-[12px]"
              />

              <button
                type="button"
                disabled={joinBusy !== null || data.stats.joinCapableUsers === 0}
                onClick={() => void handleJoinGuild()}
                className="h-10 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-5 text-[12.5px] font-semibold text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {joinBusy === "all"
                  ? "Adding…"
                  : `Add All (${data.stats.joinCapableUsers})`}
              </button>
            </div>

            {joinFeedback && (
              <p
                className={`mt-3 font-mono text-[11px] ${
                  joinFeedback.ok ? "text-emerald-400" : "text-amber-300"
                }`}
              >
                {joinFeedback.text}
              </p>
            )}
          </div>

          {data.users.length > 0 && (
            <div className="relative max-w-md">
              <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-brand-400/75" />
              <input
                type="search"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search logged-in users by name, ID, or email…"
                className="input-aqua pl-10"
              />
            </div>
          )}

          <div className="space-y-2.5">
            {filteredUsers.length === 0 ? (
              <div className="panel panel-inner rounded-2xl p-8 text-center text-[13px] text-zinc-400">
                No matching users found. Every Discord user who signs in is
                stored persistently and shown here.
              </div>
            ) : (
              filteredUsers.map((u) => {
                const expanded = expandedUserId === u.id;
                const activeRec = data.premium.records.find(
                  (r) =>
                    r.userId === u.id &&
                    r.status === "active" &&
                    (r.isLifetime ||
                      (r.expiresAt && Date.parse(r.expiresAt) > Date.now())),
                );
                return (
                  <div
                    key={u.id}
                    className="panel panel-inner rounded-2xl p-4 sm:p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        {u.avatarUrl ? (
                          <Image
                            src={u.avatarUrl}
                            alt=""
                            width={40}
                            height={40}
                            unoptimized
                            className="size-10 shrink-0 rounded-full ring-1 ring-brand-400/35"
                          />
                        ) : (
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-500/15 font-mono text-xs text-brand-200">
                            {u.username.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-[14px] font-semibold text-white">
                              {u.globalName || u.username}
                            </p>
                            <span className="font-mono text-[11px] text-zinc-400">
                              @{u.username}
                            </span>
                            {activeRec && (
                              <span className="rounded border border-brand-400/40 bg-brand-500/20 px-1.5 py-0.5 font-mono text-[8.5px] uppercase text-brand-200">
                                {activeRec.tierName}
                              </span>
                            )}
                          </div>
                          <p className="truncate font-mono text-[10px] text-zinc-500">
                            ID {u.id}
                            {u.email ? ` · ${u.email}` : ""} · {u.guildCount}{" "}
                            servers
                            {u.lastSeenAt
                              ? ` · active ${new Date(u.lastSeenAt).toLocaleDateString()}`
                              : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedUserId(expanded ? null : u.id)
                          }
                          className="rounded-xl border border-brand-200/15 bg-ink-950/70 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-200 hover:border-brand-400/40 hover:text-white"
                        >
                          {expanded
                            ? "Hide Servers"
                            : `Servers (${u.guildCount})`}
                        </button>
                        {u.hasJoinScope && (
                          <button
                            type="button"
                            disabled={joinBusy !== null}
                            onClick={() => void handleJoinGuild([u.id])}
                            className="rounded-xl bg-brand-600 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-white hover:bg-brand-500 disabled:opacity-40"
                          >
                            {joinBusy === u.id ? "Adding…" : "Add to Server"}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {u.scopes.map((s) => (
                        <span
                          key={s}
                          className="rounded border border-brand-200/10 bg-ink-950/80 px-2 py-0.5 font-mono text-[9.5px] text-brand-300/90"
                        >
                          {s}
                        </span>
                      ))}
                    </div>

                    {expanded && (
                      <div className="mt-3 grid max-h-60 gap-1.5 overflow-y-auto border-t border-brand-200/[0.08] pt-3 sm:grid-cols-2">
                        {u.guilds.length === 0 ? (
                          <p className="font-mono text-[11px] text-zinc-500">
                            No servers returned for this grant.
                          </p>
                        ) : (
                          u.guilds.map((g) => (
                            <div
                              key={g.id}
                              className="flex items-center justify-between gap-2 rounded-lg border border-brand-200/[0.07] bg-ink-950/70 px-3 py-1.5"
                            >
                              <span className="truncate text-[12px] text-zinc-200">
                                {g.name}
                              </span>
                              <span className="shrink-0 font-mono text-[9px] uppercase text-brand-400/80">
                                {g.owner
                                  ? "owner"
                                  : g.canManage
                                    ? "staff"
                                    : "member"}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 5: BOT SERVERS */}
      {tab === "servers" && (
        <div className="space-y-4">
          {data.botGuilds.length > 0 && (
            <div className="relative max-w-md">
              <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-brand-400/75" />
              <input
                type="search"
                value={serverSearch}
                onChange={(e) => setServerSearch(e.target.value)}
                placeholder="Search bot servers by name or ID…"
                className="input-aqua pl-10"
              />
            </div>
          )}

          {data.botGuilds.length === 0 ? (
            <div className="panel panel-inner rounded-2xl p-8 text-center text-[13px] text-zinc-400">
              Set <code className="text-brand-300">DISCORD_BOT_TOKEN</code> in
              your environment variables to list every server{" "}
              {data.siteConfig.brandName} is installed in.
            </div>
          ) : (
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredServers.map((g) => (
                <div
                  key={g.id}
                  className="panel panel-inner flex items-center justify-between gap-3 rounded-xl p-3.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {g.iconUrl ? (
                      <Image
                        src={g.iconUrl}
                        alt=""
                        width={38}
                        height={38}
                        unoptimized
                        className="size-[38px] shrink-0 rounded-full ring-1 ring-brand-400/25"
                      />
                    ) : (
                      <span className="flex size-[38px] shrink-0 items-center justify-center rounded-full bg-brand-500/15 font-mono text-[11px] text-brand-200">
                        {g.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-zinc-100">
                        {g.name}
                      </p>
                      <p className="truncate font-mono text-[10px] text-zinc-500">
                        {g.id}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    title="Copy Guild ID"
                    onClick={async () => {
                      await navigator.clipboard.writeText(g.id).catch(() => {});
                      setCopiedId(g.id);
                      window.setTimeout(() => setCopiedId(null), 1600);
                    }}
                    className="shrink-0 rounded-lg border border-brand-200/12 p-1.5 font-mono text-[10px] text-zinc-400 hover:border-brand-400/40 hover:text-white"
                  >
                    {copiedId === g.id ? (
                      "✓"
                    ) : (
                      <CopyIcon className="size-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: LOGS & DISCORD WEBHOOK */}
      {tab === "logs" && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
          <form
            onSubmit={(e) => void handlePostLog(e)}
            className="panel panel-inner space-y-3.5 rounded-2xl p-5"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-brand-400">
              broadcast log / test webhook
            </p>
            <div>
              <span className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-zinc-400">
                tag
              </span>
              <div className="mt-1.5">
                <CustomSelect
                  title="Select Log Tag"
                  value={logTag}
                  onChange={setLogTag}
                  options={LOG_TAGS.map((t) => ({
                    value: t,
                    label: t,
                    prefix: "●",
                  }))}
                />
              </div>
            </div>
            <div>
              <label className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-zinc-400">
                message
              </label>
              <input
                type="text"
                value={logMsg}
                onChange={(e) => setLogMsg(e.target.value)}
                placeholder="e.g. anti-nuke shield synced across shards"
                className="input-aqua mt-1.5 font-mono text-[12px]"
              />
            </div>
            <label className="flex items-center gap-2 text-[12px] text-zinc-300">
              <input
                type="checkbox"
                checked={logAlert}
                onChange={(e) => setLogAlert(e.target.checked)}
                className="accent-brand-500"
              />
              Mark as priority alert
            </label>
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={logBusy || !logMsg.trim()}
                className="h-10 flex-1 rounded-xl bg-brand-600 text-[12.5px] font-semibold text-white hover:bg-brand-500 disabled:opacity-40"
              >
                Send Log
              </button>
              <button
                type="button"
                disabled={logBusy}
                onClick={() => void handleClearLogs()}
                className="h-10 rounded-xl border border-brand-200/15 bg-white/[0.03] px-3.5 text-[12px] text-zinc-300 hover:border-brand-400/40 hover:text-white"
              >
                Clear
              </button>
            </div>
            {logFeedback && (
              <p className="font-mono text-[11px] text-brand-300">
                {logFeedback}
              </p>
            )}
          </form>

          <div className="panel panel-inner overflow-hidden rounded-2xl shadow-panel">
            <div className="flex items-center justify-between border-b border-brand-200/[0.08] px-4 py-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-400">
                full audit log feed
              </span>
              <span className="font-mono text-[10px] text-brand-300">
                ● {data.liveLogs ? "live" : "default"}
              </span>
            </div>
            <div className="max-h-[420px] space-y-2 overflow-y-auto p-4 font-mono text-[11.5px]">
              {data.logs.map((l, i) => (
                <div
                  key={l.id ?? `${l.t}-${i}`}
                  className="flex flex-wrap items-start gap-2.5 rounded-lg border border-brand-200/[0.06] bg-ink-950/60 px-3 py-2"
                >
                  <span
                    className={`mt-px shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium tracking-wider ${
                      l.ok
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-brand-500/20 text-brand-200"
                    }`}
                  >
                    {l.t}
                  </span>
                  <span className="min-w-0 flex-1 break-words text-zinc-200">
                    {l.msg}
                  </span>
                  {l.guild && (
                    <span className="text-[10px] text-zinc-500">
                      [{l.guild}]
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: SYSTEM HEALTH & CONFIG */}
      {tab === "config" && (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="panel panel-inner rounded-2xl p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-brand-400">
              environment integrations
            </p>
            <div className="mt-4 space-y-2">
              {integrationItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-3 rounded-lg border border-brand-200/[0.07] bg-ink-950/65 px-3 py-2.5"
                >
                  <span className="text-[12px] text-zinc-200">
                    {item.label}
                  </span>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded px-2 py-0.5 font-mono text-[9.5px] uppercase ${
                      item.ok
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-white/[0.05] text-zinc-500"
                    }`}
                  >
                    {item.ok && <CheckIcon className="size-3" />}
                    {item.ok ? "active" : "not set"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel panel-inner space-y-2.5 rounded-2xl p-5 font-mono text-[11.5px]">
            <p className="text-[10px] uppercase tracking-[0.24em] text-brand-400">
              active identifiers &amp; mode
            </p>
            <ConfigRow
              label="Owner ID(s)"
              value={data.config.ownerIds.join(", ")}
            />
            <ConfigRow label="Client ID" value={data.config.clientId} />
            {data.config.redirectUri && (
              <ConfigRow
                label="OAuth2 Redirect URI"
                value={data.config.redirectUri}
              />
            )}
            {data.config.inviteUrl && (
              <ConfigRow
                label="Bot Invite URL"
                value={data.config.inviteUrl}
              />
            )}
            <ConfigRow label="Command Prefix" value={data.config.prefix} />
            <ConfigRow
              label="Website Payment"
              value="Disabled (Invoice + Support Ticket QR)"
            />
            <ConfigRow
              label="Active Theme"
              value={`${data.siteConfig.themePreset} / ${data.siteConfig.surfacePreset}`}
            />
            <ConfigRow
              label="Storage Engine"
              value={data.config.storageEngine}
            />
            <ConfigRow label="OAuth2 Scopes" value={data.config.oauthScopes} />
            <ConfigRow
              label="Auto-Join Guild"
              value={data.config.autoJoinGuildId || "not configured"}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  accent,
  onClick,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 ${
        accent
          ? "border-brand-400/40 bg-gradient-to-br from-brand-950/65 to-ink-900/90 shadow-glow"
          : "border-brand-200/10 bg-ink-900/70 hover:border-brand-400/35"
      }`}
    >
      <p className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-zinc-400">
        {label}
      </p>
      <p className="mt-2 font-display text-[25px] font-bold tracking-tight text-white">
        {value}
      </p>
      <p className="mt-1 truncate font-mono text-[10px] text-zinc-400">{sub}</p>
    </button>
  );
}

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-brand-200/[0.07] bg-ink-950/65 px-3 py-2">
      <span className="text-zinc-400">{label}</span>
      <span className="break-all text-brand-300">{value}</span>
    </div>
  );
}
