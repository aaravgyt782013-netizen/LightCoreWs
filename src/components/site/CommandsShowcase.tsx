"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSiteConfig } from "@/components/site/SiteConfigProvider";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { Reveal } from "@/components/ui/Reveal";
import {
  ArrowRight,
  BoltIcon,
  CheckIcon,
  CopyIcon,
  GiftIcon,
  LockIcon,
  SearchIcon,
  ShieldIcon,
  SlidersIcon,
  TicketIcon,
  VoiceIcon,
} from "@/components/ui/Icons";
import { site } from "@/lib/site";

type CategoryId =
  | "all"
  | "security"
  | "automod"
  | "voicemaster"
  | "tickets"
  | "moderation"
  | "utility";

type FeaturedCommand = {
  cmd: string;
  args?: string;
  category: CategoryId;
  desc: string;
  perm: string;
  syntax: string;
};

const FEATURED_COMMANDS: FeaturedCommand[] = [
  {
    cmd: "antinuke enable",
    args: "",
    category: "security",
    desc: "Arms all 14 rate-gates, rogue bot quarantine, and auto-rollback in one command.",
    perm: "Server Owner",
    syntax: ".antinuke enable",
  },
  {
    cmd: "antinuke action",
    args: "ban | kick | quarantine",
    category: "security",
    desc: "Sets the automated sanction triggered when a user or bot breaches rate limits.",
    perm: "Server Owner",
    syntax: ".antinuke action [sanction]",
  },
  {
    cmd: "vanityguard",
    args: "on | off",
    category: "security",
    desc: "Prevents unauthorized staff or attackers from stealing or changing your vanity invite URL.",
    perm: "Server Owner",
    syntax: ".vanityguard [on|off]",
  },
  {
    cmd: "whitelist add",
    args: "@user/role [scope]",
    category: "security",
    desc: "Grants granular exemption from specific security gates (Bans, Channels, Roles, or All).",
    perm: "Server Owner",
    syntax: ".whitelist add @user [scope]",
  },
  {
    cmd: "automod enable",
    args: "",
    category: "automod",
    desc: "Activates the 8-layer chat firewall against spam, scam phishing links, and invites.",
    perm: "Administrator",
    syntax: ".automod enable",
  },
  {
    cmd: "automod punishment",
    args: "warn | mute | kick | ban",
    category: "automod",
    desc: "Chooses the instant enforcement action applied to chat rule violators.",
    perm: "Administrator",
    syntax: ".automod punishment [action]",
  },
  {
    cmd: "voice setup",
    args: "",
    category: "voicemaster",
    desc: "Deploys the Join-to-Create voice category, starter hub, and interactive panel.",
    perm: "Administrator",
    syntax: ".voice setup",
  },
  {
    cmd: "voice lock",
    args: "",
    category: "voicemaster",
    desc: "Locks your current temporary voice lounge so no outside members can enter.",
    perm: "Channel Owner",
    syntax: ".voice lock",
  },
  {
    cmd: "voice bitrate",
    args: "64-384",
    category: "voicemaster",
    desc: "Customizes the audio bitrate for studio voice clarity or low-bandwidth.",
    perm: "Channel Owner",
    syntax: ".voice bitrate [kbps]",
  },
  {
    cmd: "ticket setup",
    args: "",
    category: "tickets",
    desc: "Generates custom threaded ticket panels with multi-category buttons and logs.",
    perm: "Administrator",
    syntax: ".ticket setup",
  },
  {
    cmd: "ticket close",
    args: "[reason]",
    category: "tickets",
    desc: "Closes the ticket, archives the HTML transcript, and messages the customer.",
    perm: "Staff / Opener",
    syntax: ".ticket close [reason]",
  },
  {
    cmd: "ban",
    args: "@user [duration] [reason]",
    category: "moderation",
    desc: "Bans a malicious member with optional auto-unban timer and DM reason embed.",
    perm: "Ban Members",
    syntax: ".ban @user [time] [reason]",
  },
  {
    cmd: "mute",
    args: "@user [duration] [reason]",
    category: "moderation",
    desc: "Applies Discord timeout or custom muted role to quiet unruly chat members.",
    perm: "Moderate Members",
    syntax: ".mute @user [time] [reason]",
  },
  {
    cmd: "purge",
    args: "[amount] [@user]",
    category: "moderation",
    desc: "Cleans up to 100 messages instantly with optional user and bot filters.",
    perm: "Manage Messages",
    syntax: ".purge [count] [@user]",
  },
  {
    cmd: "embed create",
    args: "#channel",
    category: "utility",
    desc: "Launches the interactive embed builder for rules, announcements, and info cards.",
    perm: "Manage Messages",
    syntax: ".embed create [#channel]",
  },
  {
    cmd: "backup create",
    args: "",
    category: "utility",
    desc: "Generates a full portable JSON snapshot of roles, channels, and permissions.",
    perm: "Server Owner",
    syntax: ".backup create",
  },
];

