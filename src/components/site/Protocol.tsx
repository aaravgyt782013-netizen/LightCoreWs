import { protocolStages } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";
import { ActivityIcon, BoltIcon, LockIcon, ShieldIcon } from "@/components/ui/Icons";

const stageIcons = [ActivityIcon, BoltIcon, LockIcon, ShieldIcon];

export function Protocol() {
  return (
    <section id="protocol" className="relative py-20 sm:py-28">
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">How it works</p>
          <h2 className="mt-4 font-display text-[32px] font-semibold leading-[1.08] tracking-tight text-white sm:text-[46px]">
            Security Protocol
          </h2>
          <p className="mt-4 text-balance text-[15px] leading-relaxed text-zinc-400">
            Every threat runs through a multi-stage automated pipeline in under
            500ms.
          </p>
        </Reveal>

        <div className="relative mt-14">
          {/* connection rail */}
          <div
            aria-hidden
            className="absolute left-1/2 top-0 hidden h-px w-[86%] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/12 to-transparent lg:block"
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {protocolStages.map((s, i) => {
              const Icon = stageIcons[i % stageIcons.length];
              return (
                <Reveal
                  key={s.title}
                  delay={i * 80}
                  className="group relative"
                >
                  <div className="relative h-full rounded-2xl border border-white/[0.08] bg-gradient-to-b from-ink-850/85 to-ink-950/95 p-5 shadow-panel transition-all duration-300 ease-smooth hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-[0_24px_60px_-28px_rgb(var(--brand-600)/0.55)]">
                    <div className="flex items-center justify-between">
                      <span className="flex size-10 items-center justify-center rounded-xl border border-white/[0.07] bg-ink-900 text-zinc-300 transition-colors group-hover:border-brand-600/30 group-hover:text-brand-400">
                        <Icon className="size-[18px]" />
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-600">
                        0{i + 1}
                      </span>
                    </div>
                    <p className="mt-6 font-mono text-[9px] uppercase tracking-[0.22em] text-brand-400/80">
                      {s.stage}
                    </p>
                    <h3 className="mt-2 font-display text-[16.5px] font-semibold leading-snug tracking-tight text-white">
                      {s.title}
                    </h3>
                    <p className="mt-2.5 text-[12.5px] leading-relaxed text-zinc-400">
                      {s.copy}
                    </p>
                    <div
                      aria-hidden
                      className="absolute inset-x-5 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    />
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>

        <Reveal delay={120} className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/[0.07] bg-gradient-to-r from-brand-950/40 via-white/[0.015] to-transparent px-5 py-4">
            <p className="text-[13px] text-zinc-400">
              Active Threat Mitigation —{" "}
              <span className="font-medium text-white">
                real-time verification
              </span>{" "}
              and zero-latency protection.
            </p>
            <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 animate-ticker rounded-full bg-emerald-400" />
                pipeline healthy
              </span>
              <span className="hidden sm:inline">p50 · 38ms</span>
              <span className="hidden sm:inline">p99 · 480ms</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
