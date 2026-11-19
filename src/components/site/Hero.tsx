"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { InviteButton } from "@/components/ui/InviteButton";
import { Wordmark } from "@/components/ui/Logo";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { openCommandPalette } from "@/components/ui/CommandPalette";
import {
  ArrowRight,
  BoltIcon,
  CheckIcon,
  LockIcon,
  SearchIcon,
  ShieldIcon,
  SparklesIcon,
  TerminalIcon,
} from "@/components/ui/Icons";
import { useSiteConfig } from "@/components/site/SiteConfigProvider";
import { BOT_COMMANDS } from "@/lib/commands";
import { defaultLogs, site, type LogEntry } from "@/lib/site";

const SIMULATED_RAID: LogEntry[] = [
  { t: "ALERT", ok: false, msg: "Unwhitelisted bot triggered 6 channel deletes in 1.4s" },
  { t: "GATE", ok: false, msg: "Predicate channel_delete:2:60s tripped · locking actor" },
  { t: "PUNISH", ok: false, msg: "Rogue integration banned & dangerous perms stripped (162ms)" },
  { t: "ROLLBACK", ok: true, msg: "Restored 6 deleted channels, categories & role overwrites" },
  { t: "SEALED", ok: true, msg: "Audit report posted to #antinuke-logs · zero data lost" },
];

const INITIAL_SHIELDS = [
  { key: "antinuke", label: "14-Rule Anti-Nuke Engine", sub: "ban:3:60s · ch_del:2:60s", weight: 32, on: true },
  { key: "rollback", label: "Automated State Rollback", sub: "Channels, roles & overwrites", weight: 18, on: true },
  { key: "automod", label: "8-Layer AutoMod Firewall", sub: "Spam, invites, phishing, Zalgo", weight: 18, on: true },
  { key: "verify", label: "Captcha & Age Verification", sub: "Holds fresh burner accounts", weight: 14, on: true },
  { key: "vanity", label: "Vanity URL & Webhook Lock", sub: "Instant unauthorized revert", weight: 10, on: true },
  { key: "betray", label: "Anti-Betray Burst Monitor", sub: "Flags abnormal staff spikes", weight: 8, on: false },
] as const;

const HERO_STATS = [
  { value: "14", label: "Anti-Nuke Guards" },
  { value: "68+", label: "Bot Commands" },
  { value: "12", label: "Dashboard Modules" },
  { value: "8", label: "AutoMod Filters" },
] as const;

