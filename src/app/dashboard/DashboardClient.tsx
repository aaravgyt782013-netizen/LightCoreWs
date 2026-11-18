"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { defaultLogs, site, type LogEntry } from "@/lib/site";
import { DiscordIcon, ArrowRight, ShieldIcon } from "@/components/ui/Icons";

type DashboardUser = {
  id: string;
  username: string;
  globalName: string | null;
  avatarUrl: string | null;
  email?: string | null;
  isOwner?: boolean;
};

type DashboardGuild = {
  id: string;
  name: string;
  iconUrl: string | null;
  owner: boolean;
  canManage: boolean;
  botPresent: boolean | null;
  inviteUrl: string;
};

export function DashboardClient() {
  const [state, setState] = useState<"loading" | "guest" | "authed">("loading");
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [guilds, setGuilds] = useState<DashboardGuild[]>([]);
  const [allGuilds, setAllGuilds] = useState<DashboardGuild[]>([]);
  const [showAllGuilds, setShowAllGuilds] = useState(false);
  const [selectedGuildId, setSelectedGuildId] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>(defaultLogs);
  const [liveLogs, setLiveLogs] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!active) return;
        if (!res.ok) {
          setState("guest");
          return;
        }
        const data = (await res.json()) as {
          authenticated?: boolean;
          user?: DashboardUser;
          guilds?: DashboardGuild[];
          allGuilds?: DashboardGuild[];
        };
        if (data.authenticated && data.user) {
          setUser(data.user);
          setGuilds(data.guilds ?? []);
          setAllGuilds(data.allGuilds ?? data.guilds ?? []);
          setState("authed");
        } else {
          setState("guest");
        }
      } catch {
        if (active) setState("guest");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const loadLogs = async () => {
      try {
        const query = selectedGuildId
          ? `/api/logs?limit=30&guildId=${encodeURIComponent(selectedGuildId)}`
          : "/api/logs?limit=30";
        const res = await fetch(query, { cache: "no-store" });
        if (!res.ok || !active) return;
        const data = (await res.json()) as {
          live?: boolean;
          logs?: LogEntry[];
        };
        if (!active) return;
        setLiveLogs(Boolean(data.live));
        setLogs(Array.isArray(data.logs) ? data.logs : []);
      } catch {
        // Keep current log buffer.
      }
    };

    void loadLogs();
    const id = window.setInterval(() => void loadLogs(), 6000);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, [selectedGuildId]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  if (state === "loading") {
    return (
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-8 font-mono text-[12px] text-zinc-400">
        Verifying Discord session…
      </div>
    );
  }

  if (state === "guest" || !user) {
    return (
      <div className="grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-brand-400">
            <ShieldIcon className="size-3.5" />
            authentication required
          </div>
          <h2 className="mt-3 font-display text-[22px] font-semibold text-white">
            Sign in with Discord
          </h2>
          <p className="mt-2 text-[13.5px] leading-relaxed text-zinc-400">
            Connect your Discord account to view your servers, invite{" "}
            {site.name}, and filter per-guild logs.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[#5865F2] px-5 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#4752C4]"
            >
              <DiscordIcon className="size-4" />
              Open Login
            </Link>
            <a
              href={site.invite}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex h-11 items-center gap-2 rounded-full border border-white/12 bg-white/[0.03] px-5 text-[13.5px] font-medium text-zinc-200 transition-colors hover:border-white/25 hover:text-white"
            >
              Invite {site.name}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>

        <LogStreamCard
          logs={logs}
          live={liveLogs}
          selectedGuildName={null}
          onClearGuild={() => setSelectedGuildId(null)}
        />
      </div>
    );
  }

  const displayedGuilds = showAllGuilds ? allGuilds : guilds;
  const selectedGuild = guilds.find((g) => g.id === selectedGuildId) ?? null;

  return (
    <div className="space-y-6">
      {/* User bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-5 py-4">
        <div className="flex items-center gap-3">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt=""
              width={40}
              height={40}
              unoptimized
              className="size-10 rounded-full ring-1 ring-white/15"
            />
          ) : (
            <span className="flex size-10 items-center justify-center rounded-full bg-brand-600/20 font-display text-sm font-semibold text-brand-300">
              {(user.globalName || user.username).slice(0, 2).toUpperCase()}
            </span>
          )}
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[14px] font-medium text-white">
                {user.globalName || user.username}
              </p>
              {user.isOwner && (
                <span className="rounded border border-brand-500/40 bg-brand-600/20 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-brand-300">
                  owner
                </span>
              )}
            </div>
            <p className="font-mono text-[10px] text-zinc-500">
              @{user.username} · {guilds.length} manageable / {allGuilds.length}{" "}
              total servers
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {user.isOwner && (
            <Link
              href="/admin"
              className="rounded-full bg-brand-600 px-3.5 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-brand-500"
            >
              Owner Panel
            </Link>
          )}
          <a
            href={site.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-[12px] font-medium text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
          >
            Support
          </a>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-[12px] font-medium text-zinc-400 transition-colors hover:border-brand-500/40 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        {/* Guild list */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.018] p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAllGuilds(false)}
                className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                  !showAllGuilds
                    ? "bg-brand-600/20 text-brand-300"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Manageable ({guilds.length})
              </button>
              <button
                type="button"
                onClick={() => setShowAllGuilds(true)}
                className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                  showAllGuilds
                    ? "bg-brand-600/20 text-brand-300"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                All Servers ({allGuilds.length})
              </button>
            </div>
            <a
              href={site.invite}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-brand-400 hover:text-brand-300"
            >
              + invite bot
            </a>
          </div>

          {displayedGuilds.length === 0 ? (
            <p className="mt-6 text-[13px] text-zinc-500">
              No servers found in this view.
            </p>
          ) : (
            <div className="mt-4 max-h-[420px] space-y-2 overflow-y-auto pr-1">
              {displayedGuilds.map((g) => {
                const isSelected = g.id === selectedGuildId;
                return (
                  <div
                    key={g.id}
                    className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-3.5 py-3 transition-colors ${
                      isSelected
                        ? "border-brand-500/40 bg-brand-950/30"
                        : "border-white/[0.06] bg-ink-950/50 hover:border-white/[0.14]"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
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
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-zinc-100">
                          {g.name}
                        </p>
                        <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-zinc-600">
                          {g.owner
                            ? "owner"
                            : g.canManage
                              ? "manager"
                              : "member"}
                          {g.botPresent === true && " · protected"}
                        </p>
                      </div>
                    </div>

                    {g.canManage && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedGuildId(isSelected ? null : g.id)
                          }
                          className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-300 transition-colors hover:border-white/25 hover:text-white"
                        >
                          {isSelected ? "All Logs" : "Logs"}
                        </button>
                        {g.botPresent !== true && (
                          <a
                            href={g.inviteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-brand-600 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-white transition-colors hover:bg-brand-500"
                          >
                            Add Bot
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Live audit log panel */}
        <LogStreamCard
          logs={logs}
          live={liveLogs}
          selectedGuildName={selectedGuild?.name ?? null}
          onClearGuild={() => setSelectedGuildId(null)}
        />
      </div>
    </div>
  );
}

function LogStreamCard({
  logs,
  live,
  selectedGuildName,
  onClearGuild,
}: {
  logs: LogEntry[];
  live: boolean;
  selectedGuildName: string | null;
  onClearGuild: () => void;
}) {
  return (
    <div className="panel panel-inner overflow-hidden rounded-2xl shadow-panel">
      <div className="flex items-center justify-between gap-2 border-b border-white/[0.07] px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-brand-500 shadow-[0_0_10px_2px_rgba(255,43,43,0.6)]" />
          <span className="truncate font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">
            {selectedGuildName ? `logs · ${selectedGuildName}` : "audit stream"}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {selectedGuildName && (
            <button
              type="button"
              onClick={onClearGuild}
              className="font-mono text-[9.5px] uppercase tracking-wider text-zinc-500 hover:text-zinc-200"
            >
              clear
            </button>
          )}
          <span
            className={`font-mono text-[10px] ${
              live ? "text-emerald-400" : "text-zinc-500"
            }`}
          >
            ● {live ? "live" : "sample"}
          </span>
        </div>
      </div>

      <div className="max-h-[380px] space-y-2 overflow-y-auto p-4 font-mono text-[11.5px] leading-relaxed">
        {logs.length === 0 ? (
          <p className="py-8 text-center text-[11.5px] text-zinc-500">
            No live logs recorded for this server yet. Push events from your bot
            to <code className="text-brand-300">POST /api/logs</code>.
          </p>
        ) : (
          logs.map((l, i) => (
            <div
              key={l.id ?? `${l.t}-${i}`}
              className="flex items-start gap-2.5 rounded-lg border border-white/[0.05] bg-white/[0.015] px-2.5 py-2"
            >
              <span
                className={`mt-px shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium tracking-wider ${
                  l.ok
                    ? "bg-emerald-500/10 text-emerald-300/90"
                    : "bg-brand-600/15 text-brand-300"
                }`}
              >
                {l.t}
              </span>
              <span className="min-w-0 flex-1 break-words text-zinc-300">
                {l.msg}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
