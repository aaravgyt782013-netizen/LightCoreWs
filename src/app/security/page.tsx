import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/site/PageShell";
import { CheckIcon, LockIcon, ShieldIcon, VerifiedIcon } from "@/components/ui/Icons";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Security & OAuth2 Trust Center",
  description: `Full transparency on how ${site.name} implements least-privilege Discord OAuth2, session cryptography, zero credential collection, and responsible disclosure.`,
};

const PILLARS = [
  {
    title: "Read-Only Discord OAuth 2.0",
    badge: "identify · guilds",
    body: "Authorization redirects via same-origin POST strictly to https://discord.com/oauth2/authorize requesting only read-only `identify` and `guilds` scopes. We never request `guilds.join`, `email`, `messages.read`, or any write access on user accounts.",
  },
  {
    title: "Zero Account Forms or Downloads",
    badge: "Browser-Only Dashboard",
    body: "LightCore contains zero login input forms, zero personal or billing data collection fields, and zero software or executable downloads anywhere on this website.",
  },
  {
    title: "Zero Persistent Token Storage",
    badge: "HMAC-SHA256 HttpOnly",
    body: "OAuth2 user tokens are never stored in our database and never sent to third-party servers. Active sessions live solely inside an HMAC-SHA256 signed, HttpOnly, SameSite=Lax browser cookie.",
  },
  {
    title: "Strict Browser Hardening",
    badge: "CSP · HSTS · CSRF",
    body: "Every OAuth2 handshake enforces a one-time cryptographic `state` nonce with timing-safe verification. Responses ship Content-Security-Policy, HSTS, Referrer-Policy, and Permissions-Policy headers.",
  },
];

const VERIFY_CHECKLIST = [
  "When clicking Sign In or Invite Bot, verify your browser address bar switches to https://discord.com/oauth2/authorize.",
  `Verify the Discord application ID matches our published Client ID (${site.clientId}).`,
  "Confirm the OAuth 2.0 consent screen lists only read-only 'Access your username, avatar, and banner' (identify) and 'Know what servers you're in' (guilds).",
  "Review or revoke LightCore anytime in Discord → User Settings → Authorized Apps.",
];

export default function SecurityPage() {
  return (
    <PageShell
      eyebrow="trust & security"
      title="Security & OAuth2 Transparency"
      intro={`${site.name} is built to protect Discord communities — and holds its own web dashboard to the exact same least-privilege standard.`}
    >
      <div className="space-y-8">
        {/* 4 Security Pillars */}
        <div className="grid gap-4 sm:grid-cols-2">
          {PILLARS.map((item) => (
            <div
              key={item.title}
              className="panel panel-hover rounded-3xl p-6 sm:p-7"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="flex size-9 items-center justify-center rounded-xl border border-brand-500/35 bg-brand-950/60 text-brand-300">
                  <ShieldIcon className="size-4" />
                </span>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-emerald-300">
                  {item.badge}
                </span>
              </div>
              <h2 className="mt-4 font-display text-[17px] font-semibold text-white">
                {item.title}
              </h2>
              <p className="mt-2 text-[13.5px] leading-relaxed text-zinc-400">
                {item.body}
              </p>
            </div>
          ))}
        </div>

        {/* User Verification Checklist */}
        <div className="panel rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <LockIcon className="size-5 text-brand-400" />
            <h2 className="font-display text-[19px] font-semibold text-white">
              How to Verify an Authentic {site.name} Authorization
            </h2>
          </div>
          <p className="mt-2 text-[13.5px] text-zinc-400">
            {site.name} is an independent service and is not affiliated with
            Discord Inc. Whenever you connect your Discord account, you can
            verify every step in seconds:
          </p>
          <ul className="mt-5 space-y-3">
            {VERIFY_CHECKLIST.map((step) => (
              <li
                key={step}
                className="flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-ink-950/70 px-4 py-3 text-[13px] leading-relaxed text-zinc-300"
              >
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-emerald-500/35 bg-emerald-500/10 text-emerald-300">
                  <CheckIcon className="size-3" />
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Technical Spec Table */}
        <div className="panel overflow-hidden rounded-3xl">
          <div className="border-b border-white/[0.07] px-6 py-4 sm:px-8">
            <h2 className="font-display text-[16px] font-semibold text-white">
              Published OAuth2 &amp; Endpoint Specification
            </h2>
          </div>
          <div className="divide-y divide-white/[0.06] text-[13px]">
            {[
              ["Application Name", `${site.name} (Independent Discord Bot)`],
              ["Discord Client ID", site.clientId],
              ["Authorization Host", "https://discord.com/oauth2/authorize"],
              ["Default User Scopes", "identify guilds (read-only only)"],
              ["Server Auto-Join", "None (guilds.join scope removed)"],
              ["Database Token Storage", "None (stateless HMAC-SHA256 HttpOnly cookie)"],
              ["Software Downloads", "None (100% browser dashboard + hosted Discord bot)"],
              ["Security Disclosure", "/.well-known/security.txt"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex flex-col gap-1 px-6 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-8"
              >
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                  {label}
                </span>
                <span className="font-mono text-[12px] text-zinc-200">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Responsible disclosure & try without login */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="panel rounded-3xl p-6">
            <div className="flex items-center gap-2 text-brand-300">
              <VerifiedIcon className="size-4" />
              <span className="font-mono text-[10px] uppercase tracking-[0.22em]">
                Responsible Disclosure
              </span>
            </div>
            <p className="mt-2.5 text-[13px] leading-relaxed text-zinc-400">
              Found a vulnerability, impersonation domain, or abuse concern?
              Open a confidential security ticket in our official Discord
              support server or consult{" "}
              <a
                href="/.well-known/security.txt"
                className="text-brand-300 underline underline-offset-2 hover:text-white"
              >
                /.well-known/security.txt
              </a>
              .
            </p>
            <a
              href={site.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center rounded-xl border border-white/[0.1] bg-ink-950/80 px-4 py-2 text-[12.5px] font-medium text-white transition hover:border-brand-500/40"
            >
              Contact Security Team →
            </a>
          </div>

          <div className="panel rounded-3xl p-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-300">
              Zero-Auth Sandbox
            </span>
            <p className="mt-2.5 text-[13px] leading-relaxed text-zinc-400">
              Want to inspect every single dashboard module before connecting
              your Discord account? Launch our full interactive sandbox — zero
              sign-in or permissions required.
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <Link
                href="/dashboard/demo"
                className="btn-primary inline-flex items-center rounded-xl px-4 py-2 text-[12.5px] font-semibold text-white"
              >
                Open Live Demo →
              </Link>
              <Link
                href="/privacy"
                className="inline-flex items-center rounded-xl border border-white/[0.1] bg-ink-950/80 px-4 py-2 text-[12.5px] font-medium text-zinc-300 hover:text-white"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
