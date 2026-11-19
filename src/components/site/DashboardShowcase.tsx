"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  SECURITY_PRESETS,
  computeSecurityScore,
  createDefaultGuildConfig,
  type SecurityPresetId,
} from "@/lib/guild-config";
import { THEME_PRESETS, type ThemePresetId } from "@/lib/site-config";
import { useSiteConfig } from "@/components/site/SiteConfigProvider";
import { Reveal } from "@/components/ui/Reveal";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import {
  ArrowRight,
  CheckIcon,
  DownloadIcon,
  PaletteIcon,
  ShieldIcon,
  SparklesIcon,
  TerminalIcon,
} from "@/components/ui/Icons";

export function DashboardShowcase() {
  const { config, setLiveConfig } = useSiteConfig();
  const [presetId, setPresetId] = useState<SecurityPresetId>("fortress");

  const activePreset =
    SECURITY_PRESETS.find((p) => p.id === presetId) ?? SECURITY_PRESETS[0];

  const simulated = useMemo(
    () => activePreset.apply(createDefaultGuildConfig()),
    [activePreset],
  );
  const posture = useMemo(() => computeSecurityScore(simulated), [simulated]);

  const themeSwatches = THEME_PRESETS.slice(0, 7);

  const handlePreviewTheme = (themePreset: ThemePresetId) => {
    setLiveConfig({
      ...config,
      themePreset,
    });
  };

  return (
    <section id="showcase" className="relative py-20 sm:py-28">
      <div className="container-x">
        <Reveal className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="eyebrow">Web Control Plane</p>
            <h2 className="mt-5 font-display text-[32px] font-bold leading-[1.05] tracking-tight text-white sm:text-[48px]">
              Switch security posture{" "}
              <span className="text-gradient-brand">in a single click.</span>
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-zinc-400">
              Select a profile below to preview how the LightCore dashboard
              tunes Anti-Nuke rate gates, AutoMod sanctions, Verification, and
              audit streams in real time — or open the full interactive sandbox.
            </p>
          </div>

          {/* Live Theme Accent Switcher */}
          <div className="inline-flex flex-wrap items-center gap-2.5 rounded-2xl border border-white/[0.08] bg-ink-900/80 px-4 py-2.5 backdrop-blur-xl">
            <PaletteIcon className="size-4 text-brand-400" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
              Live Accent
            </span>
            <div className="flex items-center gap-1.5 pl-1">
              {themeSwatches.map((t) => {
                const selected = config.themePreset === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    title={`Switch accent: ${t.name}`}
                    aria-label={`Switch theme to ${t.name}`}
                    onClick={() => handlePreviewTheme(t.id)}
                    style={{ backgroundColor: t.swatch }}
                    className={`size-5 rounded-full transition-transform duration-200 hover:scale-110 ${
                      selected
                        ? "scale-110 ring-2 ring-white ring-offset-2 ring-offset-ink-950"
                        : "opacity-75 hover:opacity-100"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </Reveal>

        <Reveal delay={90} className="mt-10">
          <SpotlightCard className="overflow-hidden rounded-[28px] border-brand-500/28 shadow-[0_36px_100px_-34px_rgba(0,0,0,0.98)]">
            <div
              aria-hidden
              className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-brand-500 to-transparent"
            />

            {/* Mock Browser / Control Plane Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.075] bg-black/55 px-5 py-3.5">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-brand-500" />
                  <span className="size-2.5 rounded-full bg-white/12" />
                  <span className="size-2.5 rounded-full bg-white/12" />
                </span>
                <span className="font-mono text-[11px] text-zinc-400">
                  lightcore / dashboard /{" "}
                  <strong className="text-white">sanctuary-hq</strong>
                </span>
              </div>

              <div className="flex items-center gap-2 font-mono text-[10px]">
                <span className="hidden items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-zinc-400 sm:inline-flex">
                  <DownloadIcon className="size-3 text-brand-400" />
                  JSON Backup
                </span>
                <span className="hidden items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-zinc-400 sm:inline-flex">
                  <TerminalIcon className="size-3 text-brand-400" />
                  CLI Sync
                </span>
                <Link
                  href="/dashboard/demo"
                  className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/45 bg-brand-600/20 px-3 py-1 font-semibold text-brand-200 transition hover:bg-brand-600/35 hover:text-white"
                >
                  <SparklesIcon className="size-3 text-brand-300" />
                  Launch Full Demo →
                </Link>
              </div>
            </div>

            <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-12">
              {/* Preset Selector Cards */}
              <div className="space-y-2.5 lg:col-span-5">
                <p className="font-mono text-[9.5px] uppercase tracking-[0.24em] text-zinc-500">
                  Choose Protection Profile
                </p>
                {SECURITY_PRESETS.map((preset) => {
                  const active = preset.id === presetId;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setPresetId(preset.id)}
                      className={`w-full rounded-2xl border p-4 text-left transition-all duration-200 ${
                        active
                          ? "border-brand-500/55 bg-gradient-to-r from-brand-950/75 to-ink-900 text-white shadow-[0_14px_38px_-20px_rgb(var(--brand-500)/0.8)]"
                          : "border-white/[0.07] bg-black/45 text-zinc-300 hover:border-white/[0.16] hover:text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display text-[15px] font-semibold">
                          {preset.name}
                        </span>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider ${
                            active
                              ? "border-brand-400/50 bg-brand-500/20 text-brand-200"
                              : "border-white/10 bg-white/[0.03] text-zinc-500"
                          }`}
                        >
                          {preset.badge}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[12px] leading-relaxed text-zinc-400">
                        {preset.summary}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Live Resulting Server State */}
              <div className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-black/55 p-5 sm:p-6 lg:col-span-7">
                <div>
                  {/* Score Header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] pb-5">
                    <div>
                      <p className="font-mono text-[9.5px] uppercase tracking-[0.24em] text-brand-400">
                        Computed Security Posture
                      </p>
                      <div className="mt-1.5 flex items-baseline gap-3">
                        <span className="font-display text-[40px] font-bold leading-none text-white">
                          {posture.score}
                          <span className="text-[18px] font-medium text-zinc-500">
                            /100
                          </span>
                        </span>
                        <span className="rounded-lg border border-emerald-500/35 bg-emerald-500/15 px-2.5 py-1 font-mono text-[11px] font-bold text-emerald-300">
                          Grade {posture.grade} · {posture.label}
                        </span>
                      </div>
                    </div>
                    <ShieldIcon className="size-9 text-brand-400 opacity-85" />
                  </div>

                  {/* Animated Score Bar */}
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.07]">
                    <div
                      style={{ width: `${posture.score}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-brand-600 via-brand-400 to-emerald-400 transition-all duration-500"
                    />
                  </div>

                  {/* Live Resulting Config Matrix */}
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {[
                      {
                        k: "Anti-Nuke Sanction",
                        v: `${simulated.antinuke.punishment.replace("_", " ").toUpperCase()} + Rollback`,
                        sub: `Limit ${simulated.antinuke.rules.antiChannelDelete.limit} ch_del / ${simulated.antinuke.rules.antiChannelDelete.windowSec}s`,
                      },
                      {
                        k: "AutoMod Firewall",
                        v: simulated.automod.punishment
                          .replace("_", " ")
                          .toUpperCase(),
                        sub: `Spam ${simulated.automod.antiSpam.maxMessages}/${simulated.automod.antiSpam.windowSec}s · Token ≤${simulated.automod.antiTokenSpam.joinRateLimit}/10s`,
                      },
                      {
                        k: "Member Verification",
                        v: simulated.verification.enabled
                          ? `${simulated.verification.mode.toUpperCase()} GATE`
                          : "OPEN ENTRY",
                        sub: simulated.verification.enabled
                          ? `Min account age: ${simulated.verification.minAccountAgeDays} days`
                          : "Zero-friction hangout access",
                      },
                      {
                        k: "Overnight & Suites",
                        v: simulated.nightmode.enabled
                          ? `NIGHT LOCK ${simulated.nightmode.startTime}–${simulated.nightmode.endTime}`
                          : simulated.voicemaster.enabled
                            ? "VOICEMASTER + GREETS"
                            : "6-STREAM AUDIT LOGS",
                        sub: simulated.antinuke.vanityGuard
                          ? "Vanity Guard & Anti-Betray ON"
                          : "Scoped staff whitelists active",
                      },
                    ].map((row) => (
                      <div
                        key={row.k}
                        className="rounded-xl border border-white/[0.07] bg-ink-900/75 p-3.5"
                      >
                        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">
                          {row.k}
                        </p>
                        <p className="mt-1 font-display text-[14px] font-semibold text-white">
                          {row.v}
                        </p>
                        <p className="mt-0.5 font-mono text-[10px] text-zinc-400">
                          {row.sub}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Row */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-4">
                  <div className="flex flex-wrap items-center gap-3 text-[12px] text-zinc-400">
                    <span className="inline-flex items-center gap-1.5">
                      <CheckIcon className="size-3.5 text-emerald-400" />
                      Embed Studio included
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CheckIcon className="size-3.5 text-emerald-400" />
                      No sign-in needed to test
                    </span>
                  </div>
                  <Link
                    href="/dashboard/demo"
                    className="btn-primary group inline-flex h-10 items-center gap-2 rounded-xl px-4 text-[12.5px] font-semibold text-white"
                  >
                    Open 12-Module Demo
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </div>
          </SpotlightCard>
        </Reveal>
      </div>
    </section>
  );
}
