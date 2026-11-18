"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { site, type LogEntry } from "@/lib/site";
import type { PublicAuthorizedUser } from "@/lib/auth-store";
import {
  ArrowRight,
  CheckIcon,
  DiscordIcon,
  LockIcon,
  ShieldIcon,
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
  };
  botGuilds: { id: string; name: string; iconUrl: string | null }[];
  users: PublicAuthorizedUser[];
  logs: LogEntry[];
  liveLogs: boolean;
};

export function AdminClient() {
  const [status, setStatus] = useState<
    "loading" | "guest" | "forbidden" | "ready"
  >("loading");
  const [deniedUserId, setDeniedUserId] = useState<string | null>(null);
  const [data, setData] = useState<AdminOverview | null>(null);
  const [tab, setTab] = useState<"users" | "logs" | "servers" | "config">(
    "users",
  );

  // Add-to-server state
  const [targetGuildId, setTargetGuildId] = useState("");
  const [joinBusy, setJoinBusy] = useState<string | null>(null);
  const [joinFeedback, setJoinFeedback] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  // Admin log composer state
  const [logTag, setLogTag] = useState("GUARD");
  const [logMsg, setLogMsg] = useState("");
  const [logAlert, setLogAlert] = useState(false);
  const [logBusy, setLogBusy] = useState(false);
  const [logFeedback, setLogFeedback] = useState<string | null>(null);

  const loadOverview = useCallback(async () => {
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
      setTargetGuildId((prev) =>
        prev ||
        payload.config.autoJoinGuildId ||
        payload.botGuilds[0]?.id ||
        "",
      );
    } catch {
      setStatus("guest");
    }
  }, []);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const handleJoinGuild = async (userIds?: string[]) => {
    const guildId = targetGuildId.trim();
    if (!/^\d{15,22}$/.test(guildId)) {
      setJoinFeedback({
        ok: false,
        text: "Enter or select a valid Discord Server (Guild) ID first.",
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
            ? "Log added & forwarded to Discord webhook."
            : "Log added to live stream.",
        );
        await loadOverview();
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
        await loadOverview();
      }
    } finally {
      setLogBusy(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  if (status === "loading") {
    return (
      <div className="max-w-xl rounded-2xl border border-white/[0.07] bg-white/[0.02] p-8 font-mono text-[12px] text-zinc-400">
        Verifying owner clearance…
      </div>
    );
  }

  if (status === "guest") {
    return (
      <div className="max-w-lg rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7 shadow-panel">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-brand-400">
          <LockIcon className="size-3.5" />
          owner clearance required
        </div>
        <h2 className="mt-3 font-display text-[24px] font-semibold text-white">
          Owner Admin Panel
        </h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-zinc-400">
          Restricted to {site.name} owner ID{" "}
          <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[12px] text-brand-300">
            {site.ownerId}
          </code>
          . Authenticate with Discord to manage authorized users, server joins,
          bot servers, and live logs.
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
            className="group inline-flex h-11 items-center gap-2 rounded-full border border-white/12 bg-white/[0.03] px-5 text-[13.5px] font-medium text-zinc-200 transition-colors hover:border-white/25 hover:text-white"
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
      <div className="max-w-lg rounded-2xl border border-brand-500/30 bg-brand-950/25 p-7 shadow-panel">
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
            className="inline-flex h-10 items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 text-[13px] font-medium text-white hover:bg-white/[0.08]"
          >
            Go to Dashboard
          </Link>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="inline-flex h-10 items-center rounded-full border border-white/10 px-4 text-[13px] text-zinc-400 hover:text-white"
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
      label: "Bot Token (DISCORD_BOT_TOKEN — server list & guild join)",
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
      label: "External Bot API (BOT_API_URL)",
      ok: data.config.integrations.botApiConfigured,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Owner header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-500/25 bg-brand-950/20 px-5 py-4">
        <div className="flex items-center gap-3">
          {data.owner.avatarUrl ? (
            <Image
              src={data.owner.avatarUrl}
              alt=""
              width={42}
              height={42}
              unoptimized
              className="size-[42px] rounded-full ring-2 ring-brand-500/50"
            />
          ) : (
            <span className="flex size-[42px] items-center justify-center rounded-full bg-brand-600/25 font-display text-sm font-semibold text-brand-300">
              {(data.owner.globalName || data.owner.username)
                .slice(0, 2)
                .toUpperCase()}
            </span>
          )}
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[14.5px] font-semibold text-white">
                {data.owner.globalName || data.owner.username}
              </p>
              <span className="rounded border border-brand-500/40 bg-brand-600/20 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-brand-300">
                owner
              </span>
            </div>
            <p className="font-mono text-[10px] text-zinc-400">
              @{data.owner.username} · ID {data.owner.id} · prefix{" "}
              <span className="text-brand-300">{data.config.prefix}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void loadOverview()}
            className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 font-mono text-[10.5px] uppercase tracking-wider text-zinc-300 hover:border-white/25 hover:text-white"
          >
            Refresh
          </button>
          <Link
            href="/dashboard"
            className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-[12px] font-medium text-zinc-300 hover:border-white/25 hover:text-white"
          >
            Dashboard
          </Link>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-[12px] font-medium text-zinc-400 hover:border-brand-500/40 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard
          label="Authorized Users"
          value={String(data.stats.authorizedUsers)}
          sub={`${data.stats.joinCapableUsers} with guilds.join`}
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
          label="Live Logs"
          value={String(data.stats.storedLogs)}
          sub={data.liveLogs ? "stream active" : "awaiting bot events"}
        />
        <KpiCard
          label="Bot Prefix"
          value={data.config.prefix}
          sub={`client ${data.config.clientId.slice(0, 8)}…`}
        />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/[0.07] pb-3">
        {(
          [
            ["users", `Authorized Users (${data.users.length})`],
            ["logs", `Logs & Webhook (${data.logs.length})`],
            ["servers", `Bot Servers (${data.botGuilds.length})`],
            ["config", "Config & Health"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-full border px-4 py-1.5 text-[12.5px] font-medium transition-colors ${
              tab === key
                ? "border-brand-500/50 bg-brand-950/50 text-white"
                : "border-white/[0.07] bg-white/[0.02] text-zinc-400 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab: Authorized Users + Pull to Server */}
      {tab === "users" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-brand-400">
              guilds.join · add authorized users to server
            </p>
            <p className="mt-1.5 text-[12.5px] text-zinc-400">
              Select a server where {site.name} is installed (with Create
              Instant Invite permission) or paste its Guild ID to add consenting
              OAuth2 users.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              {data.botGuilds.length > 0 && (
                <select
                  value={
                    data.botGuilds.some((g) => g.id === targetGuildId)
                      ? targetGuildId
                      : ""
                  }
                  onChange={(e) => {
                    if (e.target.value) setTargetGuildId(e.target.value);
                  }}
                  className="h-10 rounded-xl border border-white/10 bg-ink-950 px-3 text-[12.5px] text-zinc-200 focus:border-brand-500/50 focus:outline-none"
                >
                  <option value="">Choose bot server…</option>
                  {data.botGuilds.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.id})
                    </option>
                  ))}
                </select>
              )}

              <input
                type="text"
                value={targetGuildId}
                onChange={(e) => setTargetGuildId(e.target.value)}
                placeholder="Target Server ID (e.g. 123456789012345678)"
                className="h-10 min-w-[240px] flex-1 rounded-xl border border-white/10 bg-ink-950/80 px-3.5 font-mono text-[12px] text-zinc-100 placeholder:text-zinc-600 focus:border-brand-500/50 focus:outline-none"
              />

              <button
                type="button"
                disabled={joinBusy !== null || data.stats.joinCapableUsers === 0}
                onClick={() => void handleJoinGuild()}
                className="h-10 rounded-xl bg-brand-600 px-4 text-[12.5px] font-semibold text-white transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {joinBusy === "all"
                  ? "Adding…"
                  : `Add All (${data.stats.joinCapableUsers})`}
              </button>
            </div>

            {joinFeedback && (
              <p
                className={`mt-3 font-mono text-[11px] ${
                  joinFeedback.ok ? "text-emerald-400" : "text-brand-300"
                }`}
              >
                {joinFeedback.text}
              </p>
            )}
          </div>

          <div className="space-y-2">
            {data.users.length === 0 ? (
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.015] p-8 text-center text-[13px] text-zinc-500">
                No users have logged in during this session yet. Users who sign
                in via <code className="text-brand-300">/login</code> will
                appear here with their profile, scopes, and server list.
              </div>
            ) : (
              data.users.map((u) => {
                const expanded = expandedUserId === u.id;
                return (
                  <div
                    key={u.id}
                    className="rounded-2xl border border-white/[0.07] bg-white/[0.018] p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        {u.avatarUrl ? (
                          <Image
                            src={u.avatarUrl}
                            alt=""
                            width={38}
                            height={38}
                            unoptimized
                            className="size-[38px] shrink-0 rounded-full ring-1 ring-white/10"
                          />
                        ) : (
                          <span className="flex size-[38px] shrink-0 items-center justify-center rounded-full bg-white/[0.06] font-mono text-xs text-zinc-300">
                            {u.username.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-[13.5px] font-medium text-white">
                            {u.globalName || u.username}{" "}
                            <span className="font-mono text-[11px] text-zinc-500">
                              @{u.username}
                            </span>
                          </p>
                          <p className="truncate font-mono text-[10px] text-zinc-500">
                            ID {u.id}
                            {u.email ? ` · ${u.email}` : ""} · {u.guildCount}{" "}
                            servers
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedUserId(expanded ? null : u.id)
                          }
                          className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-300 hover:border-white/25 hover:text-white"
                        >
                          {expanded ? "Hide Servers" : `Servers (${u.guildCount})`}
                        </button>
                        {u.hasJoinScope && (
                          <button
                            type="button"
                            disabled={joinBusy !== null}
                            onClick={() => void handleJoinGuild([u.id])}
                            className="rounded-lg bg-brand-600 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-white hover:bg-brand-500 disabled:opacity-40"
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
                          className="rounded border border-white/[0.07] bg-ink-950/70 px-1.5 py-0.5 font-mono text-[9.5px] text-zinc-400"
                        >
                          {s}
                        </span>
                      ))}
                    </div>

                    {expanded && (
                      <div className="mt-3 grid max-h-56 gap-1.5 overflow-y-auto border-t border-white/[0.06] pt-3 sm:grid-cols-2">
                        {u.guilds.map((g) => (
                          <div
                            key={g.id}
                            className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.05] bg-ink-950/60 px-2.5 py-1.5"
                          >
                            <span className="truncate text-[11.5px] text-zinc-300">
                              {g.name}
                            </span>
                            <span className="shrink-0 font-mono text-[9px] uppercase text-zinc-600">
                              {g.owner
                                ? "owner"
                                : g.canManage
                                  ? "staff"
                                  : "member"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab: Logs & Webhook */}
      {tab === "logs" && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
          <form
            onSubmit={(e) => void handlePostLog(e)}
            className="space-y-3.5 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-brand-400">
              broadcast log / test webhook
            </p>
            <div>
              <label className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-zinc-500">
                tag
              </label>
              <select
                value={logTag}
                onChange={(e) => setLogTag(e.target.value)}
                className="mt-1.5 h-10 w-full rounded-xl border border-white/10 bg-ink-950 px-3 font-mono text-[12px] text-zinc-200 focus:outline-none"
              >
                {["GUARD", "SCAN", "WARN", "DENY", "FIX", "AUDIT"].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-zinc-500">
                message
              </label>
              <input
                type="text"
                value={logMsg}
                onChange={(e) => setLogMsg(e.target.value)}
                placeholder="e.g. anti-nuke shield synced across shards"
                className="mt-1.5 h-10 w-full rounded-xl border border-white/10 bg-ink-950 px-3 font-mono text-[12px] text-zinc-100 placeholder:text-zinc-600 focus:border-brand-500/50 focus:outline-none"
              />
            </div>
            <label className="flex items-center gap-2 text-[12px] text-zinc-400">
              <input
                type="checkbox"
                checked={logAlert}
                onChange={(e) => setLogAlert(e.target.checked)}
                className="accent-brand-600"
              />
              Mark as crimson alert
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
                className="h-10 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 text-[12px] text-zinc-400 hover:border-white/25 hover:text-white"
              >
                Clear
              </button>
            </div>
            {logFeedback && (
              <p className="font-mono text-[11px] text-emerald-400">
                {logFeedback}
              </p>
            )}
          </form>

          <div className="panel panel-inner overflow-hidden rounded-2xl shadow-panel">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-400">
                full audit log feed
              </span>
              <span className="font-mono text-[10px] text-emerald-400">
                ● {data.liveLogs ? "live" : "default"}
              </span>
            </div>
            <div className="max-h-[420px] space-y-2 overflow-y-auto p-4 font-mono text-[11.5px]">
              {data.logs.map((l, i) => (
                <div
                  key={l.id ?? `${l.t}-${i}`}
                  className="flex flex-wrap items-start gap-2.5 rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-2"
                >
                  <span
                    className={`mt-px shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium tracking-wider ${
                      l.ok
                        ? "bg-emerald-500/10 text-emerald-300"
                        : "bg-brand-600/15 text-brand-300"
                    }`}
                  >
                    {l.t}
                  </span>
                  <span className="min-w-0 flex-1 break-words text-zinc-300">
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

      {/* Tab: Bot Servers */}
      {tab === "servers" && (
        <div>
          {data.botGuilds.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.015] p-8 text-center text-[13px] text-zinc-500">
              Set <code className="text-brand-300">DISCORD_BOT_TOKEN</code> in
              your environment variables to list every server {site.name} is
              installed in.
            </div>
          ) : (
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {data.botGuilds.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.018] p-3.5"
                >
                  {g.iconUrl ? (
                    <Image
                      src={g.iconUrl}
                      alt=""
                      width={36}
                      height={36}
                      unoptimized
                      className="size-9 shrink-0 rounded-full ring-1 ring-white/10"
                    />
                  ) : (
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/[0.05] font-mono text-[11px] text-zinc-400">
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

      {/* Tab: Config & Health */}
      {tab === "config" && (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.018] p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
              environment integrations
            </p>
            <div className="mt-4 space-y-2">
              {integrationItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.05] bg-ink-950/60 px-3 py-2.5"
                >
                  <span className="text-[12px] text-zinc-300">
                    {item.label}
                  </span>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded px-2 py-0.5 font-mono text-[9.5px] uppercase ${
                      item.ok
                        ? "bg-emerald-500/10 text-emerald-400"
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

          <div className="space-y-2.5 rounded-2xl border border-white/[0.07] bg-white/[0.018] p-5 font-mono text-[11.5px]">
            <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
              active identifiers
            </p>
            <ConfigRow
              label="Owner ID(s)"
              value={data.config.ownerIds.join(", ")}
            />
            <ConfigRow label="Client ID" value={data.config.clientId} />
            <ConfigRow label="Command Prefix" value={data.config.prefix} />
            <ConfigRow label="OAuth2 Scopes" value={data.config.oauthScopes} />
            <ConfigRow
              label="OAuth2 Callback"
              value={`${site.url}/api/auth/callback/discord`}
            />
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
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.018] p-4">
      <p className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 font-display text-[26px] font-semibold tracking-tight text-white">
        {value}
      </p>
      <p className="mt-1 font-mono text-[10px] text-zinc-500">{sub}</p>
    </div>
  );
}

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/[0.05] bg-ink-950/60 px-3 py-2">
      <span className="text-zinc-500">{label}</span>
      <span className="break-all text-brand-300">{value}</span>
    </div>
  );
}
