import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageBackground } from "@/components/site/Background";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Logo, Wordmark } from "@/components/ui/Logo";
import { CheckIcon, LockIcon } from "@/components/ui/Icons";
import { site } from "@/lib/site";
import { DiscordLoginButton, LoginNotice } from "./LoginNotice";

export const metadata: Metadata = {
  title: "Dashboard Sign In",
  description: `Sign in with Discord to manage server security, AutoMod, VoiceMaster rooms, and tickets with ${site.name}.`,
};

const BENEFITS = [
  "Instant sync with all Discord servers where you have Manage permissions",
  "One-click Anti-Nuke protection with automatic channel & role rollback",
  "Dynamic VoiceMaster temporary channels & custom support ticket panels",
  "Automated moderation, phishing link firewall & verification gates",
];

export default function LoginPage() {
  return (
    <>
      <PageBackground />
      <Navbar />
      <main className="relative min-h-[calc(100vh-80px)] pt-32 pb-24 sm:pt-40 sm:pb-32 flex items-center justify-center">
        {/* Soft centered golden aura */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl opacity-60"
          style={{
            background:
              "radial-gradient(closest-side, rgb(var(--brand-400) / 0.22), rgb(var(--brand-600) / 0.08) 55%, transparent 100%)",
          }}
        />

        <div className="container-x relative w-full max-w-xl">
          <div className="animate-hero-in">
            <div className="glass-card relative overflow-hidden rounded-[36px] p-8 sm:p-11 shadow-[0_24px_70px_-20px_rgba(0,0,0,0.85)]">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/70 to-transparent"
              />

              {/* Header: Logo + Brand */}
              <div className="flex flex-col items-center text-center">
                <Link
                  href="/"
                  aria-label={`${site.name} home`}
                  className="group relative flex size-20 items-center justify-center rounded-[26px] border border-brand-400/35 bg-black p-1.5 shadow-[0_0_40px_-10px_rgb(var(--brand-400)/0.6)] transition-transform duration-300 hover:scale-105"
                >
                  <Logo size={62} />
                </Link>

                <p className="mt-5 font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-brand-300">
                  Web Dashboard
                </p>
                <h1 className="mt-1 font-display text-[28px] font-bold tracking-tight text-white sm:text-[32px]">
                  Sign in to <Wordmark />
                </h1>
                <p className="mt-3 max-w-md text-[14px] leading-relaxed text-zinc-300">
                  Connect your Discord account to manage servers, configure anti-nuke
                  shields, automate moderation, and control tickets in real time.
                </p>
              </div>

              {/* Login Button & Dynamic Notices */}
              <Suspense fallback={null}>
                <LoginNotice />
              </Suspense>

              <Suspense
                fallback={
                  <div className="mt-7 w-full">
                    <form method="POST" action="/api/auth/discord">
                      <button
                        type="submit"
                        className="btn-primary flex h-[54px] w-full items-center justify-center gap-2.5 rounded-full text-[15px] font-semibold"
                      >
                        Sign in with Discord
                      </button>
                    </form>
                  </div>
                }
              >
                <DiscordLoginButton />
              </Suspense>

              {/* Trust & Features Checklist */}
              <div className="mt-8 border-t border-white/[0.08] pt-6">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                  What you can do with LightCore
                </p>
                <ul className="mt-3.5 space-y-2.5 text-[12.5px] leading-relaxed text-zinc-300">
                  {BENEFITS.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-brand-400/15 text-brand-300">
                        <CheckIcon className="size-2.5" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Subtle footer guarantee */}
              <div className="mt-7 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-5 text-[12px] text-zinc-400">
                <span className="inline-flex items-center gap-1.5 text-zinc-300">
                  <LockIcon className="size-3.5 text-emerald-400" />
                  Encrypted Discord OAuth 2.0 Session
                </span>
                <div className="flex items-center gap-3">
                  <Link
                    href="/terms"
                    className="hover:text-white transition-colors"
                  >
                    Terms
                  </Link>
                  <span className="text-zinc-600">·</span>
                  <Link
                    href="/privacy"
                    className="hover:text-white transition-colors"
                  >
                    Privacy
                  </Link>
                  <span className="text-zinc-600">·</span>
                  <Link
                    href="/security"
                    className="hover:text-brand-300 transition-colors"
                  >
                    Security
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
