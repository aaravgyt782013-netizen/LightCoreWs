"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CheckIcon, CopyIcon, CrownIcon, DiscordIcon } from "@/components/ui/Icons";
import Link from "next/link";
import { useSiteConfig } from "@/components/site/SiteConfigProvider";
import { sanitizeDiscordInviteUrl } from "@/lib/discord-oauth";
import { site } from "@/lib/site";

export function LoginNotice() {
  const params = useSearchParams();
  const code = params.get("error");
  const [redirectUri, setRedirectUri] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRedirectUri(`${window.location.origin}/api/auth/callback/discord`);
    }
    fetch("/api/auth/oauth-info", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { redirectUri?: string } | null) => {
        if (d?.redirectUri) setRedirectUri(d.redirectUri);
      })
      .catch(() => {});
  }, []);

  if (!code) return null;

  const callbackUrl =
    redirectUri || `${site.url}/api/auth/callback/discord`;

  const errorMessages: Record<string, { title: string; detail: string; showRedirect?: boolean }> = {
    oauth_not_configured: {
      title: "Discord OAuth2 secret not set yet",
      detail: `Add DISCORD_CLIENT_SECRET and SESSION_SECRET in your server environment variables, and add this exact Redirect URI under Discord Developer Portal → OAuth2 → Redirects:`,
      showRedirect: true,
    },
    access_denied: {
      title: "Authorization cancelled",
      detail: "You cancelled Discord authorization. Tap Continue with Discord whenever you're ready.",
    },
    invalid_scope: {
      title: "Invalid OAuth2 scope configuration",
      detail: "Check DISCORD_OAUTH_SCOPES in your environment variables (default: identify email guilds guilds.join).",
    },
    invalid_state: {
      title: "Login session expired",
      detail: "Your OAuth2 verification timed out. Click Continue with Discord to try again.",
    },
    token_exchange_failed: {
      title: "Discord authorization failed",
      detail: `Check that DISCORD_CLIENT_SECRET matches Client ID ${site.clientId} and that this exact Redirect URI is saved in Discord Developer Portal → OAuth2 → Redirects:`,
      showRedirect: true,
    },
    user_fetch_failed: {
      title: "Could not load Discord profile",
      detail: "Discord did not return your profile information. Please try again.",
    },
    oauth_failed: {
      title: "Connection error",
      detail: "Unable to reach Discord OAuth2 right now. Please try again in a moment.",
    },
  };

  const info = errorMessages[code] ?? {
    title: "Sign-in interrupted",
    detail: "Please try authenticating with Discord again.",
  };

  const copyCallback = async () => {
    try {
      await navigator.clipboard.writeText(callbackUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore clipboard failures.
    }
  };

  return (
    <div
      role="alert"
      className="mt-4 rounded-xl border border-brand-400/35 bg-brand-950/45 px-3.5 py-3 text-left"
    >
      <p className="text-[12px] font-medium text-brand-200">{info.title}</p>
      <p className="mt-1 break-words text-[11px] leading-relaxed text-zinc-300">
        {info.detail}
      </p>
      {info.showRedirect && (
        <button
          type="button"
          onClick={() => void copyCallback()}
          className="mt-2 flex w-full items-center justify-between gap-2 rounded-lg border border-brand-400/30 bg-ink-950/80 px-2.5 py-1.5 text-left font-mono text-[10px] text-brand-200 hover:border-brand-400/60"
        >
          <span className="truncate">{callbackUrl}</span>
          <span className="inline-flex shrink-0 items-center gap-1 text-[9.5px] text-brand-300">
            {copied ? (
              <>
                <CheckIcon className="size-3 text-emerald-400" />
                Copied
              </>
            ) : (
              <>
                <CopyIcon className="size-3" />
                Copy
              </>
            )}
          </span>
        </button>
      )}
    </div>
  );
}

export function LoginQuickActions() {
  const { config } = useSiteConfig();
  const [redirectUri, setRedirectUri] = useState<string>("");
  const [showHelper, setShowHelper] = useState(false);
  const [copied, setCopied] = useState(false);

  const safeInvite = sanitizeDiscordInviteUrl(
    config.inviteUrl || site.invite,
    site.clientId,
  );
  const supportHref = config.supportUrl || site.discord;
  const brandName = config.brandName || site.name;

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRedirectUri(`${window.location.origin}/api/auth/callback/discord`);
    }
    fetch("/api/auth/oauth-info", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { redirectUri?: string } | null) => {
        if (d?.redirectUri) setRedirectUri(d.redirectUri);
      })
      .catch(() => {});
  }, []);

  const copyRedirect = async () => {
    if (!redirectUri) return;
    try {
      await navigator.clipboard.writeText(redirectUri);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  return (
    <>
      <div className="grid gap-2.5">
        <a
          href={safeInvite}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-brand-500/30 bg-brand-950/35 text-[13px] font-medium text-white transition-colors hover:border-brand-500/60 hover:bg-brand-900/40"
        >
          Add {brandName} to a Server
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
          href={supportHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] text-[13px] font-medium text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
        >
          <DiscordIcon className="size-4 text-[#5865F2]" />
          Join Support Server
        </a>
      </div>

      {redirectUri && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowHelper((v) => !v)}
            className="font-mono text-[10px] text-zinc-500 underline decoration-zinc-700 underline-offset-4 transition-colors hover:text-brand-300"
          >
            {showHelper ? "Hide OAuth2 callback URL" : "OAuth2 redirect setup"}
          </button>
          {showHelper && (
            <div className="mt-2 rounded-xl border border-brand-200/12 bg-ink-950/75 p-3">
              <p className="text-[11px] leading-relaxed text-zinc-400">
                Ensure this exact URL is added under{" "}
                <span className="text-zinc-200">
                  Discord Developer Portal → OAuth2 → Redirects
                </span>{" "}
                and that{" "}
                <span className="text-zinc-200">Requires OAuth2 Code Grant</span>{" "}
                is OFF under <span className="text-zinc-200">Bot</span>:
              </p>
              <button
                type="button"
                onClick={() => void copyRedirect()}
                className="mt-2 flex w-full items-center justify-between gap-2 rounded-lg border border-brand-400/30 bg-ink-900/90 px-2.5 py-2 text-left font-mono text-[10px] text-brand-200 hover:border-brand-400/60"
              >
                <span className="break-all">{redirectUri}</span>
                <span className="inline-flex shrink-0 items-center gap-1 rounded bg-brand-500/15 px-2 py-0.5 text-[9.5px] text-brand-200">
                  {copied ? (
                    <>
                      <CheckIcon className="size-3 text-emerald-400" />
                      Copied
                    </>
                  ) : (
                    <>
                      <CopyIcon className="size-3" />
                      Copy
                    </>
                  )}
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
