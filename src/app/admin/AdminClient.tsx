"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { site, type LogEntry } from "@/lib/site";
import type { PublicAuthorizedUser } from "@/lib/auth-store";
import type {
  PaymentSettings,
  PremiumOrder,
  PremiumSubscription,
} from "@/lib/premium-plans";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { CustomSelect } from "@/components/ui/CustomSelect";
import {
  ArrowRight,
  CheckIcon,
  CopyIcon,
  CrownIcon,
  DiscordIcon,
  LockIcon,
  RefreshIcon,
  SearchIcon,
  ShieldIcon,
  TrashIcon,
} from "@/components/ui/Icons";

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
    autoJoinGuildId: string | null;
    storageEngine: string;
    integrations: {
      oauthConfigured: boolean;
      botTokenConfigured: boolean;
      logSecretConfigured: boolean;
      webhookConfigured: boolean;
      autoJoinConfigured: boolean;
      botApiConfigured: boolean;
      fampayConfigured: boolean;
    };
  };
  stats: {
    authorizedUsers: number;
    joinCapableUsers: number;
    botGuilds: number | null;
    storedLogs: number;
    activePremium: number;
    pendingOrders: number;
  };
  premium: {
    settings: PaymentSettings & { webhookUrl: string };
    subscriptions: PremiumSubscription[];
    orders: PremiumOrder[];
  };
  botGuilds: { id: string; name: string; iconUrl: string | null }[];
  users: PublicAuthorizedUser[];
  logs: LogEntry[];
  liveLogs: boolean;
};

const LOG_TAGS = ["GUARD", "SCAN", "WARN", "DENY", "FIX", "AUDIT", "PREMIUM"];

