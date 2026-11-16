import { faqs } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";
import { modules } from "@/lib/site";

export function Faq() {
  return (
    <section id="faq" className="relative py-20 sm:py-28">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
          <Reveal>
            <p className="eyebrow">Questions</p>
            <h2 className="mt-4 font-display text-[32px] font-semibold leading-[1.08] tracking-tight text-white sm:text-[42px]">
              Before you deploy
            </h2>
            <p className="mt-4 max-w-sm text-[14.5px] leading-relaxed text-zinc-400">
              Everything owners ask before handing a gatekeeper the keys. Still
              unsure? Open a ticket from the dashboard.
            </p>

            <div className="mt-8 rounded-2xl border border-white/[0.07] bg-white/[0.015] p-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-zinc-600">
                module manifest
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {modules.map((m) => (
                  <span
                    key={m}
                    className="rounded border border-white/[0.06] bg-white/[0.02] px-1.5 py-0.5 font-mono text-[9.5px] text-zinc-500"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          <div className="divide-y divide-white/[0.07] border-y border-white/[0.07]">
            {faqs.map((f, i) => (
              <Reveal key={f.q} delay={i * 60}>
                <details className="group py-5 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-5">
                    <span className="flex gap-4">
                      <span className="mt-0.5 font-mono text-[10px] text-zinc-600">
                        0{i + 1}
                      </span>
                      <span className="font-display text-[15.5px] font-medium leading-snug tracking-tight text-zinc-100 transition-colors group-hover:text-white">
                        {f.q}
                      </span>
                    </span>
                    <span className="relative mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border border-white/10 transition-colors group-hover:border-brand-600/40">
                      <span className="absolute h-[1.5px] w-2.5 rounded bg-zinc-400" />
                      <span className="absolute h-2.5 w-[1.5px] rounded bg-zinc-400 transition-transform duration-300 group-open:rotate-90 group-open:opacity-0" />
                    </span>
                  </summary>
                  <p className="ml-[26px] mt-3 max-w-2xl pr-8 text-[13.5px] leading-relaxed text-zinc-400">
                    {f.a}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
