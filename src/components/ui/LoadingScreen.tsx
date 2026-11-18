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
          : "relative flex min-h-[420px] w-full flex-col items-center justify-center overflow-hidden rounded-3xl border border-cyan-200/10 bg-ink-950/90 px-6 py-16 text-center"
      }
    >
      {/* Ambient aqua aurora glow & crisp grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid-fade bg-grid opacity-[0.28] [mask-image:radial-gradient(circle_at_50%_46%,#000,transparent_66%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 size-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(6,182,212,0.24),rgba(34,211,238,0.06)_55%,transparent_78%)] blur-2xl"
      />

      {/* Center bot logo with triple spinning luminous aqua orbital lines */}
      <div className="relative flex size-[152px] items-center justify-center">
        {/* Expanding pulse halo */}
        <span
          aria-hidden
          className="absolute size-[110px] animate-pulse-ring rounded-full border border-brand-400/50"
        />

        {/* Outer dashed aqua orbit (slow clockwise) */}
        <svg
          aria-hidden
          viewBox="0 0 152 152"
          className="absolute inset-0 size-full animate-spin-slow"
        >
          <circle
            cx="76"
            cy="76"
            r="71"
            fill="none"
            stroke="rgba(34,211,238,0.14)"
            strokeWidth="1"
          />
          <circle
            cx="76"
            cy="76"
            r="71"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeDasharray="56 92 22 92"
            opacity="0.78"
          />
        </svg>

        {/* Middle bright electric-aqua arc spinner (fast clockwise) */}
        <svg
          aria-hidden
          viewBox="0 0 126 126"
          className="absolute size-[126px] animate-spin-orbit drop-shadow-[0_0_14px_rgba(34,211,238,0.8)]"
        >
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#cffafe" />
              <stop offset="45%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#0891b2" stopOpacity="0.06" />
            </linearGradient>
          </defs>
          <circle
            cx="63"
            cy="63"
            r="57"
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeDasharray="124 234"
          />
          <circle cx="63" cy="6" r="3" fill="#67e8f9" />
        </svg>

        {/* Inner counter-rotating cyan arc */}
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
            stroke="#06b6d4"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="48 95 36 95"
            opacity="0.88"
          />
        </svg>

        {/* Bot logo core */}
        <div className="relative flex size-[68px] items-center justify-center rounded-2xl border border-brand-400/40 bg-ink-900 p-1 shadow-[0_0_38px_rgba(6,182,212,0.55)]">
          <Image
            src={site.logo}
            alt={`${site.name} logo`}
            width={60}
            height={60}
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

        <div className="mt-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.26em] text-brand-300">
          <span className="size-1.5 animate-ticker rounded-full bg-brand-400 shadow-[0_0_10px_#22d3ee]" />
          <span>{activeStatus}</span>
        </div>

        {sublabel && (
          <p className="mt-2 max-w-xs font-mono text-[10px] tracking-[0.14em] text-zinc-400">
            {sublabel}
          </p>
        )}

        {/* Thin aqua progress bar */}
        <div
          aria-hidden
          className="mt-5 h-[2px] w-48 overflow-hidden rounded-full bg-cyan-200/[0.08]"
        >
          <div className="h-full w-20 animate-loader-slide rounded-full bg-gradient-to-r from-transparent via-brand-400 to-brand-200 shadow-[0_0_14px_#22d3ee]" />
        </div>
      </div>
    </div>
  );
}
