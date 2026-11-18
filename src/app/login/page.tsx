import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageBackground } from "@/components/site/Background";
import { Logo, Wordmark } from "@/components/ui/Logo";
import { DiscordIcon, ShieldIcon, CheckIcon } from "@/components/ui/Icons";
import { site } from "@/lib/site";
import { LoginNotice, LoginQuickActions } from "./LoginNotice";

export const metadata: Metadata = {
  title: "Server Dashboard Portal",
  description: `Access your ${site.name} server management dashboard using official Discord OAuth2 authorization.`,
};

const portalHighlights = [
  "Official OAuth2 redirect on discord.com — we never ask for your password",
  "Configure Anti-Nuke, AutoMod, VoiceMaster, Tickets, and server logs",
  "No downloads, extensions, or payment details required on this website",
];

export default function LoginPage() {
  return (
    <>
      <PageBackground />
      <main className="relative flex min-h-screen items-center justify-center px-5 py-16">
        <div className="w-full max-w-[440px]">
          <Link
            href="/"
            className="group mb-8 flex items-center justify-center gap-3"
          >
            <Logo size={38} />
            <span className="flex flex-col leading-none">
              <span className="font-display text-[17px] font-bold tracking-[0.17em] text-white">
                <Wordmark />
              </span>
              <span className="mt-1 font-mono text-[8px] uppercase tracking-[0.36em] text-brand-400">
                Server Control Center
              </span>
            </span>
          </Link>

          <div className="panel panel-inner relative overflow-hidden rounded-2xl border-brand-500/20 p-7 shadow-panel">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-brand-500/85 to-transparent"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 left-1/2 size-64 -translate-x-1/2 rounded-full"
              style={{
                background:
                  "radial-gradient(closest-side, rgb(var(--brand-600) / 0.26), transparent)",
              }}
            />

            <div className="relative">
              <p className="font-mono text-[9.5px] uppercase tracking-[0.26em] text-brand-400">
                {site.name} Web Portal
              </p>
              <h1 className="mt-2 font-display text-[25px] font-bold tracking-tight text-white">
                Manage Your Servers
              </h1>
              <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">
                Connect via official Discord OAuth2 to configure your{" "}
                {site.name} protection modules, whitelists, and audit streams.
              </p>

              <Suspense fallback={null}>
                <LoginNotice />
              </Suspense>

              <a
                href="/api/auth/discord"
                className="btn-glow relative mt-6 flex h-12 w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 text-[14px] font-semibold text-white shadow-[0_12px_36px_-10px_rgb(var(--brand-500)/0.85)] transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0"
              >
                <DiscordIcon className="size-[18px]" />
                Authorize via Discord OAuth2
              </a>

              <div className="mt-4 rounded-xl border border-white/[0.07] bg-black/50 px-3.5 py-3">
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-500">
                  security &amp; privacy guarantee
                </p>
                <ul className="mt-2 space-y-1.5">
                  {portalHighlights.map((p) => (
                    <li
                      key={p}
                      className="flex items-start gap-2 text-[11.5px] leading-snug text-zinc-300"
                    >
                      <CheckIcon className="mt-0.5 size-3 shrink-0 text-brand-400" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-white/10" />
                <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-zinc-500">
                  quick actions
                </span>
                <span className="h-px flex-1 bg-white/10" />
              </div>

              <LoginQuickActions />

              <p className="mt-5 flex items-start gap-2 text-[11px] leading-relaxed text-zinc-500">
                <ShieldIcon className="mt-px size-3.5 shrink-0 text-brand-500/80" />
                <span>
                  {site.name} (App ID{" "}
                  <code className="font-mono text-zinc-400">
                    {site.clientId}
                  </code>
                  ) is an independent bot project, not affiliated with Discord
                  Inc.{" "}
                  <Link
                    href="/privacy"
                    className="text-zinc-400 underline decoration-zinc-700 underline-offset-2 hover:text-white"
                  >
                    Privacy
                  </Link>{" "}
                  ·{" "}
                  <Link
                    href="/admin"
                    className="text-brand-400 hover:text-brand-300"
                  >
                    Owner Panel →
                  </Link>
                </span>
              </p>
            </div>
          </div>

          <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            <Link href="/" className="transition-colors hover:text-white">
              ← back to {site.name} home
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
