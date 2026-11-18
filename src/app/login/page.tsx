import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageBackground } from "@/components/site/Background";
import { Logo, Wordmark } from "@/components/ui/Logo";
import {
  DiscordIcon,
  ShieldIcon,
  CheckIcon,
} from "@/components/ui/Icons";
import { site } from "@/lib/site";
import { LoginNotice, LoginQuickActions } from "./LoginNotice";

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
                className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-brand-500/80 to-transparent"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -top-24 left-1/2 size-64 -translate-x-1/2 rounded-full"
                style={{
                  background:
                    "radial-gradient(closest-side, rgb(var(--brand-600) / 0.28), transparent)",
                }}
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

              <LoginQuickActions />

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
