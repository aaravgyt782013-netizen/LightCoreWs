"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, ShieldIcon } from "@/components/ui/Icons";

export function DiscordLoginButton() {
  const params = useSearchParams();
  const [connecting, setConnecting] = useState(false);

  const rawNext = params.get("next");
  const safeNext =
    rawNext === "/admin" ||
    rawNext === "/premium" ||
    rawNext === "/dashboard" ||
    (rawNext && /^\/dashboard\/\d{15,22}$/.test(rawNext))
      ? rawNext
      : null;

  return (
    <div className="mt-7 w-full">
      <form
        method="POST"
        action="/api/auth/discord"
        onSubmit={() => setConnecting(true)}
      >
        {safeNext && <input type="hidden" name="next" value={safeNext} />}
        <button
          type="submit"
          disabled={connecting}
          className="btn-primary btn-glow group relative flex h-[54px] w-full items-center justify-center gap-3 overflow-hidden rounded-full text-[15px] font-semibold tracking-tight transition-all duration-300 ease-smooth hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985] disabled:opacity-80"
        >
          {connecting ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span>Connecting to Discord…</span>
            </>
          ) : (
            <>
              <ShieldIcon className="relative z-10 size-5 transition-transform duration-300 ease-smooth group-hover:scale-105" />
              <span className="relative z-10">Sign in with Discord</span>
              <ArrowRight className="relative z-10 size-4 transition-transform duration-300 ease-smooth group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>
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
      "Discord OAuth 2.0 is not configured yet on this instance. Please check server settings.",
    access_denied:
      "Sign-in was cancelled on Discord — no account data was shared.",
    invalid_scope:
      "Invalid OAuth 2.0 scope setting. Please verify your application scopes.",
    invalid_state:
      "Your sign-in request expired. Click Sign in with Discord to try again.",
    token_exchange_failed:
      reason === "invalid_client"
        ? "Application client configuration mismatch — check your deployment settings."
        : reason === "rate_limited"
          ? "Discord temporarily rate-limited the request — please wait a few seconds and retry."
          : "Could not complete sign-in callback. Ensure the Redirect URI in Discord Developer Portal matches this domain.",
    user_fetch_failed:
      "Could not load your Discord profile. Please try again in a moment.",
    oauth_failed: "The connection was interrupted. Please try again.",
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
