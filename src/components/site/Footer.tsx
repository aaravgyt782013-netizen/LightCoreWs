"use client";

import Link from "next/link";
import { Logo, Wordmark } from "@/components/ui/Logo";
import { DiscordIcon } from "@/components/ui/Icons";
import { useSiteConfig } from "@/components/site/SiteConfigProvider";
import { sanitizeDiscordInviteUrl } from "@/lib/discord-oauth";
import { nav, site } from "@/lib/site";

const legal = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Status", href: "/status" },
];

export function Footer() {
  const { config } = useSiteConfig();

  return (
    <footer className="relative border-t border-white/[0.075] bg-ink-950/95">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/45 to-transparent"
      />
      <div className="container-x py-14">
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <Logo size={32} />
              <span className="font-display text-[15px] font-semibold tracking-[0.18em] text-white">
                <Wordmark />
              </span>
            </Link>
            <p className="mt-3 font-mono text-[9.5px] uppercase tracking-[0.2em] text-brand-400/85">
              {config.tagline}
            </p>
            <p className="mt-2.5 max-w-xs text-[13px] leading-relaxed text-zinc-500">
              {config.description}.
            </p>
            <a
              href={config.supportUrl || site.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-950/35 px-4 py-2 text-[12px] font-medium text-zinc-200 transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-brand-400/55 hover:bg-brand-900/40 hover:text-white"
            >
              <DiscordIcon className="size-4 text-brand-400" />
              Join the support server
            </a>
          </div>

          <FooterCol
            title="Product"
            links={nav.map((n) => ({ label: n.label, href: n.href }))}
          />
          <FooterCol
            title="Platform"
            links={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Buy Premium", href: site.premium },
              { label: "Owner panel", href: site.admin },
              {
                label: "Invite bot",
                href: sanitizeDiscordInviteUrl(
                  config.inviteUrl || site.invite,
                  site.clientId,
                ),
                external: true,
              },
              {
                label: "Support server",
                href: config.supportUrl || site.discord,
                external: true,
              },
              { label: "Documentation", href: "/docs" },
            ]}
          />
          <FooterCol title="Legal" links={legal} />
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.07] pt-6 sm:flex-row">
          <p className="text-center font-mono text-[10.5px] tracking-wide text-zinc-500 sm:text-left">
            © {new Date().getFullYear()}{" "}
            {config.footerCopyright || config.brandName}. Independent Discord
            bot — not affiliated with Discord Inc.
          </p>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            <span className="size-1.5 animate-ticker rounded-full bg-emerald-400" />
            {config.footerStatusText || "all systems operational"}
          </div>
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
      <p className="font-mono text-[9.5px] uppercase tracking-[0.26em] text-zinc-600">
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
                {l.label}
              </a>
            ) : l.href.startsWith("#") ? (
              <a
                href={l.href}
                className="text-[13px] text-zinc-400 transition-colors hover:text-white"
              >
                {l.label}
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
