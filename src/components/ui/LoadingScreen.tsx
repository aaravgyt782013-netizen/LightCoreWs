"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";
import { site } from "@/lib/site";
import { Wordmark } from "@/components/ui/Logo";

const defaultSteps = [
  "Connection Establishing...",
  "Syncing Discord Gateway...",
  "Arming Guard Engine...",
  "Verifying Credentials...",
];

export function LoadingScreen({
  label,
  sublabel,
  fullScreen = true,
  cycle = true,
}: {
  label?: string;
  sublabel?: string;
  fullScreen?: boolean;
  cycle?: boolean;
}) {
  const [stepIdx, setStepIdx] = useState(0);
  const gradId = useId();

  useEffect(() => {
    if (!cycle || label) return;
    const id = window.setInterval(() => {
      setStepIdx((i) => (i + 1) % defaultSteps.length);
    }, 1500);
    return () => window.clearInterval(id);
  }, [cycle, label]);

  const activeStatus = label || defaultSteps[stepIdx];

  return (
    <div
      role="status"
      aria-live="polite"
      className={
        fullScreen
          ? "fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-ink-950 px-6 text-center"
          : "relative flex min-h-[420px] w-full flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/[0.07] bg-ink-950/90 px-6 py-16 text-center"
      }
    >
      {/* Ambient crimson glow & subtle grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid-fade bg-grid opacity-[0.22] [mask-image:radial-gradient(circle_at_50%_46%,#000,transparent_65%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 size-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(239,16,16,0.22),transparent_75%)] blur-2xl"
      />

      {/* Center bot logo with spinning red orbital lines */}
      <div className="relative flex size-[148px] items-center justify-center">
        {/* Expanding pulse halo */}
        <span
          aria-hidden
          className="absolute size-[108px] animate-pulse-ring rounded-full border border-brand-500/45"
        />

        {/* Outer dashed crimson orbit (slow clockwise) */}
        <svg
          aria-hidden
          viewBox="0 0 148 148"
          className="absolute inset-0 size-full animate-spin-slow"
        >
          <circle
            cx="74"
            cy="74"
            r="69"
            fill="none"
            stroke="rgba(255,43,43,0.16)"
            strokeWidth="1"
          />
          <circle
            cx="74"
            cy="74"
            r="69"
            fill="none"
            stroke="#ff2b2b"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeDasharray="54 90 22 90"
            opacity="0.75"
          />
        </svg>

        {/* Middle bright crimson dual-arc spinner (fast clockwise) */}
        <svg
          aria-hidden
          viewBox="0 0 124 124"
          className="absolute size-[124px] animate-spin-orbit drop-shadow-[0_0_12px_rgba(255,43,43,0.75)]"
        >
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff9797" />
              <stop offset="45%" stopColor="#ff2b2b" />
              <stop offset="100%" stopColor="#ef1010" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <circle
            cx="62"
            cy="62"
            r="56"
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeDasharray="120 232"
          />
          <circle cx="62" cy="6" r="3" fill="#ff5c5c" />
        </svg>

        {/* Inner counter-rotating crimson arc */}
        <svg
          aria-hidden
          viewBox="0 0 100 100"
          className="absolute size-[100px] animate-spin-reverse"
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#ef1010"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="48 95 36 95"
            opacity="0.85"
          />
        </svg>

        {/* Bot logo core */}
        <div className="relative flex size-[66px] items-center justify-center rounded-2xl border border-brand-500/35 bg-ink-900 p-1 shadow-[0_0_35px_rgba(239,16,16,0.55)]">
          <Image
            src={site.logo}
            alt={`${site.name} logo`}
            width={58}
            height={58}
            priority
            unoptimized
            className="size-full rounded-[12px] object-cover"
          />
        </div>
      </div>

      {/* Wordmark + Connection Establishing copy */}
      <div className="relative mt-8 flex flex-col items-center">
        <p className="font-display text-[22px] font-bold tracking-[0.22em] text-white sm:text-[25px]">
          <Wordmark />
        </p>

        <div className="mt-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.26em] text-brand-300/95">
          <span className="size-1.5 animate-ticker rounded-full bg-brand-500 shadow-[0_0_8px_#ff2b2b]" />
          <span>{activeStatus}</span>
        </div>

        {sublabel && (
          <p className="mt-2 max-w-xs font-mono text-[10px] tracking-[0.14em] text-zinc-500">
            {sublabel}
          </p>
        )}

        {/* Thin crimson progress bar */}
        <div
          aria-hidden
          className="mt-5 h-[2px] w-48 overflow-hidden rounded-full bg-white/[0.07]"
        >
          <div className="h-full w-20 animate-loader-slide rounded-full bg-gradient-to-r from-transparent via-brand-500 to-brand-300 shadow-[0_0_12px_#ff2b2b]" />
        </div>
      </div>
    </div>
  );
}
