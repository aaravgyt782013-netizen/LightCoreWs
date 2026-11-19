import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageBackground } from "@/components/site/Background";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Logo, Wordmark } from "@/components/ui/Logo";
import { CheckIcon, LockIcon, ShieldIcon } from "@/components/ui/Icons";
import { site } from "@/lib/site";
import { DiscordLoginButton, LoginNotice } from "./LoginNotice";

export const metadata: Metadata = {
  title: "Sign in with Discord",
  description: `Sign in to the ${site.name} server management dashboard using official Discord OAuth2 (identify, guilds & guilds.join).`,
  robots: { index: false, follow: false },
};

const REQUESTED_SCOPES = [
  {
    scope: "identify",
    mode: "Profile ID",
    desc: "Reads your public Discord user ID, display name, and avatar to identify your session.",
  },
  {
    scope: "guilds",
    mode: "Server List",
    desc: "Lists your Discord servers and checks Manage Server / Administrator permissions so you can configure LightCore.",
  },
  {
    scope: "guilds.join",
    mode: "Auto-Join",
    desc: "Automatically adds your account to our official LightCore Discord server when you authorize.",
  },
];

const NEVER_REQUESTED = [
  "Never asks for your Discord password, 2FA code, phone number, or card details",
  "Never reads your email address, direct messages, or friends list",
  "Uses only Discord's official OAuth2 authorization screen on discord.com",
  "Never stores raw OAuth tokens in any database — revocable anytime in Discord",
];

export default function LoginPage() {
  return (
    <>
      <PageBackground />
      <Navbar />
      <main className="relative pt-28 pb-20 sm:pt-36 sm:pb-28">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-40 h-[440px] w-[620px] -translate-x-1/2 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgb(var(--brand-600) / 0.18), rgb(var(--brand-900) / 0.06) 58%, transparent 100%)",
          }}
        />

        <div className="container-x relative">
          <div className="mx-auto grid max-w-5xl items-start gap-8 lg:grid-cols-12">
            {/* Primary Sign-In Card */}
            <div className="animate-hero-in lg:col-span-6">
              <div className="glass-card relative overflow-hidden rounded-[28px] p-7 sm:p-9">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-8 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-brand-500 to-transparent"
                />

                <div className="flex items-center gap-4">
                  <Link
                    href="/"
                    aria-label={`${site.name} home`}
                    className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-brand-500/35 bg-black/75 p-1.5 shadow-[0_0_36px_-8px_rgb(var(--brand-500)/0.6)]"
                  >
                    <Logo size={42} className="size-10 rounded-xl" />
                  </Link>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-brand-300">
                      Server Control Plane
                    </p>
                    <h1 className="mt-0.5 font-display text-[22px] font-bold tracking-[0.14em] text-white">
                      <Wordmark />
                    </h1>
                  </div>
                </div>

                <p className="mt-5 text-[14px] leading-relaxed text-zinc-300">
                  Sign in via official{" "}
                  <strong className="font-semibold text-white">
                    Discord OAuth2
                  </strong>{" "}
                  to configure Anti-Nuke, AutoMod, VoiceMaster, Tickets, and
                  custom embeds across the servers you manage.
                </p>

                {/* Official redirect verification pill */}
                <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.06] px-3.5 py-2.5">
                  <LockIcon className="size-4 shrink-0 text-emerald-400" />
                  <p className="font-mono text-[11px] text-emerald-200">
                    Redirects only to{" "}
                    <span className="font-semibold text-white">
                      https://discord.com/oauth2/authorize
                    </span>
                  </p>
                </div>

                <Suspense fallback={null}>
                  <LoginNotice />
                </Suspense>

                <Suspense
                  fallback={
                    <div className="mt-6 space-y-3">
                      <a
                        href="/api/auth/discord"
                        className="btn-primary flex h-[52px] w-full items-center justify-center gap-2.5 rounded-2xl text-[14.5px] font-semibold text-white"
                      >
                        Continue with Discord OAuth2
                      </a>
                      <Link
                        href="/dashboard/demo"
                        className="flex h-11 w-full items-center justify-center rounded-2xl border border-white/[0.11] bg-ink-950/75 text-[13px] font-medium text-zinc-200"
                      >
                        Explore Interactive Demo (No Sign-In)
                      </Link>
                    </div>
                  }
                >
                  <DiscordLoginButton />
                </Suspense>

                <div className="mt-6 border-t border-white/[0.07] pt-4 text-[11.5px] leading-relaxed text-zinc-500">
                  <p>
                    {site.name} is an independent Discord bot &amp; dashboard
                    and is not affiliated with or endorsed by Discord Inc.
                  </p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10.5px]">
                    <Link
                      href="/security"
                      className="text-brand-300 hover:text-white"
                    >
                      OAuth2 &amp; Security
                    </Link>
                    <Link
                      href="/privacy"
                      className="text-zinc-400 hover:text-white"
                    >
                      Privacy Policy
                    </Link>
                    <Link
                      href="/terms"
                      className="text-zinc-400 hover:text-white"
                    >
                      Terms of Service
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Least-Privilege Permission Transparency */}
            <div className="space-y-4 lg:col-span-6">
              <div className="panel rounded-3xl p-6 sm:p-7">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 items-center justify-center rounded-xl border border-brand-500/35 bg-brand-950/60 text-brand-300">
                    <ShieldIcon className="size-4" />
                  </span>
                  <div>
                    <h2 className="font-display text-[16px] font-semibold text-white">
                      Exact OAuth2 Permissions Requested
                    </h2>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                      Official Discord OAuth2 · 3 standard scopes
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {REQUESTED_SCOPES.map((item) => (
                    <div
                      key={item.scope}
                      className="rounded-2xl border border-white/[0.08] bg-ink-950/75 p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <code className="rounded-md border border-brand-500/30 bg-brand-950/50 px-2 py-0.5 font-mono text-[12px] font-medium text-brand-200">
                          {item.scope}
                        </code>
                        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-emerald-300">
                          {item.mode}
                        </span>
                      </div>
                      <p className="mt-2 text-[12.5px] leading-relaxed text-zinc-400">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel rounded-3xl p-6 sm:p-7">
                <h2 className="font-display text-[15px] font-semibold text-white">
                  Zero-Credential &amp; Anti-Abuse Guarantees
                </h2>
                <ul className="mt-3.5 space-y-2.5">
                  {NEVER_REQUESTED.map((line) => (
                    <li
                      key={line}
                      className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-zinc-400"
                    >
                      <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-emerald-500/35 bg-emerald-500/10 text-emerald-300">
                        <CheckIcon className="size-2.5" />
                      </span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-[11.5px] text-zinc-500">
                  Revoke access at any time from{" "}
                  <span className="text-zinc-300">
                    Discord User Settings → Authorized Apps → {site.name}
                  </span>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
