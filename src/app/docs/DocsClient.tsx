"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BOT_COMMANDS,
  COMMAND_CATEGORIES,
  formatCommand,
  type CommandCategory,
} from "@/lib/commands";
import { site } from "@/lib/site";
import { useSiteConfig } from "@/components/site/SiteConfigProvider";
import {
  ArrowRight,
  CheckIcon,
  CodeIcon,
  CopyIcon,
  SearchIcon,
  ShieldIcon,
  SparklesIcon,
  TerminalIcon,
} from "@/components/ui/Icons";

type DocTab = "commands" | "quickstart" | "predicates" | "variables";

const TEMPLATE_VARIABLES = [
  { token: "{user}", example: "@aarav", desc: "Mentions the joining or triggering member" },
  { token: "{user.name}", example: "aarav", desc: "Member username without mention ping" },
  { token: "{user.tag}", example: "aarav#0001", desc: "Full Discord handle / tag" },
  { token: "{user.id}", example: "984210394810293841", desc: "Member Discord snowflake ID" },
  { token: "{user.avatar}", example: "https://cdn.discordapp.com/...", desc: "Member avatar image URL (for embed thumbnails)" },
  { token: "{user.created}", example: "2 years ago", desc: "Relative Discord account age" },
  { token: "{server}", example: "LightCore HQ", desc: "Server / guild name" },
  { token: "{server.id}", example: "120938475610293847", desc: "Server snowflake ID" },
  { token: "{server.icon}", example: "https://cdn.discordapp.com/...", desc: "Server icon URL for embed author/footer" },
  { token: "{membercount}", example: "14,280", desc: "Formatted total server member count" },
  { token: "{boostcount}", example: "28", desc: "Active Server Boost count" },
  { token: "{channel}", example: "#welcome", desc: "Current target channel mention" },
];

const PREDICATE_EXAMPLES = [
  {
    expr: "ban:3:60s",
    title: "Anti Mass-Ban Gate",
    detail:
      "Allows up to 3 bans within a rolling 60-second window per non-whitelisted actor. On attempt #4, LightCore strips dangerous roles/bans the actor and unbans affected targets.",
  },
  {
    expr: "channel_delete:1:30s",
    title: "Zero-Tolerance Channel Guard",
    detail:
      "Blocks rapid channel deletion immediately on the 2nd attempt inside 30s and rebuilds deleted channels with topic, slowmode, category, and permission overwrites intact.",
  },
  {
    expr: "webhook_create:1:60s",
    title: "Webhook Spammer Shield",
    detail:
      "Revokes rogue webhooks in milliseconds, purges webhook spam bursts, and quarantines the creator before @everyone pings can cascade.",
  },
  {
    expr: "join_burst:10:12s",
    title: "Anti-Raid Join Velocity",
    detail:
      "Triggers automatic slowmode, verification enforcement, or temporary invite pause whenever 10+ accounts join inside a 12-second window.",
  },
  {
    expr: "mention_spam:5:10s",
    title: "AutoMod Mention Firewall",
    detail:
      "Deletes mass-mention messages before push alerts linger and applies a timed mute plus mod-log case entry.",
  },
  {
    expr: "role_grant_admin:0:always",
    title: "Dangerous Permission Escalation",
    detail:
      "Instantly reverts unauthorized Administrator, Manage Guild, Manage Roles, or Manage Webhooks grants by anyone outside the owner whitelist.",
  },
];

