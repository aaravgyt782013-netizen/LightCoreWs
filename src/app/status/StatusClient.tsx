"use client";

import { useCallback, useEffect, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { RefreshIcon } from "@/components/ui/Icons";
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
  const [refreshing, setRefreshing] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  const load = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const res = await fetch("/api/status", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as {
        live?: boolean;
        operational?: boolean;
        latencyMs?: number | null;
        services?: ServiceStatus[];
      };
      setLive(Boolean(data.live));
      setOperational(data.operational !== false);
      setLatencyMs(typeof data.latencyMs === "number" ? data.latencyMs : null);
      if (Array.isArray(data.services) && data.services.length > 0) {
        setServices(data.services);
      }
    } catch {
      // Keep baseline display.
    } finally {
      if (manual) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 30_000);
    return () => window.clearInterval(id);
  }, [load]);

  return (
    <div className="max-w-4xl space-y-4">
      <div
        className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border px-5 py-4 backdrop-blur-xl ${
          operational
            ? "border-emerald-500/25 bg-gradient-to-r from-emerald-500/[0.09] via-ink-900/80 to-ink-900/70"
            : "border-brand-500/35 bg-gradient-to-r from-brand-500/[0.12] via-ink-900/80 to-ink-900/70"
        }`}
      >
        <p
          className={`flex items-center gap-3 font-display text-[15px] font-semibold ${
            operational ? "text-emerald-300" : "text-brand-200"
          }`}
        >
          <span className="relative flex size-2.5">
            <span
              className={`absolute inline-flex size-full animate-pulse-ring rounded-full border ${
                operational ? "border-emerald-400/70" : "border-brand-400/70"
              }`}
            />
            <span
              className={`relative inline-flex size-2.5 rounded-full ${
                operational ? "bg-emerald-400" : "bg-brand-400"
              }`}
            />
          </span>
          {operational ? "All systems operational" : "Degraded performance"}
        </p>

        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
            {live
              ? `live heartbeat${latencyMs !== null ? ` · ${latencyMs}ms` : ""}`
              : "99.99% 45d SLA"}
          </span>
          <button
            type="button"
            onClick={() => void load(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/50 px-3 py-1 font-mono text-[9.5px] uppercase tracking-wider text-zinc-300 transition-all hover:border-brand-500/45 hover:text-white active:scale-95"
          >
            <RefreshIcon
              className={`size-3 ${refreshing ? "animate-spin text-brand-400" : ""}`}
            />
            Ping
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {services.map((s, i) => (
          <Reveal key={s.name} delay={i * 45}>
            <SpotlightCard className="rounded-2xl px-5 py-4">
              <div className="relative flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display text-[14.5px] font-semibold text-white">
                    {s.name}
                  </p>
                  <p className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.22em] text-zinc-500">
                    {s.region} · p99{" "}
                    <span className="text-brand-300">{s.p99}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] font-medium tabular-nums text-zinc-300">
                    {s.uptime}
                  </span>
                  <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-emerald-300">
                    {s.state || "operational"}
                  </span>
                </div>
              </div>
              <div className="relative mt-3.5 flex gap-[2.5px]">
                {days.map((d, idx) => (
                  <span
                    key={idx}
                    title={`Day ${idx + 1}: ${d === "ok" ? "100% operational" : "Minor maintenance"}`}
                    className={`h-6 flex-1 rounded-[3px] transition-all duration-200 hover:scale-y-110 ${
                      d === "ok"
                        ? "bg-emerald-500/40 hover:bg-emerald-400"
                        : "bg-brand-500/55 hover:bg-brand-400"
                    }`}
                  />
                ))}
              </div>
            </SpotlightCard>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
