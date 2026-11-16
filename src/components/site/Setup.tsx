import { setupSteps } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";
import { CheckIcon } from "@/components/ui/Icons";

type Quadrant = { title: string; copy: string };

export function Setup() {
  return (
    <section id="setup" className="relative py-20 sm:py-28">
      <div className="container-x">
        <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">Setup</p>
            <h2 className="mt-4 font-display text-[32px] font-semibold leading-[1.08] tracking-tight text-white sm:text-[46px]">
              Zero-Config Setup
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-zinc-400">
              Enterprise-grade security, activated in under 30 seconds.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3">
            <span className="font-mono text-[26px] font-medium text-white">
              30<span className="text-brand-500">s</span>
            </span>
            <span className="h-8 w-px bg-white/10" />
            <span className="font-mono text-[9.5px] uppercase leading-tight tracking-[0.2em] text-zinc-500">
              average
              <br />
              activation
            </span>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {setupSteps.map((s, i) => (
            <Reveal
              key={s.step}
              delay={i * 90}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.035] to-white/[0.012] p-6 transition-colors duration-300 hover:border-white/[0.14]"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-[13px] font-semibold tracking-[0.28em] text-brand-500/90">
                  {s.step}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-600">
                  step {s.step} / {s.phase}
                </span>
              </div>

              <h3 className="mt-5 font-display text-[19px] font-semibold tracking-tight text-white">
                {s.title}
              </h3>
              <p className="mt-2.5 text-[13px] leading-relaxed text-zinc-400">
                {s.copy}
              </p>

              {"command" in s && s.command && (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-white/[0.07] bg-ink-950/80 px-3 py-2">
                  <span className="font-mono text-[10px] text-zinc-600">$</span>
                  <code className="font-mono text-[11.5px] text-brand-300">
                    {s.command}
                  </code>
                </div>
              )}

              {"bullets" in s && s.bullets && (
                <ul className="mt-4 space-y-2">
                  {s.bullets.map((b: string) => (
                    <li key={b} className="flex items-start gap-2">
                      <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-brand-400/80" />
                      <span className="text-[12px] leading-snug text-zinc-400">
                        {b}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {"quadrants" in s && s.quadrants && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {(s.quadrants as readonly Quadrant[]).map((q) => (
                    <div
                      key={q.title}
                      className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5"
                    >
                      <p className="text-[11.5px] font-medium text-zinc-200">
                        {q.title}
                      </p>
                      <p className="mt-1 text-[10px] leading-snug text-zinc-500">
                        {q.copy}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="pointer-events-none absolute inset-x-6 -bottom-px h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