export function Hero() {
  const { config } = useSiteConfig();

  return (
    <section className="relative overflow-hidden pb-14 pt-[112px] sm:pb-20 sm:pt-[138px]">
      <div className="container-x">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:gap-14">
          {/* Left: Flagship Brand Headline & Actions */}
          <div className="relative">
            <div
              className="animate-hero-in inline-flex items-center gap-2.5 rounded-full border border-brand-500/30 bg-brand-950/45 py-1.5 pl-1.5 pr-4 shadow-[0_0_36px_-10px_rgb(var(--brand-500)/0.65),inset_0_1px_0_rgb(255_255_255/0.08)] backdrop-blur-xl"
              style={{ animationDelay: "0ms" }}
            >
              <span className="relative flex size-6 items-center justify-center rounded-full bg-brand-500/20">
                <span className="absolute size-full animate-pulse-ring rounded-full border border-brand-400/75" />
                <span className="size-1.5 rounded-full bg-brand-400 shadow-[0_0_10px_rgb(var(--brand-400))]" />
              </span>
              <span className="font-mono text-[9.5px] font-medium uppercase tracking-[0.18em] text-zinc-100 sm:text-[10.5px] sm:tracking-[0.22em]">
                {config.tagline}
              </span>
            </div>

            <h1
              className="animate-hero-in mt-6 font-display text-[44px] font-bold leading-[0.94] tracking-[0.05em] text-white drop-shadow-[0_16px_50px_rgb(var(--brand-600)/0.3)] sm:text-[62px] lg:text-[72px]"
              style={{ animationDelay: "65ms" }}
            >
              <Wordmark leadClassName="text-white" />
              <span className="mt-3 block font-display text-[21px] font-semibold leading-[1.2] tracking-tight text-zinc-300 sm:text-[26px]">
                Unbreakable Discord security &amp;{" "}
                <span className="text-gradient-brand">server automation.</span>
              </span>
            </h1>

            <p
              className="animate-hero-in mt-5 max-w-[35.5rem] text-balance text-[15.5px] leading-[1.7] text-zinc-300 sm:text-[16.5px]"
              style={{ animationDelay: "130ms" }}
            >
              {config.description}.{" "}
              <span className="text-zinc-400">
                {config.heroSubtext ||
                  "Replace six bloated bots with one precision guard engine, VoiceMaster hub, ticket desk, and real-time web control plane."}
              </span>
            </p>

            {/* Primary CTAs */}
            <div
              className="animate-hero-in mt-8 flex flex-wrap items-center gap-3"
              style={{ animationDelay: "195ms" }}
            >
              <InviteButton size="lg" />
              <Link
                href={site.demo}
                className="group inline-flex h-[52px] items-center gap-2.5 rounded-full border border-white/[0.14] bg-white/[0.045] px-6 text-[14.5px] font-semibold text-zinc-100 shadow-[inset_0_1px_0_rgb(255_255_255/0.1)] backdrop-blur-xl transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-brand-500/55 hover:bg-brand-500/[0.12] hover:text-white hover:shadow-[0_18px_44px_-16px_rgb(var(--brand-600)/0.6)] active:scale-[0.98]"
              >
                <SparklesIcon className="size-4 text-brand-400" />
                Try Live Demo
                <ArrowRight className="size-4 transition-transform duration-300 ease-smooth group-hover:translate-x-0.5" />
              </Link>
              <Link
                href={site.dashboard}
                className="inline-flex h-[52px] items-center gap-2 rounded-full border border-white/[0.09] bg-ink-900/75 px-5 text-[14px] font-medium text-zinc-300 backdrop-blur-xl transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-white/[0.22] hover:text-white active:scale-[0.98]"
              >
                Dashboard
              </Link>
            </div>

            {/* Trust & Quick Command Bar */}
            <div
              className="animate-hero-in mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10.5px] text-zinc-500"
              style={{ animationDelay: "240ms" }}
            >
              <Link
                href="/security"
                className="inline-flex items-center gap-1.5 text-zinc-400 transition hover:text-emerald-300"
              >
                <LockIcon className="size-3.5 text-emerald-400" />
                Read-only Discord OAuth 2.0 · Zero auto-join
              </Link>
              <button
                type="button"
                onClick={openCommandPalette}
                className="inline-flex items-center gap-1.5 text-zinc-400 transition hover:text-brand-300"
              >
                <SearchIcon className="size-3.5 text-brand-400" />
                Press <kbd className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[9.5px] text-zinc-300">⌘K</kbd> to search commands
              </button>
            </div>

            {/* Crisp Capability Metrics */}
            <div
              className="animate-hero-in mt-9 grid max-w-xl grid-cols-2 gap-2.5 sm:grid-cols-4"
              style={{ animationDelay: "290ms" }}
            >
              {HERO_STATS.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/[0.075] bg-ink-900/70 px-3.5 py-3 shadow-[inset_0_1px_0_rgb(255_255_255/0.05)] backdrop-blur-md"
                >
                  <p className="font-display text-[22px] font-bold leading-none tracking-tight text-white">
                    {item.value}
                  </p>
                  <p className="mt-1.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-zinc-500">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: 3-Tab Interactive Guard Console */}
          <div className="animate-hero-in" style={{ animationDelay: "160ms" }}>
            <ConsolePanel />
          </div>
        </div>
      </div>
    </section>
  );
}

