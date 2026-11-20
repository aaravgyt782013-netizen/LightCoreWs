"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  SECURITY_PRESETS,
  createDefaultGuildConfig,
  type SecurityPresetId,
} from "@/lib/guild-config";
import { Reveal } from "@/components/ui/Reveal";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { ArrowRight, CheckIcon } from "@/components/ui/Icons";
import { site } from "@/lib/site";

const PUNISHMENT_FRIENDLY: Record<string, string> = {
  ban: "Auto-ban rogue actor",
  kick: "Remove from server",
  strip_roles: "Remove staff permissions",
  quarantine: "Move to safe quarantine",
};

const AUTOMOD_FRIENDLY: Record<string, string> = {
  warn: "Gentle warning",
  delete: "Delete message",
  timeout_5m: "5-minute timeout",
  timeout_1h: "1-hour timeout",
  kick: "Remove spammer",
  ban: "Ban spammer",
};

const VERIFY_FRIENDLY: Record<string, string> = {
  button: "One-click button",
  captcha: "Simple image check",
  reaction: "Emoji tap",
};

export function DashboardShowcase() {
  const [presetId, setPresetId] = useState<SecurityPresetId>("balanced");

  const activePreset =
    SECURITY_PRESETS.find((p) => p.id === presetId) ?? SECURITY_PRESETS[0];

  const simulated = useMemo(
    () => activePreset.apply(createDefaultGuildConfig()),
    [activePreset],
  );

  const activeRules = Object.values(simulated.antinuke.rules).filter(
    (r) => r.enabled,
  ).length;

  const summaryRows = [
    {
      label: "Server Protection",
      value: `${activeRules} of 14 guards on · ${
        PUNISHMENT_FRIENDLY[simulated.antinuke.punishment] || "Active"
      }`,
      active: simulated.antinuke.enabled,
    },
    {
      label: "Chat Auto-Mod",
      value: simulated.automod.enabled
        ? `Spam & scam filter · ${
            AUTOMOD_FRIENDLY[simulated.automod.punishment] || "Active"
          }`
        : "Off",
      active: simulated.automod.enabled,
    },
    {
      label: "New Member Check",
      value: simulated.verification.enabled
        ? `${VERIFY_FRIENDLY[simulated.verification.mode] || "Button"} · ${
            simulated.verification.minAccountAgeDays
          }+ day accounts`
        : "Optional",
      active: simulated.verification.enabled,
    },
    {
      label: "Channel & Role Recovery",
      value: simulated.antinuke.autoRollback
        ? "Automatic instant restore"
        : "Manual only",
      active: simulated.antinuke.autoRollback,
    },
    {
      label: "Community Extras",
      value: [
        simulated.voicemaster.enabled && "VoiceMaster",
        simulated.tickets.enabled && "Tickets",
        simulated.welcomer.enabled && "Welcomes",
        simulated.logging.enabled && "Activity Logs",
      ]
        .filter(Boolean)
        .join(" · "),
      active: true,
    },
  ];

  return (
    <section id="showcase" className="relative py-24 sm:py-32">
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Effortless Dashboard</p>
          <h2 className="mt-5 font-display text-[32px] font-bold leading-[1.08] tracking-[-0.02em] text-white sm:text-[46px]">
            Pick your vibe.{" "}
            <span className="text-gradient-brand">Done in one click.</span>
          </h2>
          <p className="mt-4 text-balance text-[15.5px] leading-relaxed text-zinc-400">
            No complicated forms or confusing commands. Choose a ready-made
            server preset or fine-tune any toggle cleanly from your browser.
          </p>
        </Reveal>

        <Reveal delay={90} className="mt-12">
          <SpotlightCard className="overflow-hidden rounded-[32px]">
            <div
              aria-hidden
              className="h-px w-full bg-gradient-to-r from-transparent via-brand-300/60 to-transparent"
            />

            {/* Soft Plush Window Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] bg-black/40 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-brand-400" />
                  <span className="size-2.5 rounded-full bg-white/[0.12]" />
                  <span className="size-2.5 rounded-full bg-white/[0.12]" />
                </span>
                <span className="text-[12.5px] text-zinc-400">
                  LightCore Dashboard ·{" "}
                  <strong className="font-medium text-zinc-100">
                    Your Community
                  </strong>
                </span>
              </div>

              <Link
                href={site.dashboard}
                className="group inline-flex items-center gap-1.5 rounded-full border border-brand-400/25 bg-brand-400/[0.09] px-4 py-1.5 text-[12px] font-medium text-brand-200 transition-all duration-300 ease-smooth hover:border-brand-300/45 hover:bg-brand-400/[0.16] hover:text-brand-50"
              >
                <span>Live Dashboard</span>
                <ArrowRight className="size-3 transition-transform duration-300 ease-smooth group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-12 lg:gap-8">
              {/* Left: Preset Cards */}
              <div className="space-y-2.5 lg:col-span-5">
                <p className="px-1 text-[11.5px] font-medium text-zinc-400">
                  One-click server presets
                </p>
                {SECURITY_PRESETS.map((preset) => {
                  const active = preset.id === presetId;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setPresetId(preset.id)}
                      aria-pressed={active}
                      className={`group w-full rounded-[22px] border p-4 text-left transition-all duration-300 ease-smooth active:scale-[0.99] ${
                        active
                          ? "border-brand-400/35 bg-gradient-to-br from-brand-400/[0.12] via-ink-900/90 to-ink-950 shadow-[0_20px_50px_-28px_rgb(var(--brand-400)/0.45)]"
                          : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.035]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display text-[15px] font-semibold text-white">
                          {preset.name}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-medium ${
                            active
                              ? "bg-brand-400 text-brand-ink"
                              : "bg-white/[0.06] text-zinc-400"
                          }`}
                        >
                          {preset.badge}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[12.5px] leading-relaxed text-zinc-400">
                        {preset.summary}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Right: Clean, Plain-English Summary */}
              <div
                key={activePreset.id}
                className="animate-log-in flex flex-col justify-between rounded-[26px] border border-white/[0.065] bg-black/40 p-5 sm:p-6 lg:col-span-7"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-brand-300">
                        What&apos;s Included
                      </p>
                      <h3 className="mt-1 font-display text-[22px] font-bold text-white">
                        {activePreset.name}
                      </h3>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[11.5px] font-medium text-emerald-300">
                      <CheckIcon className="size-3.5" />
                      Saves instantly
                    </span>
                  </div>

                  <div className="mt-5 space-y-2.5">
                    {summaryRows.map((row) => (
                      <div
                        key={row.label}
                        className="flex flex-col justify-between gap-1 rounded-2xl border border-white/[0.055] bg-white/[0.025] px-4 py-3 sm:flex-row sm:items-center"
                      >
                        <span className="flex items-center gap-2.5 text-[13px] font-medium text-zinc-200">
                          <span
                            className={`size-2 rounded-full ${
                              row.active
                                ? "bg-brand-400 shadow-[0_0_8px_rgb(var(--brand-300))]"
                                : "bg-zinc-600"
                            }`}
                          />
                          {row.label}
                        </span>
                        <span className="text-[12.5px] text-zinc-400 sm:text-right">
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/[0.06] pt-5">
                  <Link
                    href={site.dashboard}
                    className="btn-primary btn-glow relative inline-flex h-11 items-center gap-2 overflow-hidden rounded-full px-6 text-[13.5px] font-semibold hover:-translate-y-0.5 active:scale-[0.985]"
                  >
                    <span className="relative z-10">Manage in Dashboard</span>
                    <ArrowRight className="relative z-10 size-3.5" />
                  </Link>
                  <Link
                    href="/docs"
                    className="btn-soft inline-flex h-11 items-center gap-2 px-5 text-[13px] font-medium active:scale-[0.985]"
                  >
                    Browse All Commands
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
