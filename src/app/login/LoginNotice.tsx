"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, DiscordIcon } from "@/components/ui/Icons";

export function DiscordLoginButton() {
  const params = useSearchParams();
  const [connecting, setConnecting] = useState(false);
  const [oauthReady, setOauthReady] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/auth/oauth-info", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { oauthConfigured?: boolean } | null) => {
        if (alive && d && typeof d.oauthConfigured === "boolean") {
          setOauthReady(d.oauthConfigured);
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const rawNext = params.get("next");
  const safeNext =
    rawNext === "/admin" ||
    rawNext === "/premium" ||
    rawNext === "/dashboard" ||
    rawNext === "/dashboard/demo" ||
    (rawNext && /^\/dashboard\/\d{15,22}$/.test(rawNext))
      ? rawNext
      : null;

  const href = safeNext
    ? `/api/auth/discord?next=${encodeURIComponent(safeNext)}`
    : "/api/auth/discord";

  return (
    <div className="mt-6 w-full space-y-3">
      <a
        href={href}
        onClick={() => setConnecting(true)}
        className="btn-primary btn-glow group relative flex h-[52px] w-full items-center justify-center gap-3 overflow-hidden rounded-2xl text-[14.5px] font-semibold tracking-tight text-white transition-all duration-300 ease-smooth hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985]"
      >
        {connecting ? (
          <>
            <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            <span>Redirecting to discord.com…</span>
          </>
        ) : (
          <>
            <DiscordIcon className="size-[19px] transition-transform duration-300 ease-smooth group-hover:scale-110" />
            <span>Continue with Discord OAuth2</span>
          </>
        )}
      </a>

      <Link
        href="/dashboard/demo"
        className="group flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-white/[0.11] bg-ink-950/75 px-4 text-[13px] font-medium text-zinc-200 transition-all hover:border-brand-500/40 hover:bg-brand-950/30 hover:text-white"
      >
        <span>Explore Interactive Demo (No Sign-In)</span>
        <ArrowRight className="size-3.5 text-brand-400 transition-transform group-hover:translate-x-0.5" />
      </Link>

      {oauthReady === false && (
        <p className="rounded-xl border border-amber-500/25 bg-amber-500/[0.08] px-3.5 py-2 text-left text-[11.5px] leading-relaxed text-amber-200">
          <strong>Local / preview note:</strong>{" "}
          <code className="font-mono text-[11px]">DISCORD_CLIENT_SECRET</code>{" "}
          is not set in this environment yet. You can test all 12 server modules
          right now in the{" "}
          <Link
            href="/dashboard/demo"
            className="font-semibold underline underline-offset-2 hover:text-white"
          >
            Interactive Demo
          </Link>
          .
        </p>
      )}
    </div>
  );
}

export function LoginNotice() {
  const params = useSearchParams();
  const code = params.get("error");
  const reason = params.get("reason");

  if (!code) return null;

  const messages: Record<string, string> = {
    oauth_not_configured:
      "Discord OAuth2 credentials are not configured on this instance yet. Set DISCORD_CLIENT_SECRET and SESSION_SECRET, or explore the Interactive Demo below.",
    access_denied:
      "Discord authorization was cancelled — no account information was shared.",
    invalid_scope:
      "Invalid Discord OAuth2 scope configuration. Verify DISCORD_OAUTH_SCOPES is set to 'identify guilds guilds.join'.",
    invalid_state:
      "The anti-CSRF handshake expired or mismatched. Click Continue with Discord OAuth2 to start a fresh session.",
    token_exchange_failed:
      reason === "invalid_client"
        ? "Client secret mismatch — verify DISCORD_CLIENT_SECRET in your deployment settings."
        : reason === "rate_limited"
          ? "Discord temporarily rate-limited the request — wait a few seconds and try again."
          : "Could not complete Discord sign-in. Confirm the OAuth2 Redirect URI in the Discord Developer Portal matches this domain.",
    user_fetch_failed:
      "Could not fetch your public Discord profile. Please try again in a moment.",
    oauth_failed: "The Discord OAuth2 connection was interrupted. Please retry.",
  };

  const text = messages[code] ?? "Sign-in was interrupted. Please try again.";

  return (
    <div
      role="alert"
      className="animate-fade-in mt-5 w-full rounded-xl border border-brand-500/35 bg-brand-950/50 px-3.5 py-2.5 text-left text-[12px] leading-relaxed text-brand-100"
    >
      {text}
    </div>
  );
}
