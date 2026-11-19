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
  title: "Dashboard Authorization",
  description: `Connect your Discord account via standard OAuth 2.0 to manage your servers with ${site.name}, an independent Discord bot service.`,
};

const REQUESTED_SCOPES = [
  {
    scope: "identify",
    mode: "Profile ID",
    desc: "Reads your public Discord user ID, display name, and avatar to identify your dashboard session.",
  },
  {
    scope: "guilds",
    mode: "Server List",
    desc: "Lists your Discord servers and checks Manage Server / Administrator permissions so you can configure LightCore.",
  },
  {
    scope: "guilds.join",
    mode: "Optional Join",
    desc: "Adds your account to our official LightCore community Discord server when the checkbox is kept enabled.",
  },
];

const SAFEGUARDS = [
  "Standard OAuth 2.0 redirect hosted directly by Discord (https://discord.com/oauth2/authorize)",
  "No login forms, personal contact fields, or billing fields anywhere on this website",
  "Does not request email address, direct messages, or friends list access",
  "Signed HttpOnly session cookie — revoke access anytime in Discord Authorized Apps",
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
            {/* Primary First-Party Authorization Card */}
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
                      {site.name} Web Dashboard
                    </p>
                    <h1 className="mt-0.5 font-display text-[22px] font-bold tracking-[0.14em] text-white">
                      <Wordmark />
                    </h1>
                  </div>
                </div>

                <p className="mt-5 text-[14px] leading-relaxed text-zinc-300">
                  Connect with{" "}
                  <strong className="font-semibold text-white">
                    Discord OAuth 2.0
                  </strong>{" "}
                  to configure Anti-Nuke, AutoMod, VoiceMaster, Tickets, and
                  server utilities across communities you manage.
                </p>

                {/* Official redirect verification pill */}
                <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.06] px-3.5 py-2.5">
                  <LockIcon className="size-4 shrink-0 text-emerald-400" />
                  <p className="font-mono text-[11px] text-emerald-200">
                    Authorization runs on{" "}
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
                      <form method="POST" action="/api/auth/discord">
                        <button
                          type="submit"
                          className="btn-primary flex h-[52px] w-full items-center justify-center gap-2.5 rounded-2xl text-[14.5px] font-semibold text-white"
                        >
                          Authorize with Discord
                        </button>
                      </form>
                      <Link
                        href="/dashboard/demo"
                        className="flex h-11 w-full items-center justify-center rounded-2xl border border-white/[0.11] bg-ink-950/75 text-[13px] font-medium text-zinc-200"
                      >
                        Try Interactive Demo (No Account Needed)
                      </Link>
                    </div>
                  }
                >
                  <DiscordLoginButton />
                </Suspense>

                {/* Independent third-party service disclosure */}
                <div className="mt-6 border-t border-white/[0.07] pt-4 text-[11.5px] leading-relaxed text-zinc-400">
                  <p>
                    <strong className="font-medium text-zinc-200">
                      {site.name}
                    </strong>{" "}
                    (App ID{" "}
                    <code className="font-mono text-[10.5px] text-zinc-300">
                      {site.clientId}
                    </code>
                    ) is an independent Discord bot &amp; dashboard service and
                    is not affiliated with, sponsored by, or endorsed by Discord
                    Inc.
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px]">
                    <Link
                      href="/security"
                      className="text-brand-300 hover:text-white"
                    >
                      Security &amp; OAuth2 Spec
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

            {/* Right: Permission Transparency */}
            <div className="space-y-4 lg:col-span-6">
              <div className="panel rounded-3xl p-6 sm:p-7">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 items-center justify-center rounded-xl border border-brand-500/35 bg-brand-950/60 text-brand-300">
                    <ShieldIcon className="size-4" />
                  </span>
                  <div>
                    <h2 className="font-display text-[16px] font-semibold text-white">
                      OAuth 2.0 Scope Disclosure
                    </h2>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                      Transparent consent · Revocable anytime
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
                <h3 className="font-display text-[15px] font-semibold text-white">
                  Dashboard Security Guarantees
                </h3>
                <ul className="mt-3.5 space-y-2.5 text-[12.5px] leading-relaxed text-zinc-300">
                  {SAFEGUARDS.map((line) => (
                    <li key={line} className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-emerald-500/35 bg-emerald-500/10 text-emerald-300">
                        <CheckIcon className="size-2.5" />
                      </span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
