import Image from "next/image";
import { voiceCards } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";
import { VoiceIcon, CheckIcon, PlusIcon } from "@/components/ui/Icons";
import { FancyName } from "@/components/site/FancyName";

function VoicePanelMock() {
  return (
    <div className="panel panel-inner overflow-hidden rounded-2xl shadow-panel">
      <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
        <div className="flex items-center gap-2">
          <VoiceIcon className="size-3.5 text-brand-400" />
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-400">
            voicemaster
          </span>
        </div>
        <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-emerald-400">
          ready
        </span>
      </div>

      <div className="p-4">
        <p className="font-mono text-[9.5px] uppercase tracking-[0.24em] text-zinc-500">
          Voice Channels
        </p>

        <div className="mt-2.5 space-y-1.5">
          <div className="flex items-center gap-2 rounded-lg border border-white/[0.05] bg-white/[0.02] px-2.5 py-2">
            <PlusIcon className="size-3.5 text-zinc-500" />
            <span className="text-[12px] text-zinc-400">Join to Create</span>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-brand-600/25 bg-brand-950/30 px-2.5 py-2">
            <VoiceIcon className="size-3.5 text-brand-400" />
            <FancyName height={12} />
            <span className="text-[12px] font-medium text-white">
              &apos;s channel
            </span>
            <span className="ml-auto flex items-center gap-1 font-mono text-[9px] text-zinc-500">
              <span className="size-1.5 rounded-full bg-emerald-400" />3
            </span>
          </div>

          <div className="space-y-1 pl-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2 py-1">
                <span className="relative size-5 shrink-0 overflow-hidden rounded-full ring-1 ring-white/10">
                  <Image
                    src="/brand/lightcore-512.png"
                    alt=""
                    width={20}
                    height={20}
                    className="size-full object-cover opacity-70"
                  />
                </span>
                <span className="text-[11.5px] text-zinc-400">
                  member_0{i}
                </span>
                <span className="ml-auto font-mono text-[9px] text-zinc-600">
                  {i === 3 ? "muted" : "vc"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-white/[0.06] bg-ink-950/60 p-2.5 font-mono text-[10.5px] leading-relaxed">
          <p className="text-zinc-500">
            <span className="text-brand-400">/voicemaster</span> setup
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-emerald-400/90">
            <CheckIcon className="size-3" /> Configured server
          </p>
          <p className="flex items-center gap-1.5 text-emerald-400/90">
            <CheckIcon className="size-3" /> Configured channels
          </p>
          <p className="mt-1 text-zinc-400">Voicemaster Setup Complete</p>
        </div>
      </div>
    </div>
  );
}

function MemberCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.035] to-white/[0.01] p-4">
      <div className="flex items-center gap-3">
        <span className="relative size-10 shrink-0 overflow-hidden rounded-full ring-2 ring-brand-600/40">
          <Image
            src="/brand/lightcore-512.png"
            alt=""
            width={40}
            height={40}
            className="size-full object-cover"
          />
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-[13.5px] font-medium text-white">
            <FancyName height={13} />
          </p>
          <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-emerald-400/80">
            channel owner
          </p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {["lock", "limit", "rename"].map((c) => (
          <span
            key={c}
            className="rounded border border-white/[0.06] bg-white/[0.02] py-1 text-center font-mono text-[9px] uppercase tracking-wider text-zinc-500"
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

export function VoiceMaster() {
  return (
    <section id="voicemaster" className="relative py-20 sm:py-28">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-center">
          <div>
            <Reveal>
              <p className="eyebrow">Voice</p>
              <h2 className="mt-4 max-w-xl font-display text-[32px] font-semibold leading-[1.08] tracking-tight text-white sm:text-[46px]">
                Personal channels with{" "}
                <span className="text-gradient-brand">Voicemaster</span>
              </h2>
              <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-zinc-400">
                Temporary personalized voice channels for your community.
              </p>
            </Reveal>

            <div className="mt-9 space-y-3">
              {voiceCards.map((c, i) => (
                <Reveal
                  key={c.kicker}
                  delay={i * 80}
                  className="group flex gap-4 rounded-xl border border-white/[0.07] bg-white/[0.018] p-4 transition-colors duration-300 hover:border-white/[0.14] hover:bg-white/[0.035]"
                >
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-ink-900 font-mono text-[10px] text-brand-400">
                    0{i + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-[15px] font-semibold tracking-tight text-white">
                      {c.kicker}
                    </h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-zinc-400">
                      {c.title}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={120} className="relative">
            <div className="absolute -inset-8 rounded-full bg-[radial-gradient(closest-side,rgba(239,16,16,0.14),transparent)] blur-2xl" />
            <div className="relative space-y-3">
              <VoicePanelMock />
              <MemberCard />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
