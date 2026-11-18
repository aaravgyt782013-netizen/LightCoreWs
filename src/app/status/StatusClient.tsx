"use client";

import { useEffect, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import type { ServiceStatus } from "@/app/api/status/route";

export function StatusClient() {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [operational, setOperational] = useState(false);
  const [live, setLive] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [checkedAt, setCheckedAt] = useState<string | null>(null);

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
          checkedAt?: string;
          services?: ServiceStatus[];
        };
        if (!active) return;
        setLive(data.live === true);
        setOperational(data.live === true && data.operational === true);
        setLatencyMs(typeof data.latencyMs === "number" ? data.latencyMs : null);
        setCheckedAt(typeof data.checkedAt === "string" ? data.checkedAt : null);
        setServices(Array.isArray(data.services) ? data.services : []);
      } catch {
        if (active) {
          setLive(false);
          setOperational(false);
          setServices([]);
        }
      }
    };
    void load();
    const id = window.setInterval(() => void load(), 30_000);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, []);

  const statusLabel = !live
    ? "Live status unavailable"
    : operational
      ? "Health endpoint reports operational"
      : "Full service health not confirmed";

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
          <span
            className={`size-2.5 rounded-full ${
              operational ? "bg-emerald-400" : "bg-amber-400"
            }`}
          />
          {statusLabel}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
          {live
            ? `Health check${latencyMs !== null ? ` · ${latencyMs}ms` : ""}`
            : "No live monitoring endpoint configured"}
          {checkedAt ? ` · ${new Date(checkedAt).toLocaleString()}` : ""}
        </p>
      </Reveal>

      {services.length === 0 ? (
        <p className="rounded-2xl border border-white/[0.07] bg-white/[0.018] px-5 py-4 text-[13px] leading-relaxed text-zinc-400">
          No live service metrics or historical uptime data are available. This
          page will display measurements when a monitoring endpoint supplies them.
        </p>
      ) : (
        services.map((service) => (
          <Reveal
            key={service.name}
            className="rounded-2xl border border-white/[0.07] bg-white/[0.018] px-5 py-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[13.5px] font-medium text-zinc-100">
                  {service.name}
                </p>
                <p className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.2em] text-zinc-600">
                  {service.region} · response {service.p99}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10.5px] text-zinc-500">
                  Uptime: {service.uptime}
                </span>
                <span className="rounded border border-white/10 bg-white/[0.05] px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-zinc-300">
                  {service.state}
                </span>
              </div>
            </div>
          </Reveal>
        ))
      )}
    </div>
  );
}
