"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIcon,
  CheckIcon,
  LockIcon,
  RefreshIcon,
  ServerIcon,
} from "@/components/ui/Icons";
import type { ServiceStatus } from "@/app/api/status/route";

type StatusPayload = {
  live: boolean;
  operational: boolean;
  botConnected?: boolean;
  oauthConfigured?: boolean;
  scopes?: string;
  storageEngine?: string;
  processUptime?: string;
  botName?: string;
  clientId?: string;
  latencyMs: number | null;
  guilds: number | null;
  users: number | null;
  checkedAt: string | null;
  services: ServiceStatus[];
};

const STATE_STYLES: Record<
  ServiceStatus["state"],
  { dot: string; badge: string; label: string }
> = {
  operational: {
    dot: "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]",
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    label: "Operational",
  },
  standby: {
    dot: "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.7)]",
    badge: "border-sky-500/30 bg-sky-500/10 text-sky-300",
    label: "Standby",
  },
  degraded: {
    dot: "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.85)]",
    badge: "border-amber-500/35 bg-amber-500/10 text-amber-300",
    label: "Degraded",
  },
  offline: {
    dot: "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.85)]",
    badge: "border-rose-500/35 bg-rose-500/10 text-rose-300",
    label: "Offline",
  },
};

export function StatusClient() {
  const [data, setData] = useState<StatusPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rttHistory, setRttHistory] = useState<number[]>([]);
  const [error, setError] = useState(false);

  const probe = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const t0 = performance.now();
      const res = await fetch("/api/status", { cache: "no-store" });
      const rtt = Math.max(1, Math.round(performance.now() - t0));
      if (!res.ok) throw new Error("status_http_error");
      const json = (await res.json()) as StatusPayload;
      setData(json);
      setError(false);
      setRttHistory((prev) => [...prev.slice(-19), rtt]);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void probe(false);
    const id = window.setInterval(() => void probe(false), 20_000);
    return () => window.clearInterval(id);
  }, [probe]);

  if (loading && !data) {
    return (
      <div className="max-w-5xl space-y-4">
        <div className="skeleton-shimmer h-24 rounded-3xl border border-white/[0.07]" />
        <div className="grid gap-3 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="skeleton-shimmer h-24 rounded-2xl border border-white/[0.07]"
            />
          ))}
        </div>
        <div className="space-y-2.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="skeleton-shimmer h-[72px] rounded-2xl border border-white/[0.07]"
            />
          ))}
        </div>
      </div>
    );
  }

  const operational = !error && Boolean(data?.operational);
  const services = data?.services ?? [];
  const operationalCount = services.filter(
    (s) => s.state === "operational",
  ).length;
  const latestRtt = rttHistory[rttHistory.length - 1] ?? data?.latencyMs ?? null;
  const maxRtt = Math.max(40, ...rttHistory);

  return (
    <div className="max-w-5xl space-y-6">
      {/* Primary Live Health Banner */}
      <div
        className={`relative overflow-hidden rounded-3xl border p-6 sm:p-7 ${
          operational
            ? "border-emerald-500/30 bg-gradient-to-br from-emerald-500/[0.09] via-ink-900/90 to-ink-950"
            : "border-amber-500/35 bg-gradient-to-br from-amber-500/[0.09] via-ink-900/90 to-ink-950"
        }`}
      >
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <span
              className={`mt-1 flex size-11 shrink-0 items-center justify-center rounded-2xl border ${
                operational
                  ? "border-emerald-400/35 bg-emerald-500/15 text-emerald-300"
                  : "border-amber-400/35 bg-amber-500/15 text-amber-300"
              }`}
            >
              {operational ? (
                <CheckIcon className="size-5" />
              ) : (
                <ActivityIcon className="size-5" />
              )}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="font-display text-[20px] font-semibold text-white sm:text-[22px]">
                  {error
                    ? "Unable to reach health endpoint"
                    : operational
                      ? "All Platform Systems Operational"
                      : "Partial Service Degradation Detected"}
                </h2>
                <span
                  className={`rounded-full border px-2.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wider ${
                    operational
                      ? "border-emerald-500/35 bg-emerald-500/15 text-emerald-300"
                      : "border-amber-500/35 bg-amber-500/15 text-amber-300"
                  }`}
                >
                  Live Probe
                </span>
              </div>
              <p className="mt-1 font-mono text-[11px] text-zinc-400">
                {operationalCount}/{services.length} live subsystems active
                {data?.checkedAt
                  ? ` · Checked ${new Date(data.checkedAt).toLocaleTimeString()}`
                  : ""}{" "}
                · Auto-refreshes every 20s
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={refreshing}
            onClick={() => void probe(true)}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-white/[0.12] bg-ink-950/80 px-4 text-[12.5px] font-medium text-zinc-100 transition hover:border-brand-500/45 hover:text-white disabled:opacity-60"
          >
            <RefreshIcon
              className={`size-3.5 text-brand-400 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
            {refreshing ? "Probing…" : "Re-probe Now"}
          </button>
        </div>
      </div>

      {/* Real Measured Metric Strip */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile
          label="Client → API RTT"
          value={latestRtt !== null ? `${latestRtt}ms` : "—"}
          sub={`Server probe ${data?.latencyMs ?? "—"}ms`}
        />
        <MetricTile
          label="Instance Uptime"
          value={data?.processUptime || "—"}
          sub="Current Node.js runtime"
        />
        <MetricTile
          label="Datastore Engine"
          value={
            data?.storageEngine === "netlify-blobs"
              ? "Netlify Blobs"
              : data?.storageEngine === "local-disk"
                ? "Local KV"
                : "Memory KV"
          }
          sub="Guild & theme persistence"
        />
        <MetricTile
          label={data?.guilds !== null && data?.guilds !== undefined ? "Connected Guilds" : "OAuth2 Scope Mode"}
          value={
            data?.guilds !== null && data?.guilds !== undefined
              ? data.guilds.toLocaleString()
              : data?.scopes || "identify guilds"
          }
          sub={
            data?.users !== null && data?.users !== undefined
              ? `${data.users.toLocaleString()} cached members`
              : "Read-only Discord OAuth 2.0"
          }
        />
      </div>

      {/* Component Health Table */}
      <div className="panel overflow-hidden rounded-3xl">
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <ServerIcon className="size-4 text-brand-400" />
            <h3 className="font-display text-[15px] font-semibold text-white">
              Component Telemetry
            </h3>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            Real-time measurement
          </span>
        </div>

        <div className="divide-y divide-white/[0.06]">
          {services.map((service) => {
            const st = STATE_STYLES[service.state] || STATE_STYLES.standby;
            return (
              <div
                key={service.name}
                className="flex flex-col justify-between gap-3 px-5 py-4 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center sm:px-6"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-1.5 size-2.5 shrink-0 rounded-full ${st.dot}`}
                  />
                  <div>
                    <p className="text-[14px] font-medium text-zinc-100">
                      {service.name}
                    </p>
                    <p className="mt-0.5 font-mono text-[10.5px] text-zinc-500">
                      {service.region}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pl-5 sm:pl-0">
                  <span className="font-mono text-[11px] text-zinc-400">
                    {service.p99 !== "—" ? `${service.p99} · ` : ""}
                    {service.detail}
                  </span>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wider ${st.badge}`}
                  >
                    {st.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Session RTT Bars + Security Link */}
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="panel rounded-3xl p-5 sm:p-6 lg:col-span-7">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">
              Live Session Response Samples ({rttHistory.length}/20)
            </p>
            <button
              type="button"
              onClick={() => void probe(true)}
              className="font-mono text-[10px] uppercase tracking-wider text-brand-300 hover:text-white"
            >
              + Sample
            </button>
          </div>
          <div className="mt-4 flex h-16 items-end gap-1.5 rounded-2xl border border-white/[0.06] bg-ink-950/75 p-3">
            {Array.from({ length: 20 }).map((_, idx) => {
              const sample = rttHistory[idx];
              const pct = sample
                ? Math.max(18, Math.min(100, Math.round((sample / maxRtt) * 100)))
                : 12;
              return (
                <div
                  key={idx}
                  title={sample ? `Sample #${idx + 1}: ${sample}ms` : "Awaiting sample"}
                  style={{ height: `${pct}%` }}
                  className={`flex-1 rounded-sm transition-all duration-300 ${
                    sample
                      ? sample < 120
                        ? "bg-emerald-400/80 hover:bg-emerald-300"
                        : "bg-amber-400/80 hover:bg-amber-300"
                      : "bg-white/[0.06]"
                  }`}
                />
              );
            })}
          </div>
          <p className="mt-2.5 font-mono text-[10px] text-zinc-500">
            Every bar represents an actual round-trip health check executed from
            your browser — zero synthetic uptime numbers.
          </p>
        </div>

        <div className="panel flex flex-col justify-between rounded-3xl p-5 sm:p-6 lg:col-span-5">
          <div>
            <div className="flex items-center gap-2 text-brand-300">
              <LockIcon className="size-4" />
              <span className="font-mono text-[10px] uppercase tracking-[0.22em]">
                Trust &amp; Architecture
              </span>
            </div>
            <p className="mt-2.5 text-[13px] leading-relaxed text-zinc-400">
              Application ID{" "}
              <code className="font-mono text-[11.5px] text-zinc-200">
                {data?.clientId}
              </code>
              . Read our full OAuth2 security specification or test every module
              directly inside the interactive sandbox.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <Link
              href="/security"
              className="rounded-xl border border-white/[0.1] bg-ink-950/80 px-3.5 py-2 text-[12px] font-medium text-zinc-200 transition hover:border-brand-500/40 hover:text-white"
            >
              Security Center →
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl border border-brand-500/35 bg-brand-950/40 px-3.5 py-2 text-[12px] font-medium text-brand-200 transition hover:border-brand-400/60 hover:text-white"
            >
              Web Dashboard →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricTile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="panel rounded-2xl p-4 sm:p-5">
      <p className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 truncate font-display text-[20px] font-bold text-white">
        {value}
      </p>
      <p className="mt-1 truncate font-mono text-[10px] text-zinc-500">{sub}</p>
    </div>
  );
}