const CATEGORIES: { id: CategoryId; label: string; icon: typeof ShieldIcon }[] =
  [
    { id: "all", label: "All Commands", icon: BoltIcon },
    { id: "security", label: "Anti-Nuke & Security", icon: ShieldIcon },
    { id: "automod", label: "AutoMod Firewall", icon: LockIcon },
    { id: "voicemaster", label: "VoiceMaster", icon: VoiceIcon },
    { id: "tickets", label: "Tickets Desk", icon: TicketIcon },
    { id: "moderation", label: "Moderation", icon: SlidersIcon },
    { id: "utility", label: "Utility & Embeds", icon: GiftIcon },
  ];

export function CommandsShowcase() {
  const { config } = useSiteConfig();
  const prefix = config.prefix || site.prefix;
  const [activeCategory, setActiveCategory] = useState<CategoryId>("all");
  const [search, setSearch] = useState("");
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return FEATURED_COMMANDS.filter((item) => {
      if (activeCategory !== "all" && item.category !== activeCategory) {
        return false;
      }
      if (!q) return true;
      return (
        item.cmd.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q) ||
        item.perm.toLowerCase().includes(q)
      );
    });
  }, [activeCategory, search]);

  const handleCopy = async (cmdText: string) => {
    const full = `${prefix}${cmdText}`;
    try {
      await navigator.clipboard.writeText(full);
      setCopiedCmd(cmdText);
      window.setTimeout(() => setCopiedCmd(null), 1600);
    } catch {
      // ignore
    }
  };

  return (
    <section id="commands" className="relative py-24 sm:py-32">
      <div className="container-x">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">Interactive Command Engine</p>
          <h2 className="mt-5 font-display text-[32px] font-bold leading-[1.08] tracking-[-0.02em] text-white sm:text-[46px]">
            Fast, intuitive syntax.{" "}
            <span className="text-gradient-brand">Zero guesswork.</span>
          </h2>
          <p className="mt-4 text-balance text-[15.5px] leading-relaxed text-zinc-400">
            LightCore features over 68 enterprise-grade commands supporting both
            classic prefix <code className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-brand-300">{prefix}</code>{" "}
            and modern slash commands with instant autocomplete.
          </p>
        </Reveal>

        {/* Filter Rails & Search Bar */}
        <Reveal delay={80} className="mt-10 space-y-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            {/* Category Pills */}
            <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
              {CATEGORIES.map((cat) => {
                const active = cat.id === activeCategory;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-[12.5px] font-medium transition-all duration-300 ease-smooth active:scale-[0.98] ${
                      active
                        ? "border-brand-400/50 bg-brand-400/[0.16] text-brand-100 shadow-[0_0_20px_-8px_rgb(var(--brand-400)/0.5)]"
                        : "border-white/[0.07] bg-ink-900/60 text-zinc-400 hover:border-white/[0.14] hover:text-white"
                    }`}
                  >
                    <Icon className="size-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Search */}
            <div className="relative shrink-0 sm:w-64">
              <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search commands…"
                className="h-10 w-full rounded-full border border-white/[0.08] bg-ink-950/80 pl-9 pr-4 text-[13px] text-zinc-100 placeholder:text-zinc-500 focus:border-brand-400/50 focus:outline-none"
              />
            </div>
          </div>
        </Reveal>

        {/* Commands Grid */}
        <div className="mt-8 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item, idx) => {
            const isCopied = copiedCmd === item.cmd;
            const fullCmd = `${prefix}${item.cmd}`;
            return (
              <Reveal key={item.cmd} delay={idx * 30}>
                <SpotlightCard className="group flex h-full flex-col justify-between rounded-[24px] p-4 sm:p-5 transition-transform duration-300 hover:-translate-y-1">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[13px] font-semibold text-brand-300">
                        {fullCmd}
                      </span>
                      <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-zinc-400">
                        {item.perm}
                      </span>
                    </div>

                    <p className="mt-2 text-[12.5px] leading-relaxed text-zinc-300">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/[0.06] pt-3">
                    <span className="truncate font-mono text-[10.5px] text-zinc-500">
                      {prefix}{item.cmd} {item.args}
                    </span>
                    <button
                      type="button"
                      onClick={() => void handleCopy(item.cmd)}
                      title="Copy command"
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-zinc-300 transition-all hover:border-brand-400/40 hover:bg-brand-400/10 hover:text-white"
                    >
                      {isCopied ? (
                        <>
                          <CheckIcon className="size-3 text-emerald-400" />
                          <span className="text-emerald-300">Copied</span>
                        </>
                      ) : (
                        <>
                          <CopyIcon className="size-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </SpotlightCard>
              </Reveal>
            );
          })}
        </div>

        {/* Footer Link to /docs */}
        <Reveal delay={120} className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/docs"
            className="btn-soft group inline-flex h-11 items-center gap-2 px-6 text-[13.5px] font-semibold hover:-translate-y-0.5 active:scale-[0.985]"
          >
            <span>Browse Complete Documentation (68+ Commands)</span>
            <ArrowRight className="size-4 text-brand-300 transition-transform duration-300 ease-smooth group-hover:translate-x-0.5" />
          </Link>
          <Link
            href={site.dashboard}
            className="btn-primary btn-glow relative inline-flex h-11 items-center gap-2 overflow-hidden rounded-full px-6 text-[13.5px] font-semibold hover:-translate-y-0.5 active:scale-[0.985]"
          >
            <span className="relative z-10">Configure in Dashboard</span>
            <ArrowRight className="relative z-10 size-3.5" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
