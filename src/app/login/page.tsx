import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageBackground } from "@/components/site/Background";
import { Logo, Wordmark } from "@/components/ui/Logo";
import {
  DiscordIcon,
  ShieldIcon,
  ArrowRight,
  CheckIcon,
  CrownIcon,
} from "@/components/ui/Icons";
import { site } from "@/lib/site";
import { LoginNotice } from "./LoginNotice";

export const metadata: Metadata = {
  title: "Dashboard Login",
  description: `Sign in to the ${site.name} dashboard with Discord to manage your servers and monitor live logs.`,
};

const oauthPermissions = [
  "Access your username, avatar, and email",
  "See the Discord servers you are in",
  "Join servers for you (guilds.join)",
];

export default function LoginPage() {
  return (
    <>
      <PageBackground />
      <main className="relative flex min-h-screen items-center justify-center px-5 py-16">
        <div className="w-full max-w-[430px]">
          <Link href="/" className="mb-8 flex items-center justify-center gap-3">
            <Logo size={38} />
            <span className="flex flex-col leading-none">
              <span className="font-display text-[17px] font-semibold tracking-[0.16em] text-white">
                <Wordmark />
              </span>
              <span className="mt-1 font-mono text-[8px] uppercase tracking-[0.36em] text-brand-400/80">
                All-in-One
              </span>
            </span>
          </Link>

          <div className="panel panel-inner relative overflow-hidden rounded-2xl p-7 shadow-panel">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 left-1/2 size-60 -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(6,182,212,0.22),transparent)]"
            />
            <div className="relative">
              <h1 className="font-display text-[24px] font-semibold tracking-tight text-white">
                Open Dashboard
              </h1>
              <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">
                Authenticate with Discord to access your {site.name} dashboard,
                servers, and live audit logs.
              </p>

              <Suspense fallback={null}>
                <LoginNotice />
              </Suspense>

              <a
                href="/api/auth/discord"
                className="btn-glow relative mt-6 flex h-12 w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-[#5865F2] text-[14px] font-semibold text-white transition-colors hover:bg-[#4752C4]"
              >
                <DiscordIcon className="size-[18px]" />
                Continue with Discord
              </a>

              <div className="mt-4 rounded-xl border border-white/[0.06] bg-ink-950/60 px-3.5 py-3">
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-500">
                  requested oauth2 permissions
                </p>
                <ul className="mt-2 space-y-1.5">
                  {oauthPermissions.map((p) => (
                    <li
                      key={p}
                      className="flex items-center gap-2 text-[11.5px] text-zinc-400"
                    >
                      <CheckIcon className="size-3 shrink-0 text-brand-400" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-white/10" />
                <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-zinc-600">
                  quick actions
                </span>
                <span className="h-px flex-1 bg-white/10" />
              </div>

              <div className="grid gap-2.5">
                <a
                  href={site.invite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-brand-500/30 bg-brand-950/35 text-[13px] font-medium text-white transition-colors hover:border-brand-500/60 hover:bg-brand-900/40"
                >
                  Add {site.name} to a Server
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </a>
                <Link
                  href="/premium"
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-brand-400/35 bg-brand-500/10 text-[13px] font-medium text-brand-200 transition-all hover:border-brand-400/60 hover:bg-brand-500/20 hover:text-white"
                >
                  <CrownIcon className="size-4 text-brand-300" />
                  View Premium Plans
                </Link>
                <a
                  href={site.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] text-[13px] font-medium text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                >
                  <DiscordIcon className="size-4 text-[#5865F2]" />
                  Join Support Server
                </a>
              </div>

              <p className="mt-5 flex items-start gap-2 text-[11px] leading-relaxed text-zinc-500">
                <ShieldIcon className="mt-px size-3.5 shrink-0 text-brand-500/70" />
                <span>
                  OAuth2 via Discord App{" "}
                  <code className="font-mono text-zinc-400">
                    {site.clientId}
                  </code>
                  . Bot owner?{" "}
                  <Link
                    href="/admin"
                    className="text-brand-400 hover:text-brand-300"
                  >
                    Open Owner Panel →
                  </Link>
                </span>
              </p>
            </div>
          </div>

          <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
            <Link href="/" className="transition-colors hover:text-zinc-300">
              ← back to {site.name} home
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
