import type { Metadata } from "next";
import Link from "next/link";
import { PageBackground } from "@/components/site/Background";
import { Logo } from "@/components/ui/Logo";
import { DiscordIcon, ShieldIcon, ArrowRight, LockIcon } from "@/components/ui/Icons";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Dashboard Login",
  description:
    "Sign in to the LIGHTCORE dashboard to manage whitelists, rate limits, audit logs and voice modules.",
};

export default function LoginPage() {
  return (
    <>
      <PageBackground />
      <main className="relative flex min-h-screen items-center justify-center px-5 py-16">
        <div className="w-full max-w-[420px]">
          <Link href="/" className="mb-8 flex items-center justify-center gap-3">
            <Logo size={38} />
            <span className="flex flex-col leading-none">
              <span className="font-display text-[17px] font-semibold tracking-[0.16em] text-white">
                LIGHT<span className="text-brand-500">CORE</span>
              </span>
              <span className="mt-1 font-mono text-[8px] uppercase tracking-[0.42em] text-brand-400/80">
                Security
              </span>
            </span>
          </Link>

          <div className="panel panel-inner relative overflow-hidden rounded-2xl p-7 shadow-panel">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 left-1/2 size-56 -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(239,16,16,0.18),transparent)]"
            />
            <div className="relative">
              <h1 className="font-display text-[24px] font-semibold tracking-tight text-white">
                Open Dashboard
              </h1>
              <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">
                Authenticate with Discord to manage the guilds where you hold
                Manage Server.
              </p>

              <a
                href={site.invite}
                className="btn-glow relative mt-6 flex h-12 w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-[#5865F2] text-[14px] font-semibold text-white transition-colors hover:bg-[#4752C4]"
              >
                <DiscordIcon className="size-[18px]" />
                Continue with Discord
              </a>

              <div className="my-6 flex items-center gap-3">
                <span className="h-px flex-1 bg-white/10" />
                <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-zinc-600">
                  or
                </span>
                <span className="h-px flex-1 bg-white/10" />
              </div>

              <label className="block">
                <span className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-zinc-500">
                  access key
                </span>
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-ink-950/70 px-3">
                  <LockIcon className="size-4 shrink-0 text-zinc-600" />
                  <input
                    type="password"
                    disabled
                    placeholder="owner-only · coming soon"
                    className="h-11 w-full bg-transparent font-mono text-[12px] text-zinc-300 placeholder:text-zinc-600 focus:outline-none"
                  />
                </div>
              </label>

              <button
                type="button"
                disabled
                className="mt-4 flex h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] text-[13px] font-medium text-zinc-500"
              >
                Sign in
                <ArrowRight className="size-4" />
              </button>

              <p className="mt-5 flex items-start gap-2 text-[11px] leading-relaxed text-zinc-500">
                <ShieldIcon className="mt-px size-3.5 shrink-0 text-brand-500/70" />
                Sessions are bound to your Discord identity. We never request
                your password.
              </p>
            </div>
          </div>

          <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
            <Link href="/" className="transition-colors hover:text-zinc-300">
              ← back to LightCore home
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
