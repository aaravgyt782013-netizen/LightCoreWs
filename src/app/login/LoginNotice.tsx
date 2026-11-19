"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, ShieldIcon } from "@/components/ui/Icons";
import { site } from "@/lib/site";

export function DiscordLoginButton() {
  const params = useSearchParams();
  const [connecting, setConnecting] = useState(false);
  const [joinServer, setJoinServer] = useState(true);
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

  return (
    <div className="mt-6 w-full space-y-3">
      <form
        method="POST"
        action="/api/auth/discord"
        onSubmit={() => setConnecting(true)}
        className="space-y-3"
      >
        <input type="hidden" name="consentForm" value="1" />
        {safeNext && <input type="hidden" name="next" value={safeNext} />}

        <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-white/[0.09] bg-ink-950/75 px-3.5 py-2.5 text-left transition hover:border-brand-500/35">
          <input
            type="checkbox"
            name="joinServer"
            value="1"
            checked={joinServer}
            onChange={(e) => setJoinServer(e.target.checked)}
            className="mt-0.5 size-4 shrink-0 rounded accent-brand-500"
          />
          <span className="text-[12px] leading-snug text-zinc-300">
            Also add me to the official{" "}
            <strong className="font-medium text-white">{site.name}</strong>{" "}
            community Discord server on authorization (
            <code className="font-mono text-[11px] text-brand-300">
              guilds.join
            </code>
            )
          </span>
        </label>

        <button
          type="submit"
          disabled={connecting}
          className="btn-primary btn-glow group relative flex h-[52px] w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl text-[14.5px] font-semibold tracking-tight text-white transition-all duration-300 ease-smooth hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985] disabled:opacity-80"
        >
          {connecting ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              <span>Opening Discord OAuth2…</span>
            </>
          ) : (
            <>
              <ShieldIcon className="size-[18px] transition-transform duration-300 ease-smooth group-hover:scale-105" />
              <span>Authorize with Discord</span>
              <ArrowRight className="size-4 transition-transform duration-300 ease-smooth group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      <Link
        href="/dashboard/demo"
        className="group flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-white/[0.11] bg-ink-950/75 px-4 text-[13px] font-medium text-zinc-200 transition-all hover:border-brand-500/40 hover:bg-brand-950/30 hover:text-white"
      >
        <span>Try Interactive Demo (No Account Needed)</span>
        <ArrowRight className="size-3.5 text-brand-400 transition-transform group-hover:translate-x-0.5" />
      </Link>

      {oauthReady === false && (
        <p className="rounded-xl border border-amber-500/25 bg-amber-500/[0.08] px-3.5 py-2 text-left text-[11.5px] leading-relaxed text-amber-200">
          <strong>Setup note:</strong> OAuth2 environment variables are not
          configured on this preview yet. You can test all 12 server modules
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
      "Discord OAuth2 environment settings are not active on this instance yet. You can still explore the full Interactive Demo below.",
    access_denied:
      "Authorization was cancelled on Discord — no account data was shared.",
    invalid_scope:
      "Invalid OAuth2 scope configuration. Check DISCORD_OAUTH_SCOPES in your environment settings.",
    invalid_state:
      "Your authorization request expired. Click Authorize with Discord to start a fresh session.",
    token_exchange_failed:
      reason === "invalid_client"
        ? "Application client configuration mismatch — check your deployment settings."
        : reason === "rate_limited"
          ? "Discord temporarily rate-limited the request — wait a few seconds and retry."
          : "Could not complete OAuth2 callback. Ensure the Redirect URI in the Discord Developer Portal matches this domain.",
    user_fetch_failed:
      "Could not load your public Discord profile. Please try again in a moment.",
    oauth_failed: "The OAuth2 connection was interrupted. Please try again.",
  };

  const text = messages[code] ?? "Authorization was interrupted. Please retry.";

  return (
    <div
      role="alert"
      className="animate-fade-in mt-5 w-full rounded-xl border border-brand-500/35 bg-brand-950/50 px-3.5 py-2.5 text-left text-[12px] leading-relaxed text-brand-100"
    >
      {text}
    </div>
  );
}
