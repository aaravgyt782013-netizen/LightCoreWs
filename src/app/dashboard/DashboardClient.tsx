"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { site } from "@/lib/site";
import { sanitizeDiscordInviteUrl } from "@/lib/discord-oauth";
import { useSiteConfig } from "@/components/site/SiteConfigProvider";
import {
  ArrowRight,
  CrownIcon,
  LockIcon,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
  ShieldIcon,
} from "@/components/ui/Icons";

type DashboardUser = {
  id: string;
  username: string;
  globalName: string | null;
  avatarUrl: string | null;
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

type UserPremium = {
  tier: "plus" | "pro" | "ultra";
  tierName: string;
  guildId: string | null;
  guildName: string | null;
  expiresAt: string | null;
  isLifetime?: boolean;
};

export function DashboardClient() {
  const router = useRouter();
  const { config: siteCfg } = useSiteConfig();
  const brandName = siteCfg.brandName || site.name;
  const currency = siteCfg.currencySymbol || "₹";
  const safeInviteHref = sanitizeDiscordInviteUrl(
    siteCfg.inviteUrl || site.invite,
    site.clientId,
  );
  const [state, setState] = useState<"loading" | "guest" | "authed">("loading");
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [premium, setPremium] = useState<UserPremium | null>(null);
  const [guilds, setGuilds] = useState<DashboardGuild[]>([]);
  const [allGuilds, setAllGuilds] = useState<DashboardGuild[]>([]);
  const [filter, setFilter] = useState<"manageable" | "active" | "all">(
    "manageable",
  );
  const [search, setSearch] = useState("");

  const loadSession = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (!res.ok) {
        setState("guest");
        return;
      }
      const data = (await res.json()) as {
        authenticated?: boolean;
        user?: DashboardUser;
        premium?: UserPremium | null;
        guilds?: DashboardGuild[];
        allGuilds?: DashboardGuild[];
      };
      if (data.authenticated && data.user) {
        setUser(data.user);
        setPremium(data.premium ?? null);
        setGuilds(data.guilds ?? []);
        setAllGuilds(data.allGuilds ?? data.guilds ?? []);
        setState("authed");
      } else {
        setState("guest");
      }
    } catch {
      setState("guest");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadSession(false);
  }, [loadSession]);

  const activeGuilds = useMemo(
    () => guilds.filter((g) => g.botPresent === true),
    [guilds],
  );

  const visibleGuilds = useMemo(() => {
    const base =
      filter === "all"
        ? allGuilds
        : filter === "active"
          ? activeGuilds
          : guilds;
    const q = search.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (g) => g.name.toLowerCase().includes(q) || g.id.includes(q),
    );
  }, [filter, allGuilds, activeGuilds, guilds, search]);

  const handleOpenGuild = (g: DashboardGuild) => {
    if (!g.canManage) return;
    router.push(`/dashboard/${g.id}`);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  // Layout-locked skeleton inside PageShell — zero fullscreen loader flicker
  if (state === "loading") {
    return (
      <div className="space-y-5">
        <div className="skeleton-shimmer h-20 rounded-2xl border border-white/[0.07]" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="skeleton-shimmer h-56 rounded-2xl border border-white/[0.07]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (state === "guest" || !user) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="glass-card relative overflow-hidden rounded-[32px] p-8 sm:p-10 shadow-[0_24px_70px_-20px_rgba(0,0,0,0.85)]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/70 to-transparent"
          />

          <div className="flex flex-col items-center text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl border border-brand-400/35 bg-brand-400/10 text-brand-300 shadow-[0_0_32px_-8px_rgb(var(--brand-400)/0.6)]">
              <ShieldIcon className="size-6" />
            </div>

            <h2 className="mt-5 font-display text-[26px] font-bold tracking-tight text-white sm:text-[30px]">
              Manage Your Discord Servers
            </h2>
            <p className="mt-2.5 max-w-lg text-[14px] leading-relaxed text-zinc-300">
              Sign in with your Discord account to manage servers where you hold
              Administrator or Server Manager permissions.
            </p>
          </div>

          <div className="mt-7 grid gap-2.5 sm:grid-cols-2">
            {[
              {
                title: "Anti-Nuke & Rollback",
                desc: "14 granular action rate-gates with automated state restoration",
              },
              {
                title: "AutoMod Content Firewall",
                desc: "Intelligent spam, scam, invite, and mass-mention protection",
              },
              {
                title: "VoiceMaster Hub",
                desc: "Dynamic join-to-create temporary voice channels with controls",
              },
              {
                title: "Support Ticket Desk",
                desc: "Threaded ticket panels with transcripts and staff claim system",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/[0.065] bg-ink-950/70 p-3.5 text-left"
              >
                <p className="font-display text-[13.5px] font-semibold text-white">
                  {item.title}
                </p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-zinc-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <form method="POST" action="/api/auth/discord" className="mt-7">
            <input type="hidden" name="next" value="/dashboard" />
            <button
              type="submit"
              className="btn-primary btn-glow relative flex h-[54px] w-full items-center justify-center gap-2.5 overflow-hidden rounded-full text-[15px] font-semibold text-white transition-all duration-300 ease-smooth hover:-translate-y-0.5 active:scale-[0.985]"
            >
              <ShieldIcon className="size-5" />
              Sign in with Discord
            </button>
          </form>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-4 font-mono text-[11px] text-zinc-400">
            <span className="inline-flex items-center gap-1.5 text-zinc-300">
              <LockIcon className="size-3.5 text-emerald-400" />
              Encrypted Discord OAuth 2.0 Session
            </span>
            <Link
              href="/security"
              className="text-brand-300 transition-colors hover:text-white"
            >
              Security Architecture →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Authenticated User Header Bar */}
      <div className="panel panel-inner flex flex-wrap items-center justify-between gap-4 rounded-2xl px-5 py-4 shadow-panel">
        <div className="flex items-center gap-3.5">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt=""
              width={46}
              height={46}
              unoptimized
              className="size-[46px] rounded-full ring-2 ring-brand-500/40"
            />
          ) : (
            <span className="flex size-[46px] items-center justify-center rounded-full bg-brand-600/25 font-display text-[15px] font-semibold text-brand-300 ring-2 ring-brand-500/30">
              {(user.globalName || user.username).slice(0, 2).toUpperCase()}
            </span>
          )}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-display text-[16px] font-semibold text-white">
                {user.globalName || user.username}
              </p>
              {user.isOwner && (
                <span className="rounded-md border border-brand-400/40 bg-brand-500/20 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-brand-200">
                  owner
                </span>
              )}
              {premium && (
                <span className="inline-flex items-center gap-1 rounded-md border border-brand-300/45 bg-gradient-to-r from-brand-600/30 to-brand-500/20 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-brand-100">
                  <CrownIcon className="size-2.5 text-brand-300" />
                  {premium.tierName}
                </span>
              )}
              <span className="rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-emerald-400">
                connected
              </span>
            </div>
            <p className="mt-0.5 font-mono text-[10.5px] text-zinc-500">
              @{user.username} · {guilds.length} manageable · {allGuilds.length}{" "}
              total servers
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/docs"
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-4 text-[12.5px] font-medium text-zinc-200 transition hover:border-brand-400/40 hover:text-white"
          >
            <SearchIcon className="size-3.5 text-brand-400" />
            Commands
          </Link>

          <Link
            href="/premium"
            className="btn-primary btn-glow relative inline-flex h-10 items-center gap-2 overflow-hidden rounded-full px-4 text-[12.5px] font-semibold transition-all duration-300 ease-smooth hover:-translate-y-0.5 active:scale-[0.985]"
          >
            <CrownIcon className="size-4" />
            {premium ? "Manage Premium" : "Buy Premium"}
          </Link>

          {user.isOwner && (
            <Link
              href="/admin"
              className="inline-flex h-10 items-center gap-1.5 rounded-full border border-brand-500/40 bg-brand-950/50 px-4 text-[12.5px] font-medium text-brand-200 transition-colors hover:border-brand-400 hover:text-white"
            >
              <ShieldIcon className="size-3.5 text-brand-400" />
              Owner Panel
            </Link>
          )}

          <button
            type="button"
            onClick={() => void loadSession(true)}
            disabled={refreshing}
            title="Refresh servers"
            className="inline-flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-zinc-300 transition-colors hover:border-white/25 hover:text-white disabled:opacity-50"
          >
            <RefreshIcon
              className={`size-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>

          <button
            type="button"
            onClick={() => void handleLogout()}
            className="inline-flex h-10 items-center rounded-full border border-white/10 bg-white/[0.03] px-4 text-[12px] font-medium text-zinc-400 transition-colors hover:border-brand-500/40 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Premium Status / Upgrade Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-brand-400/30 bg-gradient-to-r from-brand-950/80 via-ink-900 to-ink-950 px-5 py-4 shadow-panel sm:px-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-[radial-gradient(closest-side,rgb(var(--brand-500)/0.22),transparent)] blur-xl"
        />
        <div className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3.5 sm:items-center">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-brand-400/35 bg-brand-500/15 text-brand-300">
              <CrownIcon className="size-5" />
            </span>
            <div>
              <p className="font-display text-[15px] font-semibold text-white">
                {premium
                  ? `${premium.tierName} Active on @${user.username}`
                  : `Upgrade to ${brandName} Premium`}
              </p>
              <p className="mt-0.5 text-[12.5px] text-zinc-400">
                {premium
                  ? `${premium.expiresAt ? `Valid until ${new Date(premium.expiresAt).toLocaleDateString()}` : "Lifetime access"}${premium.guildName ? ` · Bound to ${premium.guildName}` : " · Assign a server slot anytime"}`
                  : `Unlock Limit System, Anti-Raid Bot Filter, Anti-Betray Mode, Vanity Guard, No-Prefix & Custom Branded Bot — from ${currency}299/mo.`}
              </p>
            </div>
          </div>
          <Link
            href="/premium"
            className="group inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-brand-400/45 bg-brand-500/15 px-4 text-[12.5px] font-semibold text-brand-100 transition-all hover:bg-brand-500/25 hover:text-white"
          >
            {premium ? "Manage Slot" : "View Plans"}
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      {/* Controls: Filter Tabs + Search + Add Bot */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter("manageable")}
            className={`rounded-full border px-3.5 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] transition-colors ${
              filter === "manageable"
                ? "border-brand-500/50 bg-brand-600/20 text-white"
                : "border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:text-white"
            }`}
          >
            Manageable ({guilds.length})
          </button>
          {activeGuilds.length > 0 && (
            <button
              type="button"
              onClick={() => setFilter("active")}
              className={`rounded-full border px-3.5 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] transition-colors ${
                filter === "active"
                  ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-200"
                  : "border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:text-white"
              }`}
            >
              Active ({activeGuilds.length})
            </button>
          )}
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-full border px-3.5 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] transition-colors ${
              filter === "all"
                ? "border-brand-500/50 bg-brand-600/20 text-white"
                : "border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:text-white"
            }`}
          >
            All Servers ({allGuilds.length})
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your servers..."
              className="h-10 w-full rounded-xl border border-white/10 bg-ink-900/80 pl-10 pr-3.5 text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:border-brand-500/50 focus:outline-none"
            />
          </div>
          <a
            href={safeInviteHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-white/12 bg-white/[0.04] px-3.5 text-[12.5px] font-medium text-zinc-200 transition-colors hover:border-brand-500/40 hover:text-white"
          >
            <PlusIcon className="size-3.5 text-brand-400" />
            <span className="hidden sm:inline">Add Server</span>
          </a>
        </div>
      </div>

      {/* Server Grid */}
      {visibleGuilds.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.018] p-12 text-center">
          <p className="font-display text-[17px] font-semibold text-white">
            No matching servers found
          </p>
          <p className="mt-2 text-[13px] text-zinc-500">
            {search
              ? "Try clearing your search filter."
              : "You need Manage Server or Administrator permissions in a Discord server to configure it."}
          </p>
          <a
            href={safeInviteHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-5 inline-flex h-10 items-center gap-2 rounded-full px-5 text-[13px] font-semibold"
          >
            Invite {brandName}
          </a>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleGuilds.map((g) => (
            <div
              key={g.id}
              onClick={() => g.canManage && handleOpenGuild(g)}
              role={g.canManage ? "button" : undefined}
              tabIndex={g.canManage ? 0 : undefined}
              onKeyDown={(e) => {
                if (g.canManage && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  handleOpenGuild(g);
                }
              }}
              className={`group relative flex flex-col overflow-hidden rounded-3xl border border-white/[0.075] bg-ink-900/80 shadow-panel transition-all duration-500 ease-smooth ${
                g.canManage
                  ? "cursor-pointer hover:-translate-y-1 hover:border-brand-400/35 hover:shadow-[0_26px_64px_-26px_rgb(var(--brand-400)/0.36)]"
                  : "opacity-70"
              }`}
            >
              <div className="relative h-24 overflow-hidden border-b border-white/[0.06] bg-gradient-to-br from-brand-950/70 via-ink-850 to-ink-950">
                {g.iconUrl && (
                  <Image
                    src={g.iconUrl}
                    alt=""
                    width={128}
                    height={128}
                    unoptimized
                    className="size-full scale-125 object-cover opacity-30 blur-xl transition-transform duration-500 group-hover:scale-150"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/40 to-transparent" />
                <div className="absolute right-3 top-3">
                  {g.botPresent === true ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-ink-950/80 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-emerald-400 backdrop-blur">
                      <span className="size-1.5 rounded-full bg-emerald-400" />
                      Active
                    </span>
                  ) : g.canManage ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-ink-950/80 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-zinc-300 backdrop-blur">
                      <span className="size-1.5 rounded-full bg-brand-400" />
                      Manageable
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-white/10 bg-ink-950/80 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-zinc-500 backdrop-blur">
                      Member
                    </span>
                  )}
                </div>
              </div>

              <div className="relative flex flex-1 flex-col px-5 pb-5">
                <div className="-mt-8 flex items-end justify-between">
                  {g.iconUrl ? (
                    <Image
                      src={g.iconUrl}
                      alt={g.name}
                      width={60}
                      height={60}
                      unoptimized
                      className="size-[60px] rounded-2xl border-[3px] border-ink-900 bg-ink-850 object-cover shadow-lg"
                    />
                  ) : (
                    <span className="flex size-[60px] items-center justify-center rounded-2xl border-[3px] border-ink-900 bg-ink-800 font-display text-[18px] font-bold text-zinc-200 shadow-lg">
                      {g.name
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((w) => w[0] || "")
                        .join("")
                        .toUpperCase() || "?"}
                    </span>
                  )}
                  <span
                    className={`rounded-md border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] ${
                      g.owner
                        ? "border-amber-400/30 bg-amber-500/10 text-amber-300"
                        : g.canManage
                          ? "border-brand-500/25 bg-brand-950/40 text-brand-300"
                          : "border-white/10 bg-white/[0.03] text-zinc-500"
                    }`}
                  >
                    {g.owner ? "Owner" : g.canManage ? "Admin" : "Member"}
                  </span>
                </div>

                <h3 className="mt-3.5 truncate font-display text-[16.5px] font-semibold tracking-tight text-white">
                  {g.name}
                </h3>
                <p className="mt-0.5 font-mono text-[10px] text-zinc-500">
                  ID: {g.id}
                </p>

                <div className="mt-5 flex items-center gap-2 pt-auto">
                  {g.canManage ? (
                    <>
                      <Link
                        href={`/dashboard/${g.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="btn-primary group/btn inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full px-4 text-[13px] font-semibold active:scale-[0.985]"
                      >
                        {g.botPresent === true ? "Manage" : "Configure"}
                        <ArrowRight className="size-3.5 transition-transform duration-300 ease-smooth group-hover/btn:translate-x-0.5" />
                      </Link>
                      {g.botPresent !== true && (
                        <a
                          href={g.inviteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="btn-soft inline-flex h-10 items-center justify-center px-4 text-[12px] font-medium"
                        >
                          Invite
                        </a>
                      )}
                    </>
                  ) : (
                    <span className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02] font-mono text-[10.5px] text-zinc-500">
                      Manage Server Required
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
