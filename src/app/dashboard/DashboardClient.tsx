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
  CheckIcon,
  CrownIcon,
  LockIcon,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
  ShieldIcon,
  SparklesIcon,
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

const DEMO_HIGHLIGHTS = [
  { label: "14 Anti-Nuke Guards", tab: "antinuke" },
  { label: "AutoMod Firewall", tab: "automod" },
  { label: "Captcha Verification", tab: "verification" },
  { label: "VoiceMaster Hub", tab: "voicemaster" },
  { label: "Ticket Desk", tab: "tickets" },
  { label: "Custom Embed Studio", tab: "utility" },
] as const;

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
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Connect real Discord account */}
        <div className="glass-card relative overflow-hidden rounded-[28px] p-7 sm:p-9 lg:col-span-6">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-8 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-brand-500 to-transparent"
          />
          <div className="flex size-12 items-center justify-center rounded-2xl border border-brand-500/35 bg-brand-950/55 text-brand-400 shadow-[0_0_30px_-8px_rgb(var(--brand-500)/0.75)]">
            <ShieldIcon className="size-5" />
          </div>
          <h2 className="mt-5 font-display text-[24px] font-bold tracking-tight text-white">
            Manage Your Discord Servers
          </h2>
          <p className="mt-2 text-[13.5px] leading-relaxed text-zinc-400">
            Connect via read-only Discord OAuth 2.0 (
            <code className="font-mono text-[12px] text-brand-300">
              identify
            </code>{" "}
            &amp;{" "}
            <code className="font-mono text-[12px] text-brand-300">guilds</code>
            ) to configure every server where you hold Administrator or Manage
            Server.
          </p>

          <ul className="mt-5 space-y-2 text-[12.5px] text-zinc-300">
            {[
              "Standard OAuth 2.0 hosted directly on discord.com",
              "Strictly read-only — never auto-joins your account to any server",
              "Real-time channel, role, embed & security preset editor",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <CheckIcon className="size-3.5 shrink-0 text-emerald-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <form method="POST" action="/api/auth/discord" className="mt-7">
            <input type="hidden" name="next" value="/dashboard" />
            <button
              type="submit"
              className="btn-primary btn-glow relative flex h-[52px] w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl text-[14.5px] font-semibold text-white transition-all duration-300 ease-smooth hover:-translate-y-0.5 active:scale-[0.985]"
            >
              <ShieldIcon className="size-[18px]" />
              Authorize with Discord
            </button>
          </form>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 font-mono text-[10.5px] text-zinc-500">
            <span className="inline-flex items-center gap-1.5">
              <LockIcon className="size-3 text-emerald-400" />
              Stateless HttpOnly OAuth2 session
            </span>
            <Link
              href="/security"
              className="text-brand-300 underline-offset-2 hover:text-white hover:underline"
            >
              OAuth2 Security →
            </Link>
          </div>
        </div>

        {/* Interactive Zero-Login Demo Sandbox */}
        <div className="panel panel-inner relative flex flex-col justify-between overflow-hidden rounded-[28px] border-emerald-500/25 p-7 sm:p-9 lg:col-span-6">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex size-12 items-center justify-center rounded-2xl border border-emerald-500/35 bg-emerald-500/10 text-emerald-300">
                <SparklesIcon className="size-5" />
              </div>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-emerald-300">
                Zero Sign-In · Live
              </span>
            </div>

            <h2 className="mt-5 font-display text-[24px] font-bold tracking-tight text-white">
              Try the Interactive Sandbox
            </h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-zinc-400">
              Test the entire 12-module {brandName} control plane right now on a
              pre-loaded 18,400-member community — click any module to jump
              straight in:
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2">
              {DEMO_HIGHLIGHTS.map((m) => (
                <Link
                  key={m.label}
                  href={`/dashboard/demo?tab=${m.tab}`}
                  className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-ink-950/75 px-3.5 py-2.5 text-[12px] font-medium text-zinc-200 transition hover:border-brand-500/45 hover:text-white"
                >
                  <span className="truncate">{m.label}</span>
                  <span className="font-mono text-[10px] text-brand-400">→</span>
                </Link>
              ))}
            </div>
          </div>

          <Link
            href="/dashboard/demo"
            className="group mt-7 flex h-[52px] w-full items-center justify-center gap-2.5 rounded-2xl border border-emerald-400/40 bg-emerald-500/15 text-[14.5px] font-semibold text-emerald-100 transition-all hover:-translate-y-0.5 hover:border-emerald-300/65 hover:bg-emerald-500/25 hover:text-white"
          >
            <span>Open Full Demo Server</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
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
            href="/dashboard/demo"
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-4 text-[12.5px] font-medium text-zinc-200 transition hover:border-brand-500/40 hover:text-white"
          >
            <SparklesIcon className="size-3.5 text-brand-400" />
            Demo Sandbox
          </Link>

          <Link
            href="/premium"
            className="btn-glow relative inline-flex h-10 items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-brand-500 px-4 text-[12.5px] font-semibold text-white shadow-[0_8px_30px_-8px_rgb(var(--brand-500)/0.82)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110"
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
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-brand-600 px-5 text-[13px] font-semibold text-white hover:bg-brand-500"
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
              className={`group relative flex flex-col overflow-hidden rounded-2xl border border-brand-200/[0.09] bg-ink-900/85 shadow-panel transition-all duration-300 ease-smooth ${
                g.canManage
                  ? "cursor-pointer hover:-translate-y-1 hover:border-brand-400/50 hover:shadow-[0_22px_55px_-22px_rgb(var(--brand-500)/0.5)]"
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
                        className="group/btn inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-brand-500"
                      >
                        {g.botPresent === true ? "Manage" : "Configure"}
                        <ArrowRight className="size-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                      </Link>
                      {g.botPresent !== true && (
                        <a
                          href={g.inviteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex h-10 items-center justify-center rounded-xl border border-white/12 bg-white/[0.04] px-3.5 text-[12px] font-medium text-zinc-200 transition-colors hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
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