export function DocsClient() {
  const { config } = useSiteConfig();
  const [tab, setTab] = useState<DocTab>("commands");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"All" | CommandCategory>("All");
  const [customPrefix, setCustomPrefix] = useState(config.prefix || site.prefix);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    setCustomPrefix(config.prefix || site.prefix);
  }, [config.prefix]);

  const activePrefix = customPrefix.trim() || config.prefix || site.prefix;

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: BOT_COMMANDS.length };
    for (const c of BOT_COMMANDS) {
      counts[c.category] = (counts[c.category] || 0) + 1;
    }
    return counts;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^[.!/&?$]+/, "");
    return BOT_COMMANDS.filter((cmd) => {
      if (category !== "All" && cmd.category !== category) return false;
      if (!q) return true;
      return (
        cmd.name.toLowerCase().includes(q) ||
        cmd.desc.toLowerCase().includes(q) ||
        cmd.category.toLowerCase().includes(q) ||
        (cmd.args && cmd.args.toLowerCase().includes(q)) ||
        (cmd.aliases && cmd.aliases.some((a) => a.toLowerCase().includes(q)))
      );
    });
  }, [category, query]);

  const copyText = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => {
        setCopiedKey((cur) => (cur === key ? null : cur));
      }, 1600);
    } catch {
      // Ignore clipboard failures
    }
  };

  return (
    <div className="space-y-7">
      {/* Top Section Switcher + Prefix Customizer */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-white/[0.08] bg-ink-900/80 p-3 backdrop-blur-xl lg:flex-row lg:items-center">
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { id: "commands", label: `Commands (${BOT_COMMANDS.length})`, icon: TerminalIcon },
              { id: "quickstart", label: "Setup & Hierarchy", icon: ShieldIcon },
              { id: "predicates", label: "Rate Gates", icon: CodeIcon },
              { id: "variables", label: "Embed & Greet Variables", icon: SparklesIcon },
            ] as const
          ).map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-[12.5px] font-medium transition-all ${
                  active
                    ? "border border-brand-500/45 bg-brand-600/20 text-white shadow-[0_0_24px_-8px_rgb(var(--brand-500)/0.65)]"
                    : "border border-transparent text-zinc-400 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                <Icon className="size-3.5 text-brand-400" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Live Prefix Simulator */}
        <div className="flex items-center gap-2.5 rounded-2xl border border-white/[0.08] bg-ink-950/85 px-3.5 py-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            Preview Prefix
          </span>
          <input
            type="text"
            maxLength={5}
            aria-label="Preview command prefix"
            value={customPrefix}
            onChange={(e) => setCustomPrefix(e.target.value)}
            className="h-7 w-14 rounded-lg border border-brand-500/35 bg-brand-950/40 px-2 text-center font-mono text-[13px] font-semibold text-brand-200 focus:border-brand-400 focus:outline-none"
          />
          <div className="hidden items-center gap-1 sm:flex">
            {[".", "!", "?", "&"].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setCustomPrefix(p)}
                className={`size-6 rounded-md font-mono text-[11px] transition ${
                  activePrefix === p
                    ? "bg-brand-500/25 text-brand-200"
                    : "text-zinc-500 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TAB 1: SEARCHABLE 68-COMMAND CATALOG */}
      {tab === "commands" && (
        <div className="space-y-5">
          {/* Search input */}
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-brand-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${BOT_COMMANDS.length} commands by name, alias, module, or action (e.g. antinuke, vm, quarantine, giveaway)…`}
              className="h-12 w-full rounded-2xl border border-white/[0.1] bg-ink-900/90 pl-11 pr-28 text-[13.5px] text-white placeholder:text-zinc-500 transition focus:border-brand-500/60 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[10.5px] text-zinc-500">
              {filtered.length} shown
            </span>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-1.5">
            {COMMAND_CATEGORIES.map((cat) => {
              const active = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  title={cat.summary}
                  onClick={() => setCategory(cat.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-all ${
                    active
                      ? "border-brand-500/50 bg-brand-600/20 text-white"
                      : "border-white/[0.07] bg-ink-900/65 text-zinc-400 hover:border-white/[0.16] hover:text-zinc-200"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`font-mono text-[10px] ${
                      active ? "text-brand-300" : "text-zinc-600"
                    }`}
                  >
                    {categoryCounts[cat.id] || 0}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Command Grid */}
          {filtered.length === 0 ? (
            <div className="panel rounded-3xl p-10 text-center">
              <p className="font-display text-[17px] font-semibold text-white">
                No commands match &ldquo;{query}&rdquo;
              </p>
              <p className="mt-1.5 text-[13px] text-zinc-400">
                Clear the search or reset the category filter to browse all{" "}
                {BOT_COMMANDS.length} commands.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCategory("All");
                }}
                className="mt-4 rounded-xl border border-brand-500/40 bg-brand-950/50 px-4 py-2 text-[12.5px] font-medium text-brand-200 hover:text-white"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {filtered.map((cmd) => {
                const syntax = formatCommand(cmd, activePrefix);
                const copyable = formatCommand(cmd, activePrefix, true);
                const isCopied = copiedKey === cmd.name;
                return (
                  <div
                    key={cmd.name}
                    className="panel group flex flex-col justify-between rounded-2xl p-4 transition-all hover:border-brand-500/35 sm:p-5"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <code className="break-all font-mono text-[13px] font-medium text-brand-200">
                          <span className="text-brand-400">{activePrefix}</span>
                          {cmd.name}
                          {cmd.args && (
                            <span className="text-zinc-500"> {cmd.args}</span>
                          )}
                        </code>

                        <button
                          type="button"
                          onClick={() => void copyText(cmd.name, copyable)}
                          title={`Copy "${syntax}"`}
                          className={`inline-flex shrink-0 items-center gap-1 rounded-lg border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition ${
                            isCopied
                              ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                              : "border-white/[0.08] bg-ink-950/80 text-zinc-400 hover:border-brand-500/40 hover:text-white"
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <CheckIcon className="size-3" />
                              Copied
                            </>
                          ) : (
                            <>
                              <CopyIcon className="size-3" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>

                      <p className="mt-2 text-[12.5px] leading-relaxed text-zinc-400">
                        {cmd.desc}
                      </p>
                    </div>

                    <div className="mt-3.5 flex flex-wrap items-center gap-1.5 border-t border-white/[0.05] pt-3 font-mono text-[9.5px]">
                      <span className="rounded-md border border-white/[0.07] bg-ink-950/75 px-2 py-0.5 uppercase tracking-wider text-zinc-400">
                        {cmd.category}
                      </span>
                      <span className="rounded-md border border-white/[0.07] bg-white/[0.025] px-2 py-0.5 text-zinc-500">
                        Perm: {cmd.permission}
                      </span>
                      {cmd.tier && (
                        <span className="rounded-md border border-amber-500/35 bg-amber-500/10 px-2 py-0.5 uppercase tracking-wider text-amber-300">
                          {cmd.tier}
                        </span>
                      )}
                      {cmd.aliases && cmd.aliases.length > 0 && (
                        <span className="ml-auto text-zinc-500">
                          Aliases:{" "}
                          {cmd.aliases.map((a) => `${activePrefix}${a}`).join(", ")}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SETUP, ROLE HIERARCHY & TROUBLESHOOTING */}
      {tab === "quickstart" && (
        <div className="grid gap-5 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            {[
              {
                step: "01",
                title: "Authorize LightCore & Place Role at the Top",
                cmd: `${activePrefix}antinuke status`,
                body: `Invite ${config.brandName || site.name} via official Discord OAuth2, then open Server Settings → Roles and drag the ${config.brandName || site.name} role strictly above every administrator, moderator, and bot role it must supervise.`,
              },
              {
                step: "02",
                title: "Arm the 26-Module Anti-Nuke Shield",
                cmd: `${activePrefix}antinuke enable`,
                body: "Snapshots channels, roles, webhooks, and vanity URL state, then arms real-time audit-log rate gates across bans, kicks, role escalations, channel deletions, and rogue bot invites.",
              },
              {
                step: "03",
                title: "Whitelist Trusted Head Admins & Deploy Suites",
                cmd: `${activePrefix}whitelist add @user`,
                body: `Grant explicit bypass only to vetted co-owners, then launch VoiceMaster (${activePrefix}voicemaster setup), Tickets (${activePrefix}ticket setup), and AutoMod (${activePrefix}automod enable) — or configure everything visually in the web dashboard.`,
              },
            ].map((s) => (
              <div key={s.step} className="panel rounded-3xl p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[11px] font-semibold tracking-[0.24em] text-brand-400">
                    STEP {s.step}
                  </span>
                  <button
                    type="button"
                    onClick={() => void copyText(`step-${s.step}`, s.cmd)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-brand-500/30 bg-brand-950/50 px-3 py-1 font-mono text-[11.5px] text-brand-200 hover:border-brand-400"
                  >
                    <span>{s.cmd}</span>
                    {copiedKey === `step-${s.step}` ? (
                      <CheckIcon className="size-3 text-emerald-300" />
                    ) : (
                      <CopyIcon className="size-3 text-brand-400" />
                    )}
                  </button>
                </div>
                <h3 className="mt-3 font-display text-[18px] font-semibold text-white">
                  {s.title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-zinc-400">
                  {s.body}
                </p>
              </div>
            ))}
          </div>

          {/* Visual Role Hierarchy Diagram + CTA */}
          <div className="space-y-4 lg:col-span-5">
            <div className="panel rounded-3xl p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                Required Discord Role Order
              </p>
              <div className="mt-4 space-y-2">
                {[
                  { name: "Server Owner (Crown)", tone: "border-amber-500/30 bg-amber-500/[0.08] text-amber-200", tag: "Immune" },
                  { name: `${config.brandName || site.name} (Guard Role)`, tone: "border-brand-500/55 bg-brand-600/20 text-white shadow-[0_0_24px_-8px_rgb(var(--brand-500)/0.6)]", tag: "Place #1" },
                  { name: "Head Administrators", tone: "border-white/[0.08] bg-ink-950/80 text-zinc-300", tag: "Supervised" },
                  { name: "Moderators & Staff", tone: "border-white/[0.08] bg-ink-950/80 text-zinc-300", tag: "Supervised" },
                  { name: "Third-Party Bots", tone: "border-white/[0.08] bg-ink-950/80 text-zinc-400", tag: "Guarded" },
                  { name: "Verified / @everyone", tone: "border-white/[0.06] bg-ink-950/50 text-zinc-500", tag: "Protected" },
                ].map((r) => (
                  <div
                    key={r.name}
                    className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-[12.5px] font-medium ${r.tone}`}
                  >
                    <span>{r.name}</span>
                    <span className="font-mono text-[9.5px] uppercase tracking-wider opacity-80">
                      {r.tag}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[12px] leading-relaxed text-zinc-500">
                Discord enforces strict role hierarchy — placing the guard role
                at the top guarantees Anti-Nuke can instantly strip or
                quarantine compromised admins and rogue bots.
              </p>
            </div>

            <div className="panel rounded-3xl border-brand-500/30 bg-brand-950/25 p-6">
              <h3 className="font-display text-[16px] font-semibold text-white">
                Prefer a Visual Control Plane?
              </h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-400">
                Configure all 12 server modules — including Security Presets, Ticket
                Panels, VoiceMaster, and Embed Studio — directly in the Web Dashboard.
              </p>
              <Link
                href="/dashboard"
                className="btn-primary mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white"
              >
                Open Web Dashboard
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RATE GATES & PREDICATE ENGINE */}
      {tab === "predicates" && (
        <div className="space-y-5">
          <div className="panel rounded-3xl border-brand-500/30 bg-brand-950/20 p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-brand-300">
              Deterministic Rate-Gate Grammar
            </p>
            <p className="mt-2 text-[14px] leading-relaxed text-zinc-300">
              Every Anti-Nuke, Anti-Raid, and AutoMod detector evaluates a
              sliding-window predicate written as{" "}
              <code className="rounded-lg border border-brand-500/35 bg-black/50 px-2 py-0.5 font-mono text-[12.5px] text-brand-200">
                action : threshold : window
              </code>
              . Breaching the threshold immediately triggers sanction (
              <code className="font-mono text-[12px] text-zinc-200">
                strip_roles | quarantine | kick | ban
              </code>
              ) followed by automated audit rollback.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {PREDICATE_EXAMPLES.map((p) => (
              <div key={p.expr} className="panel rounded-2xl p-5">
                <div className="flex items-center justify-between gap-2">
                  <code className="rounded-lg border border-brand-500/35 bg-brand-950/55 px-2.5 py-1 font-mono text-[12px] font-semibold text-brand-200">
                    {p.expr}
                  </code>
                  <button
                    type="button"
                    onClick={() => void copyText(p.expr, p.expr)}
                    className="rounded-lg border border-white/[0.08] bg-ink-950/80 px-2.5 py-1 font-mono text-[10px] text-zinc-400 hover:text-white"
                  >
                    {copiedKey === p.expr ? "Copied ✓" : "Copy"}
                  </button>
                </div>
                <h3 className="mt-3 font-display text-[15.5px] font-semibold text-white">
                  {p.title}
                </h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-zinc-400">
                  {p.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: WELCOME, LEAVE, TICKET & EMBED VARIABLES */}
      {tab === "variables" && (
        <div className="space-y-4">
          <p className="text-[13.5px] text-zinc-400">
            Click any variable token to copy it directly into your Welcome,
            Farewell, Boost, Ticket Panel, Verification, or Custom Embed
            templates.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TEMPLATE_VARIABLES.map((v) => {
              const isCopied = copiedKey === v.token;
              return (
                <button
                  key={v.token}
                  type="button"
                  onClick={() => void copyText(v.token, v.token)}
                  className="panel flex flex-col justify-between rounded-2xl p-4 text-left transition hover:border-brand-500/40"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <code className="rounded-md border border-brand-500/30 bg-brand-950/50 px-2 py-0.5 font-mono text-[12px] font-semibold text-brand-200">
                        {v.token}
                      </code>
                      <span
                        className={`font-mono text-[9.5px] uppercase tracking-wider ${
                          isCopied ? "text-emerald-300" : "text-zinc-500"
                        }`}
                      >
                        {isCopied ? "Copied ✓" : "Click to copy"}
                      </span>
                    </div>
                    <p className="mt-2.5 text-[12.5px] leading-snug text-zinc-300">
                      {v.desc}
                    </p>
                  </div>
                  <p className="mt-3 truncate border-t border-white/[0.06] pt-2 font-mono text-[10.5px] text-zinc-500">
                    e.g. {v.example}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
