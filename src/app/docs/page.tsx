import type { Metadata } from "next";
import { PageShell } from "@/components/site/PageShell";
import { Reveal } from "@/components/ui/Reveal";
import { features, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Documentation",
  description: `Commands, modules and configuration reference for ${site.name} — ${site.description}.`,
};

const core = [
  { cmd: `${site.prefix}antinuke enable`, desc: "Initialise all 26 modules and caches" },
  { cmd: `${site.prefix}antinuke status`, desc: "Show module health and rate gates" },
  { cmd: `${site.prefix}whitelist add @user`, desc: "Grant explicit owner override" },
  { cmd: `${site.prefix}limits ban 3`, desc: "Allow 3 bans per actor per minute" },
  { cmd: `${site.prefix}automod strict`, desc: "Enable the high-sensitivity content firewall" },
  { cmd: `${site.prefix}nightmode 00:00 08:00`, desc: "Schedule a nightly lockdown window" },
  { cmd: `${site.prefix}ticket setup`, desc: "Deploy the ticket panel and staff routing" },
  { cmd: `${site.prefix}voicemaster setup`, desc: "Create the join-to-create hub" },
];

export default function DocsPage() {
  return (
    <PageShell
      eyebrow="docs"
      title="Documentation"
      intro={`Everything runs on a single guard engine with prefix "${site.prefix}". These are the commands you will actually type.`}
    >
      <div className="grid max-w-5xl gap-4 lg:grid-cols-2">
        <Reveal className="rounded-2xl border border-white/[0.07] bg-white/[0.018] p-5">
          <p className="font-mono text-[9.5px] uppercase tracking-[0.24em] text-zinc-600">
            core commands
          </p>
          <div className="mt-4 space-y-1.5">
            {core.map((c) => (
              <div
                key={c.cmd}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-white/[0.05] bg-ink-950/60 px-3 py-2"
              >
                <code className="font-mono text-[11.5px] text-brand-300">
                  {c.cmd}
                </code>
                <span className="ml-auto text-[11px] text-zinc-500">
                  {c.desc}
                </span>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="space-y-4">
          <Reveal className="rounded-2xl border border-white/[0.07] bg-white/[0.018] p-5">
            <p className="font-mono text-[9.5px] uppercase tracking-[0.24em] text-zinc-600">
              modules
            </p>
            <div className="mt-4 space-y-2">
              {features.map((f) => (
                <div
                  key={f.key}
                  className="rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-2.5"
                >
                  <p className="text-[12.5px] font-medium text-zinc-200">
                    {f.key}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-zinc-500">
                    {f.copy}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal
            delay={80}
            className="rounded-2xl border border-brand-600/25 bg-brand-950/25 p-5"
          >
            <p className="font-display text-[14px] font-semibold text-white">
              Predicate reference
            </p>
            <p className="mt-2 text-[12px] leading-relaxed text-zinc-400">
              Rate gates are expressed as{" "}
              <code className="rounded bg-black/40 px-1 py-0.5 font-mono text-[11px] text-brand-300">
                action:count:window
              </code>
              . Example:{" "}
              <code className="rounded bg-black/40 px-1 py-0.5 font-mono text-[11px] text-brand-300">
                ban:3:60s
              </code>{" "}
              bans an actor the moment a fourth ban is attempted inside one
              minute, then rolls back the prior three.
            </p>
          </Reveal>
        </div>
      </div>
    </PageShell>
  );
}
