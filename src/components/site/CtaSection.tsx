"use client";

import Link from "next/link";
import { InviteButton } from "@/components/ui/InviteButton";
import { Reveal } from "@/components/ui/Reveal";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { ArrowRight } from "@/components/ui/Icons";
import { useSiteConfig } from "@/components/site/SiteConfigProvider";
import { DEFAULT_TAGLINE, site } from "@/lib/site";

export function CtaSection() {
  const { config } = useSiteConfig();
  const brandName = config.brandName || site.name;

  return (
    <section className="relative py-20 sm:py-28">
      <div className="container-x">
        <Reveal>
          <SpotlightCard className="overflow-hidden rounded-[36px] px-6 py-16 text-center sm:px-12 sm:py-24">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-16 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/70 to-transparent"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(65% 85% at 50% 0%, rgb(var(--brand-400) / 0.16), rgb(var(--brand-700) / 0.05) 54%, transparent 80%)",
              }}
            />

            <div className="relative mx-auto max-w-2xl">
              <div className="relative mx-auto flex size-24 items-center justify-center">
                <span
                  aria-hidden
                  className="absolute -inset-3 rounded-full bg-brand-400/25 blur-2xl"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={config.logoUrl || site.logo}
                  alt={`${brandName} logo`}
                  width={88}
                  height={88}
                  className="relative size-[88px] rounded-[26px] bg-black object-cover ring-1 ring-brand-300/40 shadow-[0_18px_50px_-10px_rgb(var(--brand-400)/0.55)]"
                />
              </div>

              <p className="mt-6 text-[12px] font-medium uppercase tracking-[0.2em] text-brand-300">
                {config.tagline || DEFAULT_TAGLINE}
              </p>

              <h2 className="mt-3 font-display text-[32px] font-bold leading-[1.06] tracking-[-0.02em] text-white sm:text-[50px]">
                Bring {brandName} to your
                <br className="hidden sm:block" />{" "}
                <span className="text-gradient-brand">Discord community.</span>
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-balance text-[15.5px] leading-relaxed text-zinc-300 sm:text-[16.5px]">
                Free to start, effortless to set up, and built to keep your
                server safe, lively, and welcoming around the clock.
              </p>

              <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
                <InviteButton size="lg" />
                <Link
                  href={site.dashboard}
                  className="btn-soft group inline-flex h-[52px] items-center gap-2.5 px-7 text-[14.5px] font-semibold active:scale-[0.985]"
                >
                  Open Dashboard
                  <ArrowRight className="size-4 text-brand-300 transition-transform duration-300 ease-smooth group-hover:translate-x-0.5" />
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12.5px] text-zinc-400">
                <Link
                  href="/premium"
                  className="transition-colors hover:text-brand-200"
                >
                  Premium Plans
                </Link>
                <span className="text-zinc-700">·</span>
                <Link
                  href="/docs"
                  className="transition-colors hover:text-brand-200"
                >
                  68+ Commands
                </Link>
                <span className="text-zinc-700">·</span>
                <Link
                  href="/status"
                  className="transition-colors hover:text-brand-200"
                >
                  System Status
                </Link>
              </div>
            </div>
          </SpotlightCard>
        </Reveal>
      </div>
    </section>
  );
}
