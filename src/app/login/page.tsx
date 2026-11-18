import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageBackground } from "@/components/site/Background";
import { Logo, Wordmark } from "@/components/ui/Logo";
import { site } from "@/lib/site";
import { DiscordLoginButton, LoginNotice } from "./LoginNotice";

export const metadata: Metadata = {
  title: "Dashboard",
  description: `Continue with Discord to manage your ${site.name} servers.`,
};

export default function LoginPage() {
  return (
    <>
      <PageBackground />
      <main className="relative flex min-h-screen items-center justify-center px-5 py-16">
        {/* Soft focused crimson stage glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[540px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgb(var(--brand-600) / 0.2), rgb(var(--brand-900) / 0.08) 55%, transparent 100%)",
          }}
        />

        <div className="animate-hero-in relative w-full max-w-[396px]">
          <div className="glass-card relative overflow-hidden rounded-[26px] p-8 text-center sm:p-10">
            {/* Precision top crimson laser filament */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-8 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-brand-500 to-transparent"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 left-1/2 size-60 -translate-x-1/2 rounded-full"
              style={{
                background:
                  "radial-gradient(closest-side, rgb(var(--brand-500) / 0.24), transparent)",
              }}
            />

            <div className="relative flex flex-col items-center">
              <Link
                href="/"
                aria-label={`${site.name} home`}
                className="group relative flex size-16 items-center justify-center rounded-2xl border border-brand-500/35 bg-black/70 p-2 shadow-[0_0_40px_-8px_rgb(var(--brand-500)/0.65)] transition-transform duration-300 ease-smooth hover:scale-105"
              >
                <Logo size={48} className="size-12 rounded-xl" />
              </Link>

              <h1 className="mt-6 font-display text-[22px] font-bold tracking-[0.18em] text-white">
                <Wordmark />
              </h1>

              <p className="mt-2.5 text-[13.5px] leading-relaxed text-zinc-400">
                Sign in with Discord to manage your servers.
              </p>

              <Suspense fallback={null}>
                <LoginNotice />
              </Suspense>

              <Suspense
                fallback={
                  <a
                    href="/api/auth/discord"
                    className="btn-primary mt-7 flex h-[52px] w-full items-center justify-center gap-2.5 rounded-2xl text-[14.5px] font-semibold text-white"
                  >
                    Login with Discord
                  </a>
                }
              >
                <DiscordLoginButton />
              </Suspense>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.22em] text-zinc-500 transition-colors duration-200 hover:text-zinc-200"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
