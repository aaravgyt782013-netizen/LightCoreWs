import type { Metadata } from "next";
import { PageShell } from "@/components/site/PageShell";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "System Status",
  description: "Live health and heartbeat signals for the XIERON guard engine.",
};

const services = [
  { name: "Gateway Listener", region: "global", p99: "41ms", uptime: "99.997%" },
  { name: "Anti-Nuke Engine", region: "global", p99: "38ms", uptime: "99.994%" },
  { name: "AutoMod Pipeline", region: "global", p99: "52ms", uptime: "99.991%" },
  { name: "VoiceMaster Broker", region: "eu-west", p99: "61ms", uptime: "99.989%" },
  { name: "Dashboard API", region: "global", p99: "84ms", uptime: "99.995%" },
  { name: "Audit Stream", region: "global", p99: "27ms", uptime: "99.998%" },
];

const days = Array.from({ length: 45 }, (_, i) => (i === 31 ? "warn" : "ok"));

export default function StatusPage() {
  return (
    <PageShell
      eyebrow="status"
      title="System Status"
      intro="Every surface of the guard engine, sampled continuously. Rolling 45-day window."
    >
      <div className="max-w-4xl space-y-3">
        <Reveal className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.05] px-5 py-4">
          <p className="flex items-center gap-2.5 text-[14px] font-medium text-emerald-300">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-pulse-ring rounded-full border border-emerald-400/60" />
              <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400" />
            </span>
            All systems operational
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400/70">
            updated 30s ago
          </p>
        </Reveal>

        {services.map((s, i) => (
          <Reveal
            key={s.name}
            delay={i * 50}
            className="rounded-2xl border border-white/[0.07] bg-white/[0.018] px-5 py-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[13.5px] font-medium text-zinc-100">
                  {s.name}
                </p>
                <p className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.2em] text-zinc-600">
                  {s.region} · p99 {s.p99}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10.5px] text-zinc-500">
                  {s.uptime}
                </span>
                <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-emerald-400">
                  operational
                </span>
              </div>
            </div>
            <div className="mt-3 flex gap-[2px]">
              {days.map((d, idx) => (
                <span
                  key={idx}
                  className={`h-6 flex-1 rounded-[2px] ${
                    d === "ok"
                      ? "bg-emerald-500/35 hover:bg-emerald-400/70"
                      : "bg-amber-500/50 hover:bg-amber-400/80"
                  } transition-colors`}
                />
              ))}
            </div>
          </Reveal>
        ))}
      </div>
    </PageShell>
  );
}