function ConsolePanel() {
  const { config } = useSiteConfig();
  const prefix = config.prefix || site.prefix;
  const [tab, setTab] = useState<"stream" | "terminal" | "shields">("stream");

  // Feed tab state
  const [entries, setEntries] = useState<LogEntry[]>(defaultLogs);
  const [isLive, setIsLive] = useState(false);
  const [step, setStep] = useState(5);
  const [simulating, setSimulating] = useState(false);
  const [simLogs, setSimLogs] = useState<LogEntry[]>([]);
  const simTimers = useRef<number[]>([]);

  // Terminal tab state
  const [termInput, setTermInput] = useState("");
  const [termHistory, setTermHistory] = useState<
    { cmd: string; out: string; ok: boolean }[]
  >([
    {
      cmd: `${site.prefix}antinuke enable`,
      out: "Armed 14 Anti-Nuke guards · punishment: BAN · auto-rollback: ACTIVE",
      ok: true,
    },
    {
      cmd: `${site.prefix}voicemaster setup`,
      out: "Created VoiceMaster category, ➕ Join to Create hub & button control deck",
      ok: true,
    },
  ]);

  // Shield matrix tab state
  const [shields, setShields] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(INITIAL_SHIELDS.map((s) => [s.key, s.on])),
  );

  useEffect(() => {
    return () => {
      simTimers.current.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/logs?limit=12", { cache: "no-store" });
        if (!res.ok || !active) return;
        const data = (await res.json()) as {
          live?: boolean;
          logs?: LogEntry[];
        };
        if (
          active &&
          data.live &&
          Array.isArray(data.logs) &&
          data.logs.length > 0
        ) {
          setEntries(data.logs);
          setIsLive(true);
        }
      } catch {
        // Keep default preview stream when offline
      }
    };
    void load();
    const poll = window.setInterval(() => void load(), 12000);
    return () => {
      active = false;
      window.clearInterval(poll);
    };
  }, []);

  useEffect(() => {
    if (isLive || simulating || tab !== "stream") return;
    const id = window.setInterval(() => {
      setStep((s) =>
        s + 1 > entries.length ? Math.min(4, entries.length) : s + 1,
      );
    }, 2400);
    return () => window.clearInterval(id);
  }, [isLive, simulating, entries.length, tab]);

  const runSimulation = useCallback(() => {
    if (simulating) return;
    setTab("stream");
    setSimulating(true);
    setSimLogs([{ ...SIMULATED_RAID[0], id: `sim-0-${Date.now()}` }]);
    simTimers.current.forEach((t) => window.clearTimeout(t));
    simTimers.current = [];

    SIMULATED_RAID.slice(1).forEach((entry, idx) => {
      const id = window.setTimeout(
        () => {
          setSimLogs((prev) => [
            ...prev,
            { ...entry, id: `sim-${Date.now()}-${idx}` },
          ]);
        },
        (idx + 1) * 520,
      );
      simTimers.current.push(id);
    });

    const endId = window.setTimeout(() => {
      setSimulating(false);
    }, SIMULATED_RAID.length * 520 + 3400);
    simTimers.current.push(endId);
  }, [simulating]);

  const executeTerminalCmd = (raw: string) => {
    const cleaned = raw.trim();
    if (!cleaned) return;
    const withoutPrefix = cleaned.replace(/^[.!/&?$]+/, "").trim().toLowerCase();
    const displayCmd = cleaned.startsWith(prefix) ? cleaned : `${prefix}${withoutPrefix}`;

    if (withoutPrefix === "clear") {
      setTermHistory([]);
      setTermInput("");
      return;
    }
    if (withoutPrefix === "help") {
      setTermHistory((h) => [
        ...h.slice(-3),
        {
          cmd: displayCmd,
          out: `${BOT_COMMANDS.length} commands ready across 12 modules. Try ${prefix}antinuke, ${prefix}automod, ${prefix}verify, or ${prefix}ticket.`,
          ok: true,
        },
      ]);
      setTermInput("");
      return;
    }

    const match = BOT_COMMANDS.find(
      (c) =>
        c.name.toLowerCase() === withoutPrefix ||
        withoutPrefix.startsWith(c.name.toLowerCase().split(" ")[0]) ||
        c.aliases?.some((a) => a.toLowerCase() === withoutPrefix.split(" ")[0]),
    );

    setTermHistory((h) => [
      ...h.slice(-3),
      match
        ? {
            cmd: displayCmd,
            out: `[${match.category}] ${match.desc} (Requires: ${match.permission})`,
            ok: true,
          }
        : {
            cmd: displayCmd,
            out: `Unknown command. Try ${prefix}help, ${prefix}antinuke enable, ${prefix}automod strict, or ${prefix}ticket setup.`,
            ok: false,
          },
    ]);
    setTermInput("");
  };

  const shieldScore = INITIAL_SHIELDS.reduce(
    (sum, s) => sum + (shields[s.key] ? s.weight : 0),
    0,
  );
  const shieldGrade =
    shieldScore >= 90 ? "S+" : shieldScore >= 75 ? "A" : shieldScore >= 50 ? "B" : "C";

  const visible =
    simLogs.length > 0 && simulating
      ? simLogs
      : isLive
        ? entries.slice(-5)
        : entries.slice(Math.max(0, step - 5), step);

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-8 rounded-[2.4rem] blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgb(var(--brand-600) / 0.28), rgb(var(--brand-800) / 0.1) 56%, transparent 82%)",
        }}
      />

      <SpotlightCard className="overflow-hidden rounded-[26px] border-brand-500/30 shadow-[0_36px_100px_-34px_rgba(0,0,0,0.98),0_0_70px_-30px_rgb(var(--brand-600)/0.55)]">
        <div
          aria-hidden
          className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-brand-500 to-transparent"
        />

        {/* Console Chrome Header */}
        <div className="relative flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.075] bg-black/55 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 sm:flex">
              <span className="size-2.5 rounded-full bg-brand-500 shadow-[0_0_10px_rgb(var(--brand-500))]" />
              <span className="size-2.5 rounded-full bg-white/12" />
              <span className="size-2.5 rounded-full bg-white/12" />
            </span>

            <div className="inline-flex rounded-xl border border-white/[0.08] bg-white/[0.03] p-0.5 font-mono text-[9.5px] uppercase tracking-[0.15em]">
              {(
                [
                  { id: "stream", label: "Guard Feed" },
                  { id: "terminal", label: "Terminal" },
                  { id: "shields", label: "Shields" },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`rounded-lg px-2.5 py-1 transition-all duration-200 ${
                    tab === t.id
                      ? "bg-brand-600/28 text-white shadow-[inset_0_0_0_1px_rgb(var(--brand-500)/0.5)]"
                      : "text-zinc-500 hover:text-zinc-200"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={runSimulation}
            disabled={simulating}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[9.5px] font-semibold uppercase tracking-wider transition-all duration-300 ease-smooth active:scale-95 ${
              simulating
                ? "border-brand-400/65 bg-brand-500/28 text-white shadow-[0_0_20px_-4px_rgb(var(--brand-500))]"
                : "border-brand-500/40 bg-brand-500/14 text-brand-200 hover:border-brand-400/75 hover:bg-brand-500/25 hover:text-white"
            }`}
          >
            <BoltIcon className="size-3 text-brand-400" />
            {simulating ? "Mitigating…" : "Simulate Nuke"}
          </button>
        </div>

        {/* Sub-header status ribbon */}
        <div className="flex items-center justify-between border-b border-white/[0.06] bg-brand-950/20 px-4 py-2 font-mono text-[9.5px] uppercase tracking-[0.16em] text-zinc-400">
          <span>
            {tab === "terminal"
              ? `Interactive command runner · prefix "${prefix}"`
              : tab === "shields"
                ? "Toggle guards to calculate posture score"
                : isLive
                  ? "Connected guild security feed"
                  : simulating
                    ? "Nuke interception sequence"
                    : "Guard engine preview · click Simulate Nuke"}
          </span>
          <span className="font-semibold text-emerald-300">
            {shieldScore}/100 {shieldGrade}
          </span>
        </div>

        {/* Console Body — fixed height for zero layout shift */}
        <div className="relative p-4">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px animate-scan bg-gradient-to-r from-transparent via-brand-500/60 to-transparent" />

          {tab === "stream" && (
            <div className="flex h-[312px] flex-col gap-2 overflow-hidden font-mono text-[11.5px] leading-relaxed [&>*:first-child]:mt-auto">
              {visible.map((l, i) => (
                <div
                  key={l.id ?? `${l.t}-${l.msg}-${i}`}
                  className="animate-log-in flex items-start gap-2.5 rounded-xl border border-white/[0.065] bg-black/60 px-3 py-2.5 transition-colors duration-200 hover:border-brand-500/35"
                >
                  <span
                    className={`mt-0.5 shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-semibold tracking-wider ${
                      l.ok
                        ? "border border-emerald-500/30 bg-emerald-500/12 text-emerald-300"
                        : "border border-brand-500/45 bg-brand-600/25 text-brand-200"
                    }`}
                  >
                    {l.t}
                  </span>
                  <span className="text-zinc-200">{l.msg}</span>
                </div>
              ))}
            </div>
          )}

          {tab === "terminal" && (
            <div className="flex h-[312px] flex-col justify-between">
              <div className="space-y-2.5 overflow-y-auto pr-1 font-mono text-[11.5px]">
                {termHistory.map((item, idx) => (
                  <div
                    key={`${item.cmd}-${idx}`}
                    className="rounded-xl border border-white/[0.065] bg-black/60 p-3"
                  >
                    <p className="text-brand-300">
                      <span className="text-zinc-500">$ </span>
                      {item.cmd}
                    </p>
                    <p
                      className={`mt-1 leading-snug ${
                        item.ok ? "text-zinc-200" : "text-amber-300"
                      }`}
                    >
                      {item.out}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-3 space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {["automod strict", "verify setup", "ticket setup", "nightmode", "gstart"].map(
                    (chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => executeTerminalCmd(`${prefix}${chip}`)}
                        className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 font-mono text-[9.5px] text-zinc-400 transition hover:border-brand-500/40 hover:text-brand-200"
                      >
                        {prefix}
                        {chip}
                      </button>
                    ),
                  )}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    executeTerminalCmd(termInput);
                  }}
                  className="flex items-center gap-2 rounded-xl border border-brand-500/35 bg-black/80 px-3 py-2"
                >
                  <TerminalIcon className="size-3.5 shrink-0 text-brand-400" />
                  <input
                    type="text"
                    value={termInput}
                    onChange={(e) => setTermInput(e.target.value)}
                    placeholder={`Type a command (e.g. ${prefix}lockdown, ${prefix}help)…`}
                    className="flex-1 bg-transparent font-mono text-[12px] text-white placeholder:text-zinc-600 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-md bg-brand-600/30 px-2.5 py-1 font-mono text-[9.5px] uppercase text-brand-200 hover:bg-brand-600/50 hover:text-white"
                  >
                    Run
                  </button>
                </form>
              </div>
            </div>
          )}

          {tab === "shields" && (
            <div className="flex h-[312px] flex-col justify-between">
              <div className="space-y-1.5 overflow-y-auto pr-0.5">
                {INITIAL_SHIELDS.map((s) => {
                  const active = Boolean(shields[s.key]);
                  return (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() =>
                        setShields((prev) => ({ ...prev, [s.key]: !prev[s.key] }))
                      }
                      className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left transition-all ${
                        active
                          ? "border-brand-500/35 bg-brand-950/35 text-white"
                          : "border-white/[0.06] bg-black/45 text-zinc-400 hover:border-white/[0.14]"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-medium">
                          {s.label}
                        </p>
                        <p className="truncate font-mono text-[9.5px] text-zinc-500">
                          {s.sub}
                        </p>
                      </div>
                      <span
                        className={`inline-flex size-5 shrink-0 items-center justify-center rounded-md border transition ${
                          active
                            ? "border-emerald-400/50 bg-emerald-500/20 text-emerald-300"
                            : "border-white/15 bg-black/40 text-transparent"
                        }`}
                      >
                        <CheckIcon className="size-3" />
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                <div
                  style={{ width: `${shieldScore}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-brand-600 via-brand-400 to-emerald-400 transition-all duration-300"
                />
              </div>
            </div>
          )}

          {/* Console Footer */}
          <div className="mt-3 flex items-center justify-between border-t border-white/[0.065] pt-3 font-mono text-[10px] text-zinc-500">
            <span>
              prefix <span className="text-brand-400">{prefix}</span> · slash{" "}
              <span className="text-zinc-300">/antinuke</span>
            </span>
            <Link
              href="/dashboard/demo"
              className="inline-flex items-center gap-1.5 text-brand-300 transition hover:text-white"
            >
              <ShieldIcon className="size-3" />
              Open Full Control Plane →
            </Link>
          </div>
        </div>
      </SpotlightCard>
    </div>
  );
}
