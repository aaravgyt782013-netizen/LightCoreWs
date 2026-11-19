"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BOT_COMMANDS, formatCommand } from "@/lib/commands";
import { sanitizeDiscordInviteUrl } from "@/lib/discord-oauth";
import { site } from "@/lib/site";
import { useSiteConfig } from "@/components/site/SiteConfigProvider";
import {
  ArrowRight,
  CheckIcon,
  CopyIcon,
  ExternalIcon,
  SearchIcon,
  TerminalIcon,
} from "@/components/ui/Icons";

type PaletteItem = {
  id: string;
  group: "Quick Actions" | "Bot Commands";
  title: string;
  subtitle: string;
  badge?: string;
  kind: "route" | "external" | "command";
  href?: string;
  copyText?: string;
};

export function openCommandPalette() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("lightcore:open-palette"));
}

export function CommandPalette() {
  const router = useRouter();
  const { config } = useSiteConfig();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const prefix = config.prefix || site.prefix;
  const inviteUrl = sanitizeDiscordInviteUrl(
    config.inviteUrl || site.invite,
    site.clientId,
  );
  const supportUrl = config.supportUrl || site.discord;

  const allItems = useMemo<PaletteItem[]>(() => {
    const actions: PaletteItem[] = [
      {
        id: "nav-demo",
        group: "Quick Actions",
        title: "Launch Interactive Demo Dashboard",
        subtitle: "Try all 12 LightCore server modules live — no login required",
        badge: "Live Studio",
        kind: "route",
        href: "/dashboard/demo",
      },
      {
        id: "nav-dashboard",
        group: "Quick Actions",
        title: "Open Server Dashboard",
        subtitle: "Configure Anti-Nuke, AutoMod, VoiceMaster, Tickets & Embeds",
        badge: "Page",
        kind: "route",
        href: "/dashboard",
      },
      {
        id: "nav-docs",
        group: "Quick Actions",
        title: "Browse All Commands & Docs",
        subtitle: `${BOT_COMMANDS.length} searchable commands, permissions & setup guide`,
        badge: "Docs",
        kind: "route",
        href: "/docs",
      },
      {
        id: "nav-premium",
        group: "Quick Actions",
        title: "LightCore Premium Plans",
        subtitle: "Compare Plus, Pro & Ultra Pro perks and create order summaries",
        badge: "Premium",
        kind: "route",
        href: "/premium",
      },
      {
        id: "nav-status",
        group: "Quick Actions",
        title: "System Status & Gateway Health",
        subtitle: "Run real-time health & latency diagnostics",
        badge: "Status",
        kind: "route",
        href: "/status",
      },
      {
        id: "nav-security",
        group: "Quick Actions",
        title: "Trust, OAuth2 & Security Center",
        subtitle: "How LightCore handles Discord OAuth2 and protects your data",
        badge: "Trust",
        kind: "route",
        href: "/security",
      },
      {
        id: "nav-admin",
        group: "Quick Actions",
        title: "Owner Control Panel",
        subtitle: "Theme customizer, premium manager & system telemetry",
        badge: "Owner",
        kind: "route",
        href: "/admin",
      },
      {
        id: "ext-invite",
        group: "Quick Actions",
        title: `Invite ${config.brandName || site.name} to Discord`,
        subtitle: "Open official discord.com bot authorization",
        badge: "External",
        kind: "external",
        href: inviteUrl,
      },
      {
        id: "ext-support",
        group: "Quick Actions",
        title: "Join Official Support Server",
        subtitle: "24/7 community support, appeals & Premium activation",
        badge: "Discord",
        kind: "external",
        href: supportUrl,
      },
    ];

    const commands: PaletteItem[] = BOT_COMMANDS.map((cmd) => {
      const full = formatCommand(cmd, prefix);
      const copyText = formatCommand(cmd, prefix, true);
      return {
        id: `cmd-${cmd.name}`,
        group: "Bot Commands",
        title: full,
        subtitle: cmd.desc,
        badge: cmd.tier ? `${cmd.category} · ${cmd.tier}` : cmd.category,
        kind: "command",
        copyText,
      };
    });

    return [...actions, ...commands];
  }, [config.brandName, inviteUrl, prefix, supportUrl]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^[.!/&?]+/, "");
    if (!q) {
      return [
        ...allItems.filter((i) => i.group === "Quick Actions").slice(0, 6),
        ...allItems.filter((i) => i.group === "Bot Commands").slice(0, 8),
      ];
    }
    return allItems
      .filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.subtitle.toLowerCase().includes(q) ||
          (i.badge && i.badge.toLowerCase().includes(q)),
      )
      .slice(0, 24);
  }, [allItems, query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIdx(0);
  }, []);

  const triggerItem = useCallback(
    async (item: PaletteItem) => {
      if (item.kind === "route" && item.href) {
        close();
        router.push(item.href);
        return;
      }
      if (item.kind === "external" && item.href) {
        close();
        window.open(item.href, "_blank", "noopener,noreferrer");
        return;
      }
      if (item.kind === "command" && item.copyText) {
        try {
          await navigator.clipboard.writeText(item.copyText);
          setCopiedId(item.id);
          window.setTimeout(() => {
            setCopiedId((cur) => (cur === item.id ? null : cur));
          }, 1600);
        } catch {
          // Ignore clipboard errors
        }
      }
    },
    [close, router],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    const onCustomOpen = () => setOpen(true);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("lightcore:open-palette", onCustomOpen);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("lightcore:open-palette", onCustomOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => inputRef.current?.focus(), 20);
    return () => {
      document.body.style.overflow = prev;
      window.clearTimeout(t);
    };
  }, [open]);

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Quick search and command palette"
      onClick={close}
      className="fixed inset-0 z-[135] flex items-start justify-center bg-black/80 px-3 pt-[10vh] backdrop-blur-md sm:px-6 sm:pt-[13vh]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            close();
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIdx((i) => (filtered.length ? (i + 1) % filtered.length : 0));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIdx((i) =>
              filtered.length ? (i - 1 + filtered.length) % filtered.length : 0,
            );
          } else if (e.key === "Enter" && filtered[activeIdx]) {
            e.preventDefault();
            void triggerItem(filtered[activeIdx]);
          }
        }}
        className="animate-pop-in relative w-full max-w-2xl overflow-hidden rounded-3xl border border-brand-500/35 bg-ink-900/98 shadow-[0_36px_110px_-20px_rgba(0,0,0,0.98),0_0_70px_-24px_rgb(var(--brand-600)/0.55)] backdrop-blur-2xl"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-10 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-brand-500 to-transparent"
        />

        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-white/[0.08] px-4 py-3.5 sm:px-5">
          <SearchIcon className="size-[18px] shrink-0 text-brand-400" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${BOT_COMMANDS.length}+ commands (e.g. ${prefix}antinuke, voicemaster) or jump to page…`}
            className="h-7 flex-1 bg-transparent text-[14px] text-white placeholder:text-zinc-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={close}
            className="rounded-lg border border-white/10 bg-ink-950/80 px-2 py-1 font-mono text-[9.5px] uppercase tracking-wider text-zinc-400 hover:text-white"
          >
            ESC
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[58vh] overflow-y-auto overscroll-contain p-2 sm:p-2.5">
          {filtered.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-[13.5px] font-medium text-zinc-300">
                No matching commands or pages
              </p>
              <p className="mt-1 font-mono text-[11px] text-zinc-500">
                Try searching &ldquo;antinuke&rdquo;, &ldquo;ticket&rdquo;, &ldquo;voicemaster&rdquo;, or &ldquo;demo&rdquo;.
              </p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {filtered.map((item, idx) => {
                const selected = idx === activeIdx;
                const copied = copiedId === item.id;
                const showGroup =
                  idx === 0 || filtered[idx - 1].group !== item.group;
                return (
                  <div key={item.id}>
                    {showGroup && (
                      <p className="px-3 pb-1.5 pt-2.5 font-mono text-[9px] uppercase tracking-[0.24em] text-zinc-500">
                        {item.group}
                      </p>
                    )}
                    <button
                      type="button"
                      onMouseEnter={() => setActiveIdx(idx)}
                      onClick={() => void triggerItem(item)}
                      className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                        selected
                          ? "border border-brand-500/35 bg-brand-600/[0.15] text-white"
                          : "border border-transparent text-zinc-300 hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <span
                          className={`flex size-8 shrink-0 items-center justify-center rounded-lg border ${
                            selected
                              ? "border-brand-500/40 bg-brand-950/70 text-brand-300"
                              : "border-white/[0.08] bg-ink-950/70 text-zinc-500"
                          }`}
                        >
                          {item.kind === "command" ? (
                            <TerminalIcon className="size-4" />
                          ) : item.kind === "external" ? (
                            <ExternalIcon className="size-3.5" />
                          ) : (
                            <ArrowRight className="size-3.5" />
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`truncate text-[13px] font-medium ${
                              item.kind === "command"
                                ? "font-mono text-brand-200"
                                : "text-white"
                            }`}
                          >
                            {item.title}
                          </p>
                          <p className="truncate text-[11.5px] text-zinc-500">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        {copied ? (
                          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/35 bg-emerald-500/15 px-2 py-0.5 font-mono text-[9.5px] uppercase text-emerald-300">
                            <CheckIcon className="size-3" />
                            Copied
                          </span>
                        ) : (
                          <>
                            {item.badge && (
                              <span className="hidden rounded-md border border-white/[0.08] bg-ink-950/80 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-zinc-400 sm:inline-block">
                                {item.badge}
                              </span>
                            )}
                            {item.kind === "command" && selected && (
                              <CopyIcon className="size-3.5 text-brand-300" />
                            )}
                          </>
                        )}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.07] bg-ink-950/80 px-4 py-2.5 font-mono text-[9.5px] text-zinc-500">
          <span className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Open / Copy Command</span>
          </span>
          <span>
            Prefix <strong className="text-brand-400">{prefix}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
