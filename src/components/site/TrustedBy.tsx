"use client";

import { useState } from "react";
import { partners, site, type Partner } from "@/lib/site";
import { VerifiedIcon } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";

function iconUrl(icon: string, size = 128) {
  return `https://cdn.discordapp.com/icons/${icon}?size=${size}`;
}

function PartnerCard({ p }: { p: Partner }) {
  const [failed, setFailed] = useState(false);
  const label = p.short ?? p.name;
  const initials =
    label
      .replace(/[^A-Za-z0-9 ]/g, "")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || "")
      .join("") || "LC";

  return (
    <div className="group relative flex h-[66px] w-[274px] shrink-0 items-center gap-3.5 rounded-2xl border border-white/[0.07] bg-ink-900/75 px-3.5 shadow-[inset_0_1px_0_rgb(255_255_255/0.05)] backdrop-blur-md transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-brand-500/40 hover:bg-ink-850/90 hover:shadow-[0_18px_40px_-24px_rgb(var(--brand-500)/0.65)]">
      <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-gradient-to-br from-brand-900/60 to-ink-950 font-display text-[12px] font-bold text-brand-200 transition-colors group-hover:border-brand-500/45">
        {failed ? (
          <span>{initials}</span>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={iconUrl(p.icon)}
            alt=""
            width={40}
            height={40}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
            className="size-full object-cover"
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-[13px] font-semibold text-zinc-100 transition-colors group-hover:text-white">
            {label}
          </p>
          {p.verified && (
            <VerifiedIcon className="size-3.5 shrink-0 text-brand-400" />
          )}
        </div>
        <p className="mt-0.5 font-mono text-[10px] tracking-wide text-zinc-500">
          {p.members}
        </p>
      </div>
    </div>
  );
}

function Row({
  items,
  reverse,
  duration,
}: {
  items: Partner[];
  reverse?: boolean;
  duration: string;
}) {
  const doubled = [...items, ...items];
  return (
    <div className="marquee-mask mask-fade-x overflow-hidden py-1">
      <div
        className={`marquee-track gap-3.5 ${
          reverse ? "animate-marquee-reverse" : "animate-marquee"
        }`}
        style={{ ["--marquee-duration" as string]: duration }}
      >
        {doubled.map((p, i) => (
          <PartnerCard key={`${p.name}-${i}`} p={p} />
        ))}
      </div>
    </div>
  );
}

export function TrustedBy() {
  const half = Math.ceil(partners.length / 2);
  const rowA = partners.slice(0, half);
  const rowB = partners.slice(half);

  return (
    <section id="trusted" className="relative overflow-hidden py-20 sm:py-24">
      <div className="container-x">
        <div className="hairline mb-20 opacity-60" />
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Trusted worldwide</p>
          <h2 className="mt-5 font-display text-[32px] font-bold tracking-tight text-white sm:text-[44px]">
            Securing Top <span className="text-gradient-brand">Communities</span>
          </h2>
          <p className="mt-4 text-balance text-[15px] leading-relaxed text-zinc-400">
            {site.name} protects high-traffic creators, gaming networks, and
            active community hubs around the clock.
          </p>
        </Reveal>
      </div>

      <div className="mt-12 space-y-3.5">
        <Row items={rowA} duration="64s" />
        <Row items={rowB} reverse duration="78s" />
      </div>

      <div className="container-x mt-11">
        <div className="mx-auto flex w-fit flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-full border border-white/[0.07] bg-ink-900/60 px-6 py-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400 backdrop-blur-md">
          <span>2,400+ guilds</span>
          <span className="hidden text-brand-500/60 sm:inline">•</span>
          <span>38M+ members</span>
          <span className="hidden text-brand-500/60 sm:inline">•</span>
          <span>99.99% uptime</span>
          <span className="hidden text-brand-500/60 sm:inline">•</span>
          <span className="text-brand-300">0 breaches</span>
        </div>
      </div>
    </section>
  );
}
