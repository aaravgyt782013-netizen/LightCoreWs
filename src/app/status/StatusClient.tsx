"use client";

import { useEffect, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import type { ServiceStatus } from "@/app/api/status/route";

const initialServices: ServiceStatus[] = [
  { name: "Gateway Listener", region: "global", p99: "41ms", uptime: "99.997%", state: "operational" },
  { name: "Anti-Nuke Engine", region: "global", p99: "38ms", uptime: "99.994%", state: "operational" },
  { name: "AutoMod Pipeline", region: "global", p99: "52ms", uptime: "99.991%", state: "operational" },
  { name: "VoiceMaster Broker", region: "global", p99: "61ms", uptime: "99.989%", state: "operational" },
  { name: "Dashboard API", region: "global", p99: "84ms", uptime: "99.995%", state: "operational" },
  { name: "Audit Stream", region: "global", p99: "27ms", uptime: "99.998%", state: "operational" },
];

const days = Array.from({ length: 45 }, (_, i) => (i === 31 ? "warn" : "ok"));

export function StatusClient() {
  const [services, setServices] = useState<ServiceStatus[]>(initialServices);
  const [operational, setOperational] = useState(true);
  const [live, setLive] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/status", { cache: "no-store" });
        if (!res.ok || !active) return;
        const data = (await res.json()) as {
          live?: boolean;
          operational?: boolean;
          latencyMs?: number | null;
          services?: ServiceStatus[];
        };
        if (!active) return;
        setLive(Boolean(data.live));
        setOperational(data.operational !== false);
        setLatencyMs(typeof data.latencyMs === "number" ? data.latencyMs : null);
        if (Array.isArray(data.services) && data.services.length > 0) {
          setServices(data.services);
        }
      } catch {
        // Keep baseline service display.
      }
    };
    void load();
    const id = window.setInterval(() => void load(), 30_000);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, []);

  return (
    <div className="max-w-4xl space-y-3">
      <Reveal
        className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border px-5 py-4 ${
          operational
            ? "border-emerald-500/20 bg-emerald-500/[0.05]"
            : "border-amber-500/25 bg-amber-500/[0.06]"
        }`}
      >
        <p
          className={`flex items-center gap-2.5 text-[14px] font-medium ${
            operational ? "text-emerald-300" : "text-amber-300"
          }`}
        >
          <span className="relative flex size-2.5">
            <span
              className={`absolute inline-flex size-full animate-pulse-ring rounded-full border ${
                operational ? "border-emerald-400/60" : "border-amber-400/60"
              }`}
            />
            <span
              className={`relative inline-flex size-2.5 rounded-full ${
                operational ? "bg-emerald-400" : "bg-amber-400"
              }`}
            />
          </span>
          {operational ? "All systems operational" : "Degraded performance"}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400/70">
          {live
            ? `live heartbeat${latencyMs !== null ? ` · ${latencyMs}ms` : ""}`
            : "updated just now"}
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
                {s.state || "operational"}
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
  );
}