export function AdminClient() {
  const [status, setStatus] = useState<
    "loading" | "guest" | "forbidden" | "ready"
  >("loading");
  const [deniedUserId, setDeniedUserId] = useState<string | null>(null);
  const [data, setData] = useState<AdminOverview | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<
    "users" | "premium" | "logs" | "servers" | "config"
  >("users");

  // Authorized users search + join state
  const [userSearch, setUserSearch] = useState("");
  const [targetGuildId, setTargetGuildId] = useState("");
  const [joinBusy, setJoinBusy] = useState<string | null>(null);
  const [joinFeedback, setJoinFeedback] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  // FamPay & Premium admin state
  const [upiIdInput, setUpiIdInput] = useState("");
  const [payeeNameInput, setPayeeNameInput] = useState("");
  const [premRoleInput, setPremRoleInput] = useState("");
  const [premBusy, setPremBusy] = useState<string | null>(null);
  const [premFeedback, setPremFeedback] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);
  const [grantUserId, setGrantUserId] = useState("");
  const [grantUsername, setGrantUsername] = useState("");
  const [grantTier, setGrantTier] = useState("pro");
  const [grantCycle, setGrantCycle] = useState("1m");
  const [copiedField, setCopiedField] = useState<string | null>(null);

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
      setUpiIdInput((prev) => prev || payload.premium.settings.fampayUpiId || "");
      setPayeeNameInput(
        (prev) => prev || payload.premium.settings.payeeName || site.name,
      );
      setPremRoleInput(
        (prev) => prev || payload.premium.settings.premiumRoleId || "",
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

  const copyVal = async (key: string, val: string) => {
    try {
      await navigator.clipboard.writeText(val);
      setCopiedField(key);
      window.setTimeout(
        () => setCopiedField((c) => (c === key ? null : c)),
        2000,
      );
    } catch {
      // Ignore clipboard failure.
    }
  };

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

  const callPremiumAdmin = async (
    busyKey: string,
    payload: Record<string, unknown>,
    successMsg: string,
  ) => {
    setPremBusy(busyKey);
    setPremFeedback(null);
    try {
      const res = await fetch("/api/admin/premium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setPremFeedback({
          ok: false,
          text: json.error || "Action failed.",
        });
        return false;
      }
      setPremFeedback({ ok: true, text: successMsg });
      await loadOverview(true);
      return true;
    } catch {
      setPremFeedback({ ok: false, text: "Network error." });
      return false;
    } finally {
      setPremBusy(null);
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
        label="Connection Establishing..."
        sublabel="Verifying owner clearance & loading telemetry"
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
          Owner Admin Panel
        </h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-zinc-400">
          Restricted to {site.name} owner ID{" "}
          <code className="rounded bg-brand-950/70 px-1.5 py-0.5 font-mono text-[12px] text-brand-300">
            {site.ownerId}
          </code>
          . Authenticate with Discord to manage logged-in users, FamPay Premium
          payments, server joins, and live logs.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="/api/auth/discord?next=/admin"
            className="inline-flex h-11 items-center gap-2.5 rounded-full bg-[#5865F2] px-5 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#4752C4]"
          >
            <DiscordIcon className="size-4" />
            Sign in as Owner
          </a>
          <Link
            href="/dashboard"
            className="group inline-flex h-11 items-center gap-2 rounded-full border border-cyan-200/15 bg-white/[0.03] px-5 text-[13.5px] font-medium text-zinc-200 transition-colors hover:border-brand-400/40 hover:text-white"
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
          is not registered as the {site.name} bot owner (
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
            className="inline-flex h-10 items-center rounded-full border border-cyan-200/15 px-4 text-[13px] text-zinc-400 hover:text-white"
          >
            Switch Account
          </button>
        </div>
      </div>
    );
  }

  const integrationItems = [
    {
      label: "Discord OAuth2 (DISCORD_CLIENT_SECRET + SESSION_SECRET)",
      ok: data.config.integrations.oauthConfigured,
    },
    {
      label: "FamPay Direct UPI Checkout (@fam QR + Auto-Webhook)",
      ok: data.config.integrations.fampayConfigured,
    },
    {
      label: "Bot Token (DISCORD_BOT_TOKEN — server list, roles & guild join)",
      ok: data.config.integrations.botTokenConfigured,
    },
    {
      label: "Bot Log Ingest (LOG_INGEST_SECRET — POST /api/logs)",
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

  const macroDroidJson = JSON.stringify(
    {
      secret: data.premium.settings.webhookSecret,
      title: "{not_title}",
      text: "{notification}",
    },
    null,
    2,
  );

  return (
    <div className="space-y-6">
      {/* Owner header */}
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
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-cyan-200/15 bg-white/[0.03] px-3.5 font-mono text-[10.5px] uppercase tracking-wider text-zinc-200 hover:border-brand-400/40 hover:text-white disabled:opacity-50"
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
            className="inline-flex h-9 items-center rounded-full border border-cyan-200/15 bg-white/[0.03] px-3.5 text-[12px] font-medium text-zinc-200 hover:border-brand-400/40 hover:text-white"
          >
            Dashboard
          </Link>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="inline-flex h-9 items-center rounded-full border border-cyan-200/12 bg-white/[0.03] px-3.5 text-[12px] font-medium text-zinc-400 hover:border-brand-400/40 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          label="Logged-In Users"
          value={String(data.stats.authorizedUsers)}
          sub={`${data.stats.joinCapableUsers} with guilds.join · persistent`}
          accent
        />
        <KpiCard
          label="Premium Members"
          value={String(data.stats.activePremium)}
          sub={
            data.stats.pendingOrders > 0
              ? `${data.stats.pendingOrders} order(s) awaiting check`
              : data.config.integrations.fampayConfigured
                ? "FamPay UPI live"
                : "Set FamPay ID in Premium tab"
          }
        />
        <KpiCard
          label="Bot Servers"
          value={
            data.stats.botGuilds !== null ? String(data.stats.botGuilds) : "—"
          }
          sub={
            data.stats.botGuilds !== null
              ? "live via bot token"
              : "set DISCORD_BOT_TOKEN"
          }
        />
        <KpiCard
          label="Stored Logs"
          value={String(data.stats.storedLogs)}
          sub={`storage: ${data.config.storageEngine}`}
        />
      </div>

      {/* Tabs (smooth scrollable strip on mobile) */}
      <div className="flex gap-2 overflow-x-auto border-b border-cyan-200/[0.08] pb-3">
        {(
          [
            ["users", `Logged-In Users (${data.users.length})`],
            [
              "premium",
              `FamPay & Premium (${data.stats.activePremium}${
                data.stats.pendingOrders ? ` · ${data.stats.pendingOrders} new` : ""
              })`,
            ],
            ["logs", `Logs & Webhook (${data.logs.length})`],
            ["servers", `Bot Servers (${data.botGuilds.length})`],
            ["config", "Config & Health"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`shrink-0 rounded-full border px-4 py-2 text-[12.5px] font-medium transition-all ${
              tab === key
                ? "border-brand-400/60 bg-brand-500/20 text-white shadow-[0_0_20px_-8px_#22d3ee]"
                : "border-cyan-200/10 bg-ink-900/50 text-zinc-400 hover:border-brand-400/30 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* TAB 1: Logged-In Authorized Users + Pull to Server */}
      {tab === "users" && (
        <div className="space-y-4">
          <div className="panel panel-inner rounded-2xl p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-brand-400">
              guilds.join · add authorized users to server
            </p>
            <p className="mt-1.5 text-[12.5px] text-zinc-400">
              Choose a server where {site.name} is installed (or paste its
              Server ID) to add consenting OAuth2 users.
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

          {/* User search */}
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
                permanently stored and shown here.
              </div>
            ) : (
              filteredUsers.map((u) => {
                const expanded = expandedUserId === u.id;
                const hasSub = data.premium.subscriptions.find(
                  (s) => s.userId === u.id,
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
                            {hasSub && (
                              <span className="rounded border border-brand-400/40 bg-brand-500/20 px-1.5 py-0.5 font-mono text-[8.5px] uppercase text-brand-200">
                                {hasSub.tierName}
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
                          className="rounded-xl border border-cyan-200/15 bg-ink-950/70 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-200 hover:border-brand-400/40 hover:text-white"
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
                          className="rounded border border-cyan-200/10 bg-ink-950/80 px-2 py-0.5 font-mono text-[9.5px] text-brand-300/90"
                        >
                          {s}
                        </span>
                      ))}
                    </div>

                    {expanded && (
                      <div className="mt-3 grid max-h-60 gap-1.5 overflow-y-auto border-t border-cyan-200/[0.08] pt-3 sm:grid-cols-2">
                        {u.guilds.length === 0 ? (
                          <p className="font-mono text-[11px] text-zinc-500">
                            No servers returned for this grant.
                          </p>
                        ) : (
                          u.guilds.map((g) => (
                            <div
                              key={g.id}
                              className="flex items-center justify-between gap-2 rounded-lg border border-cyan-200/[0.07] bg-ink-950/70 px-3 py-1.5"
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

      {/* TAB 2: FamPay Direct UPI & Account-Locked Premium Management */}
      {tab === "premium" && (
        <div className="space-y-5">
          {premFeedback && (
            <div
              className={`rounded-xl border px-4 py-3 font-mono text-[11.5px] ${
                premFeedback.ok
                  ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-300"
                  : "border-amber-400/35 bg-amber-500/10 text-amber-200"
              }`}
            >
              {premFeedback.text}
            </div>
          )}

          <div className="grid gap-5 lg:grid-cols-2">
            {/* FamPay UPI Settings */}
            <div className="panel panel-inner space-y-4 rounded-2xl p-5 sm:p-6">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-brand-400">
                  Direct FamPay UPI Receiver
                </p>
                <p className="mt-1 text-[12.5px] text-zinc-400">
                  Payments on <code className="text-brand-300">/premium</code> go
                  100% directly into this FamPay UPI ID with 0% fee.
                </p>
              </div>

              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                  Your FamPay UPI ID
                </span>
                <input
                  type="text"
                  value={upiIdInput}
                  onChange={(e) => setUpiIdInput(e.target.value)}
                  placeholder="yourname@fam"
                  className="input-aqua mt-1.5 font-mono"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                    QR Payee Name
                  </span>
                  <input
                    type="text"
                    value={payeeNameInput}
                    onChange={(e) => setPayeeNameInput(e.target.value)}
                    placeholder={site.name}
                    className="input-aqua mt-1.5"
                  />
                </label>
                <label className="block">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                    Premium Role ID (Optional)
                  </span>
                  <input
                    type="text"
                    value={premRoleInput}
                    onChange={(e) => setPremRoleInput(e.target.value)}
                    placeholder="Auto-assign role ID"
                    className="input-aqua mt-1.5 font-mono text-[12px]"
                  />
                </label>
              </div>

              <button
                type="button"
                disabled={premBusy !== null}
                onClick={() =>
                  void callPremiumAdmin(
                    "settings",
                    {
                      action: "settings",
                      fampayUpiId: upiIdInput,
                      payeeName: payeeNameInput,
                      premiumRoleId: premRoleInput,
                    },
                    "FamPay UPI settings saved! Live QR checkout is now active on /premium.",
                  )
                }
                className="h-10 w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-[13px] font-semibold text-white hover:brightness-110 disabled:opacity-50"
              >
                {premBusy === "settings" ? "Saving…" : "Save FamPay Settings"}
              </button>
            </div>

            {/* Automatic FamPay Notification Bridge Setup */}
            <div className="panel panel-inner space-y-3.5 rounded-2xl p-5 sm:p-6">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-brand-400">
                  100% Auto-Activation Bridge (FamApp → Website)
                </p>
                <p className="mt-1 text-[12px] leading-relaxed text-zinc-400">
                  In <strong>MacroDroid</strong> (Android): Trigger{" "}
                  <code className="text-brand-200">Notification Received → FamApp</code>{" "}
                  (contains <code className="text-brand-200">Received</code>) →
                  Action <code className="text-brand-200">HTTP Request (POST, application/json)</code>{" "}
                  to the URL below. Instant account-locked unlock in ~2s!
                </p>
              </div>

              <div className="flex items-center justify-between gap-2 rounded-xl border border-cyan-200/10 bg-ink-950/80 px-3 py-2 font-mono text-[11px]">
                <span className="truncate text-brand-300">
                  {data.premium.settings.webhookUrl}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    void copyVal("whurl", data.premium.settings.webhookUrl)
                  }
                  className="shrink-0 rounded-md border border-cyan-200/15 px-2 py-1 text-[10px] text-zinc-200 hover:text-white"
                >
                  {copiedField === "whurl" ? "✓" : <CopyIcon className="size-3.5" />}
                </button>
              </div>

              <div className="rounded-xl border border-cyan-200/10 bg-ink-950/80 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9.5px] uppercase text-zinc-500">
                    JSON Body Template
                  </span>
                  <button
                    type="button"
                    onClick={() => void copyVal("whjson", macroDroidJson)}
                    className="font-mono text-[10px] text-brand-300 hover:text-white"
                  >
                    {copiedField === "whjson" ? "✓ Copied" : "Copy JSON"}
                  </button>
                </div>
                <pre className="mt-1.5 overflow-x-auto font-mono text-[10.5px] text-zinc-300">
                  {macroDroidJson}
                </pre>
              </div>
            </div>
          </div>

          {/* Pending / Recent FamPay Orders */}
          <div className="panel panel-inner rounded-2xl p-5 sm:p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-brand-400">
              FamPay Orders ({data.premium.orders.length})
            </p>
            <div className="mt-4 space-y-2.5">
              {data.premium.orders.length === 0 ? (
                <p className="rounded-xl border border-cyan-200/[0.06] bg-ink-950/50 py-6 text-center text-[12.5px] text-zinc-500">
                  No orders yet. Buyer orders and UTR submissions appear here in
                  real time.
                </p>
              ) : (
                data.premium.orders.slice(0, 25).map((o) => (
                  <div
                    key={o.orderId}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-cyan-200/10 bg-ink-950/75 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11.5px] font-semibold text-white">
                          {o.orderId}
                        </span>
                        <span className="text-[12.5px] text-brand-200">
                          {o.tierName} ({o.periodLabel}) · ₹{o.exactAmount}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.5 font-mono text-[9px] uppercase ${
                            o.status === "paid"
                              ? "bg-emerald-500/15 text-emerald-300"
                              : o.status === "verifying"
                                ? "bg-amber-500/20 text-amber-200"
                                : "bg-cyan-200/10 text-zinc-400"
                          }`}
                        >
                          {o.status}
                        </span>
                      </div>
                      <p className="mt-0.5 font-mono text-[10.5px] text-zinc-400">
                        Buyer: @{o.username} ({o.userId})
                        {o.utr ? ` · UTR: ${o.utr}` : ""}
                        {o.guildName ? ` · Server: ${o.guildName}` : ""}
                      </p>
                    </div>

                    {(o.status === "verifying" || o.status === "pending") && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={premBusy !== null}
                          onClick={() =>
                            void callPremiumAdmin(
                              o.orderId,
                              { action: "approve", orderId: o.orderId },
                              `Activated ${o.tierName} on @${o.username} only!`,
                            )
                          }
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[11.5px] font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={premBusy !== null}
                          onClick={() =>
                            void callPremiumAdmin(
                              `rej-${o.orderId}`,
                              { action: "reject", orderId: o.orderId },
                              `Rejected order ${o.orderId}.`,
                            )
                          }
                          className="rounded-lg border border-cyan-200/15 px-3 py-1.5 text-[11.5px] text-zinc-400 hover:text-white disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Manual Grant + Active Subscribers */}
          <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
            <div className="panel panel-inner space-y-3.5 rounded-2xl p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-brand-400">
                Grant Account-Locked Premium
              </p>
              <input
                type="text"
                value={grantUserId}
                onChange={(e) => setGrantUserId(e.target.value)}
                placeholder="Discord User ID"
                className="input-aqua font-mono text-[12px]"
              />
              <input
                type="text"
                value={grantUsername}
                onChange={(e) => setGrantUsername(e.target.value)}
                placeholder="Username label (optional)"
                className="input-aqua"
              />
              <div className="grid grid-cols-2 gap-2.5">
                <CustomSelect
                  title="Select Premium Tier"
                  value={grantTier}
                  onChange={setGrantTier}
                  options={[
                    { value: "plus", label: "Plus Plan" },
                    { value: "pro", label: "Pro Plan" },
                    { value: "ultra", label: "Ultra Pro" },
                  ]}
                />
                <CustomSelect
                  title="Select Duration"
                  value={grantCycle}
                  onChange={setGrantCycle}
                  options={[
                    { value: "1m", label: "1 Month" },
                    { value: "3m", label: "3 Months" },
                    { value: "1y", label: "1 Year" },
                  ]}
                />
              </div>
              <button
                type="button"
                disabled={premBusy !== null || !grantUserId.trim()}
                onClick={async () => {
                  const ok = await callPremiumAdmin(
                    "grant",
                    {
                      action: "grant",
                      userId: grantUserId,
                      username: grantUsername,
                      tier: grantTier,
                      cycle: grantCycle,
                    },
                    `Granted Premium exclusively to user ${grantUserId.trim()}!`,
                  );
                  if (ok) {
                    setGrantUserId("");
                    setGrantUsername("");
                  }
                }}
                className="h-10 w-full rounded-xl bg-brand-600 text-[12.5px] font-semibold text-white hover:bg-brand-500 disabled:opacity-40"
              >
                Grant Premium
              </button>
            </div>

            <div className="panel panel-inner rounded-2xl p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-brand-400">
                Active Premium Accounts ({data.premium.subscriptions.length})
              </p>
              <div className="mt-3.5 space-y-2">
                {data.premium.subscriptions.length === 0 ? (
                  <p className="py-6 text-center text-[12.5px] text-zinc-500">
                    No active Premium accounts yet.
                  </p>
                ) : (
                  data.premium.subscriptions.map((sub) => (
                    <div
                      key={sub.userId}
                      className="flex items-center justify-between gap-3 rounded-xl border border-cyan-200/10 bg-ink-950/70 px-3.5 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold text-white">
                          @{sub.username}{" "}
                          <span className="font-mono text-[11px] text-brand-300">
                            · {sub.tierName}
                          </span>
                        </p>
                        <p className="truncate font-mono text-[10px] text-zinc-400">
                          ID {sub.userId} · expires{" "}
                          {new Date(sub.expiresAt).toLocaleDateString()} ·{" "}
                          {sub.source}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label={`Revoke ${sub.username}`}
                        disabled={premBusy !== null}
                        onClick={() =>
                          void callPremiumAdmin(
                            `rev-${sub.userId}`,
                            { action: "revoke", userId: sub.userId },
                            `Revoked Premium from @${sub.username}.`,
                          )
                        }
                        className="rounded-lg border border-cyan-200/15 p-2 text-zinc-400 hover:border-brand-400/50 hover:text-white"
                      >
                        <TrashIcon className="size-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Logs & Webhook */}
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
                className="h-10 rounded-xl border border-cyan-200/15 bg-white/[0.03] px-3.5 text-[12px] text-zinc-300 hover:border-brand-400/40 hover:text-white"
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
            <div className="flex items-center justify-between border-b border-cyan-200/[0.08] px-4 py-3">
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
                  className="flex flex-wrap items-start gap-2.5 rounded-lg border border-cyan-200/[0.06] bg-ink-950/60 px-3 py-2"
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

      {/* TAB 4: Bot Servers */}
      {tab === "servers" && (
        <div>
          {data.botGuilds.length === 0 ? (
            <div className="panel panel-inner rounded-2xl p-8 text-center text-[13px] text-zinc-400">
              Set <code className="text-brand-300">DISCORD_BOT_TOKEN</code> in
              your environment variables to list every server {site.name} is
              installed in.
            </div>
          ) : (
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {data.botGuilds.map((g) => (
                <div
                  key={g.id}
                  className="panel panel-inner flex items-center gap-3 rounded-xl p-3.5"
                >
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
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-zinc-100">
                      {g.name}
                    </p>
                    <p className="truncate font-mono text-[10px] text-zinc-500">
                      {g.id}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: Config & Health */}
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
                  className="flex items-center justify-between gap-3 rounded-lg border border-cyan-200/[0.07] bg-ink-950/65 px-3 py-2.5"
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
              active identifiers
            </p>
            <ConfigRow
              label="Owner ID(s)"
              value={data.config.ownerIds.join(", ")}
            />
            <ConfigRow label="Client ID" value={data.config.clientId} />
            <ConfigRow label="Command Prefix" value={data.config.prefix} />
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
}: {
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        accent
          ? "border-brand-400/35 bg-gradient-to-br from-brand-950/65 to-ink-900/90 shadow-glow"
          : "border-cyan-200/10 bg-ink-900/70"
      }`}
    >
      <p className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-zinc-400">
        {label}
      </p>
      <p className="mt-2 font-display text-[26px] font-bold tracking-tight text-white">
        {value}
      </p>
      <p className="mt-1 truncate font-mono text-[10px] text-zinc-400">{sub}</p>
    </div>
  );
}

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-cyan-200/[0.07] bg-ink-950/65 px-3 py-2">
      <span className="text-zinc-400">{label}</span>
      <span className="break-all text-brand-300">{value}</span>
    </div>
  );
}
