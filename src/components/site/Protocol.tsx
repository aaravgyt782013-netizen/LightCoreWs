import Link from "next/link";
import { protocolStages } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import {
  ActivityIcon,
  ArrowRight,
  BoltIcon,
  LockIcon,
  ShieldIcon,
} from "@/components/ui/Icons";

const stageIcons = [ActivityIcon, LockIcon, BoltIcon, ShieldIcon];

export function Protocol() {
  return (
    <section id="protocol" className="relative py-20 sm:py-28">
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Defense Architecture</p>
          <h2 className="mt-5 font-display text-[32px] font-bold leading-[1.05] tracking-tight text-white sm:text-[48px]">
            Four-stage <span className="text-gradient-brand">Guard Pipeline</span>
          </h2>
          <p className="mt-4 text-balance text-[15px] leading-relaxed text-zinc-400">
            Every guild audit event and message burst passes through a
            deterministic four-stage verification, rate-gate, and recovery
            pipeline.
          </p>
        </Reveal>

        <div className="relative mt-14">
          {/* Animated laser data-beam across stages */}
          <div
            aria-hidden
            className="pointer-events-none relative mb-6 hidden h-[2px] w-full overflow-hidden rounded-full bg-white/[0.06] lg:block"
          >
            <div className="animate-beam h-full w-1/4 rounded-full bg-gradient-to-r from-transparent via-brand-500 to-brand-300 shadow-[0_0_16px_rgb(var(--brand-400))]" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {protocolStages.map((s, i) => {
              const Icon = stageIcons[i % stageIcons.length];
              return (
                <Reveal key={s.title} delay={i * 80}>
                  <SpotlightCard className="group flex h-full flex-col justify-between rounded-[24px] p-6 transition-transform duration-300 ease-smooth hover:-translate-y-1">
                    <div>
                      <div className="relative flex items-center justify-between">
                        <span className="flex size-11 items-center justify-center rounded-2xl border border-white/[0.09] bg-black/55 text-zinc-300 transition-all duration-300 ease-smooth group-hover:border-brand-500/45 group-hover:bg-brand-950/60 group-hover:text-brand-400 group-hover:shadow-[0_0_24px_-6px_rgb(var(--brand-500)/0.8)]">
                          <Icon className="size-[19px]" />
                        </span>
                        <span className="rounded-full border border-brand-500/30 bg-brand-950/45 px-2.5 py-0.5 font-mono text-[9.5px] font-semibold tracking-wider text-brand-300">
                          {s.badge}
                        </span>
                      </div>

                      <p className="relative mt-6 font-mono text-[9px] uppercase tracking-[0.24em] text-zinc-500">
                        {s.stage}
                      </p>
                      <h3 className="relative mt-1.5 font-display text-[17.5px] font-bold leading-snug tracking-tight text-white">
                        {s.title}
                      </h3>
                      <p className="relative mt-2.5 text-[13px] leading-relaxed text-zinc-400">
                        {s.copy}
                      </p>
                    </div>

                    <p className="relative mt-5 border-t border-white/[0.06] pt-3 font-mono text-[10px] leading-snug text-zinc-500">
                      {s.detail}
                    </p>
                  </SpotlightCard>
                </Reveal>
              );
            })}
          </div>
        </div>

        <Reveal delay={120} className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-500/22 bg-gradient-to-r from-brand-950/50 via-ink-900/80 to-ink-900/60 px-6 py-4 backdrop-blur-xl">
            <p className="text-[13.5px] text-zinc-300">
              <span className="font-semibold text-white">
                Built on official Discord OAuth2:
              </span>{" "}
              standard <code className="font-mono text-brand-300">identify</code>,{" "}
              <code className="font-mono text-brand-300">guilds</code> &amp;{" "}
              <code className="font-mono text-brand-300">guilds.join</code> scopes
              with automatic community onboarding and zero database token storage.
            </p>
            <Link
              href="/security"
              className="group inline-flex items-center gap-1.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.18em] text-brand-300 transition hover:text-white"
            >
              Read Security Spec
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
