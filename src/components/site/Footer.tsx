"use client";

import Link from "next/link";
import { Logo, Wordmark } from "@/components/ui/Logo";
import { DiscordIcon, SearchIcon, ShieldIcon } from "@/components/ui/Icons";
import { openCommandPalette } from "@/components/ui/CommandPalette";
import { useSiteConfig } from "@/components/site/SiteConfigProvider";
import { sanitizeDiscordInviteUrl } from "@/lib/discord-oauth";
import { DEFAULT_TAGLINE, site } from "@/lib/site";

export function Footer() {
  const { config } = useSiteConfig();
  const statusText = config.footerStatusText || "View service status";

  return (
    <footer className="relative border-t border-white/[0.06] bg-ink-950/95">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-400/35 to-transparent"
      />
      <div className="container-x py-16">
        <div className="grid gap-10 md:grid-cols-[1.65fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="group inline-flex items-center gap-3">
              <Logo size={36} />
              <span className="font-display text-[15.5px] font-bold tracking-[0.15em] text-white">
                <Wordmark />
              </span>
            </Link>
            <p className="mt-3 text-[13px] font-medium text-brand-200">
              {config.tagline || DEFAULT_TAGLINE}
            </p>
            <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-zinc-400">
              Effortless Discord protection, moderation, VoiceMaster rooms,
              tickets, and community tools under prefix{" "}
              <code className="rounded-md bg-white/[0.06] px-1.5 py-0.5 font-mono text-[11.5px] text-brand-300">
                {config.prefix || site.prefix}
              </code>{" "}
              and slash commands.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <a
                href={config.supportUrl || site.discord}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-soft inline-flex h-9 items-center gap-2 px-4 text-[12px] font-medium hover:-translate-y-0.5"
              >
                <DiscordIcon className="size-4 text-brand-300" />
                Support Server
              </a>
              <button
                type="button"
                onClick={openCommandPalette}
                className="inline-flex h-9 items-center gap-2 rounded-full border border-white/[0.075] bg-white/[0.025] px-3.5 text-[12px] text-zinc-400 transition-all duration-300 ease-smooth hover:border-brand-400/30 hover:text-white"
              >
                <SearchIcon className="size-3.5 text-brand-300" />
                <span>Commands</span>
                <kbd className="font-mono text-[10px] text-zinc-500">⌘K</kbd>
              </button>
            </div>
          </div>

          <FooterCol
            title="Product"
            links={[
              { label: "Features", href: "/#features" },
              { label: "Dashboard Preview", href: "/#showcase" },
              { label: "VoiceMaster", href: "/#voicemaster" },
              { label: "Commands", href: "/docs" },
              { label: "Premium Plans", href: site.premium },
              { label: "FAQ", href: "/#faq" },
            ]}
          />
          <FooterCol
            title="Dashboard"
            links={[
              { label: "My Servers", href: "/dashboard" },
              { label: "Try Live Demo", href: "/dashboard/demo" },
              { label: "System Status", href: "/status" },
              { label: "Owner Studio", href: site.admin },
              {
                label: "Invite LightCore",
                href: sanitizeDiscordInviteUrl(
                  config.inviteUrl || site.invite,
                  site.clientId,
                ),
                external: true,
              },
              {
                label: "Support Server",
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

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-6 sm:flex-row">
          <div className="flex flex-col items-center gap-1 text-center sm:items-start sm:text-left">
            <p className="text-[12px] text-zinc-400">
              © {new Date().getFullYear()}{" "}
              {config.footerCopyright || config.brandName}. Independent Discord
              bot &amp; dashboard — not affiliated with Discord Inc.
            </p>
            <p className="inline-flex items-center gap-1.5 text-[11.5px] text-zinc-500">
              <ShieldIcon className="size-3.5 text-emerald-400/80" />
              Read-only Discord OAuth 2.0 (identify · guilds) · Zero auto-join
            </p>
          </div>

          <Link
            href="/status"
            className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-1.5 text-[11.5px] font-medium text-emerald-300 transition-all duration-300 ease-smooth hover:border-emerald-400/35 hover:text-emerald-200"
          >
            <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.85)]" />
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
      <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
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
                className="text-[13.5px] text-zinc-400 transition-colors duration-200 hover:text-brand-100"
              >
                {l.label} ↗
              </a>
            ) : (
              <Link
                href={l.href}
                className="text-[13.5px] text-zinc-400 transition-colors duration-200 hover:text-brand-100"
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
