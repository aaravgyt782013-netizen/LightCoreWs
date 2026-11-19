"use client";

import Link from "next/link";
import { Logo, Wordmark } from "@/components/ui/Logo";
import { DiscordIcon, SearchIcon, ShieldIcon } from "@/components/ui/Icons";
import { openCommandPalette } from "@/components/ui/CommandPalette";
import { useSiteConfig } from "@/components/site/SiteConfigProvider";
import { sanitizeDiscordInviteUrl } from "@/lib/discord-oauth";
import { site } from "@/lib/site";

export function Footer() {
  const { config } = useSiteConfig();
  const statusText = config.footerStatusText || "All systems operational";

  return (
    <footer className="relative border-t border-white/[0.075] bg-ink-950/95">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent"
      />
      <div className="container-x py-16">
        <div className="grid gap-10 md:grid-cols-[1.65fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <Logo size={34} />
              <span className="font-display text-[15.5px] font-semibold tracking-[0.18em] text-white">
                <Wordmark />
              </span>
            </Link>
            <p className="mt-3 font-mono text-[9.5px] uppercase tracking-[0.22em] text-brand-400/90">
              {config.tagline}
            </p>
            <p className="mt-2.5 max-w-xs text-[13px] leading-relaxed text-zinc-400">
              {config.description} Sub-second Anti-Nuke, AutoMod, VoiceMaster,
              Tickets, Verification, and Embed Studio under prefix{" "}
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[11.5px] text-brand-300">
                {config.prefix || site.prefix}
              </code>
              .
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <a
                href={config.supportUrl || site.discord}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-950/40 px-4 py-2 text-[12px] font-medium text-zinc-100 transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-brand-400/60 hover:bg-brand-900/45 hover:text-white"
              >
                <DiscordIcon className="size-4 text-brand-400" />
                Support Server
              </a>
              <button
                type="button"
                onClick={openCommandPalette}
                className="inline-flex items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.025] px-3.5 py-2 text-[12px] text-zinc-400 transition hover:border-brand-500/35 hover:text-white"
              >
                <SearchIcon className="size-3.5 text-brand-400" />
                <span>Commands</span>
                <kbd className="font-mono text-[10px] text-zinc-500">⌘K</kbd>
              </button>
            </div>
          </div>

          <FooterCol
            title="Product"
            links={[
              { label: "Security Suite", href: "/#features" },
              { label: "Dashboard Studio", href: "/#showcase" },
              { label: "VoiceMaster", href: "/#voicemaster" },
              { label: "Commands & Docs", href: "/docs" },
              { label: "Premium Plans", href: site.premium },
              { label: "FAQ", href: "/#faq" },
            ]}
          />
          <FooterCol
            title="Control Plane"
            links={[
              { label: "Server Dashboard", href: "/dashboard" },
              { label: "Interactive Demo", href: "/dashboard/demo" },
              { label: "System Status", href: "/status" },
              { label: "Owner Panel", href: site.admin },
              {
                label: "Invite LightCore",
                href: sanitizeDiscordInviteUrl(
                  config.inviteUrl || site.invite,
                  site.clientId,
                ),
                external: true,
              },
              {
                label: "Discord Community",
                href: config.supportUrl || site.discord,
                external: true,
              },
            ]}
          />
          <FooterCol
            title="Trust & Legal"
            links={[
              { label: "Security & OAuth2", href: "/security" },
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Terms of Service", href: "/terms" },
              { label: "security.txt", href: "/.well-known/security.txt" },
            ]}
          />
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.07] pt-6 sm:flex-row">
          <div className="flex flex-col items-center gap-1 text-center sm:items-start sm:text-left">
            <p className="font-mono text-[10.5px] tracking-wide text-zinc-400">
              © {new Date().getFullYear()}{" "}
              {config.footerCopyright || config.brandName}. Independent Discord
              bot &amp; dashboard — not affiliated with Discord Inc.
            </p>
            <p className="inline-flex items-center gap-1.5 font-mono text-[10px] text-zinc-600">
              <ShieldIcon className="size-3 text-emerald-400/80" />
              Read-only Discord OAuth 2.0 (identify · guilds) · No auto-join or data forms
            </p>
          </div>

          <Link
            href="/status"
            className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-300 transition-colors hover:border-emerald-400/40 hover:text-emerald-200"
          >
            <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
            {statusText}
          </Link>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string; external?: boolean }[];
}) {
  return (
    <div>
      <p className="font-mono text-[9.5px] uppercase tracking-[0.26em] text-zinc-500">
        {title}
      </p>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            {l.external || l.href.startsWith("http") ? (
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-zinc-400 transition-colors hover:text-white"
              >
                {l.label} ↗
              </a>
            ) : (
              <Link
                href={l.href}
                className="text-[13px] text-zinc-400 transition-colors hover:text-white"
              >
                {l.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
