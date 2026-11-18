"use client";

import { useMemo, useState } from "react";
import { features, site } from "@/lib/site";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { useSiteConfig } from "@/components/site/SiteConfigProvider";
import { CheckIcon, CopyIcon, SearchIcon, featureIcons } from "@/components/ui/Icons";

type CommandDoc = {
  cmd: string;
  desc: string;
  category: "Anti-Nuke" | "Moderation" | "VoiceMaster" | "Tickets" | "Utility";
};

const COMMANDS: CommandDoc[] = [
  { cmd: "antinuke enable", desc: "Arm all 26 guard gates and state snapshots", category: "Anti-Nuke" },
  { cmd: "antinuke status", desc: "Inspect active gates, latency, and whitelist health", category: "Anti-Nuke" },
  { cmd: "whitelist add @user", desc: "Grant trusted anti-nuke bypass to an admin", category: "Anti-Nuke" },
  { cmd: "whitelist list", desc: "Audit every whitelisted member and scoped permission", category: "Anti-Nuke" },
  { cmd: "limits ban 3", desc: "Set maximum bans allowed per actor per 60s window", category: "Anti-Nuke" },
  { cmd: "nightmode 00:00 08:00", desc: "Schedule automatic overnight server lockdown", category: "Anti-Nuke" },
  { cmd: "automod strict", desc: "Activate high-precision spam, link & raid firewall", category: "Moderation" },
  { cmd: "purge 50", desc: "Bulk-clean recent messages with full audit trace", category: "Moderation" },
  { cmd: "lock #channel", desc: "Freeze channel messaging instantly during raids", category: "Moderation" },
  { cmd: "voicemaster setup", desc: "Deploy join-to-create hub and live control interface", category: "VoiceMaster" },
  { cmd: "vc lock", desc: "Lock your temporary room from unauthorized joins", category: "VoiceMaster" },
  { cmd: "vc limit 5", desc: "Cap the maximum member slots in your personal room", category: "VoiceMaster" },
  { cmd: "ticket setup", desc: "Launch threaded support panel with HTML transcripts", category: "Tickets" },
  { cmd: "ticket close", desc: "Archive ticket and send transcript to log channel", category: "Tickets" },
  { cmd: "logs setup #channel", desc: "Stream sub-second security and moderation logs", category: "Utility" },
  { cmd: "help", desc: "Open the interactive categorized command menu", category: "Utility" },
];

const CATEGORIES = [
  "All",
  "Anti-Nuke",
  "Moderation",
  "VoiceMaster",
  "Tickets",
  "Utility",
] as const;

export function DocsClient() {
  const { config } = useSiteConfig();
  const prefix = config.prefix || site.prefix;
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("All");
  const [query, setQuery] = useState("");
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COMMANDS.filter((c) => {
      if (cat !== "All" && c.category !== cat) return false;
      if (!q) return true;
      return (
        c.cmd.toLowerCase().includes(q) ||
        c.desc.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
    });
  }, [cat, query]);

  const handleCopy = async (full: string) => {
    try {
      await navigator.clipboard.writeText(full);
      setCopiedCmd(full);
      window.setTimeout(
        () => setCopiedCmd((cur) => (cur === full ? null : cur)),
        1500,
      );
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-8">
      {/* Search + Category Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {CATEGORIES.map((c) => {
            const active = cat === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCat(c)}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] transition-all duration-200 active:scale-95 ${
                  active
                    ? "border-brand-500/60 bg-brand-600/22 text-white shadow-[0_0_24px_-8px_rgb(var(--brand-500))]"
                    : "border-white/[0.08] bg-ink-900/70 text-zinc-400 hover:border-brand-500/35 hover:text-zinc-100"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-72">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search commands (${prefix}antinuke)…`}
            className="input-aqua pl-10"
          />
        </div>
      </div>

      {/* Interactive Command Grid */}
      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((c) => {
          const full = `${prefix}${c.cmd}`;
          const isCopied = copiedCmd === full;
          return (
            <button
              key={c.cmd}
              type="button"
              onClick={() => void handleCopy(full)}
              className="spotlight-card group flex items-start justify-between gap-4 rounded-2xl p-4 text-left transition-all duration-300 ease-smooth hover:-translate-y-0.5 active:scale-[0.99]"
            >
              <div className="relative min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <code className="font-mono text-[13px] font-semibold text-brand-200 group-hover:text-white">
                    {full}
                  </code>
                  <span className="rounded border border-white/[0.07] bg-black/50 px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-wider text-zinc-500">
                    {c.category}
                  </span>
                </div>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-zinc-400">
                  {c.desc}
                </p>
              </div>
              <span className="relative inline-flex shrink-0 items-center gap-1 rounded-lg border border-white/[0.08] bg-black/55 px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-wider text-zinc-400 transition-colors group-hover:border-brand-500/40 group-hover:text-brand-200">
                {isCopied ? (
                  <>
                    <CheckIcon className="size-3 text-emerald-400" />
                    copied
                  </>
                ) : (
                  <CopyIcon className="size-3" />
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Core Architecture Overview */}
      <div className="grid gap-4 pt-2 sm:grid-cols-2 lg:grid-cols-3">
        {features.slice(0, 3).map((f) => {
          const Icon = featureIcons[f.icon];
          return (
            <SpotlightCard key={f.key} className="rounded-2xl p-5">
              <div className="relative flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl border border-brand-500/35 bg-brand-950/55 text-brand-400">
                  <Icon className="size-5" />
                </span>
                <h2 className="font-display text-[16.5px] font-bold text-white">
                  {f.key}
                </h2>
              </div>
              <p className="relative mt-3 text-[12.5px] leading-relaxed text-zinc-400">
                {f.copy}
              </p>
            </SpotlightCard>
          );
        })}
      </div>
    </div>
  );
}
