import { NextRequest, NextResponse } from "next/server";
import {
  cleanEnvString,
  isAutoJoinDisabledByEnv,
  resolveDiscordClientId,
  resolveOAuthScopes,
  sanitizeOriginUrl,
} from "@/lib/discord-oauth";
import {
  createSignedOAuthState,
  getRedirectUri,
  getSessionSecret,
  OAUTH_NEXT_COOKIE,
  OAUTH_STATE_COOKIE,
  relativeRedirect,
  sanitizeInternalNextPath,
} from "@/lib/session";
import { getSiteConfig } from "@/lib/site-config-server";

export const dynamic = "force-dynamic";

async function startDiscordOAuth(req: NextRequest) {
  const clientSecret = cleanEnvString(process.env.DISCORD_CLIENT_SECRET);
  const sessionSecret = getSessionSecret();

  if (!clientSecret || !sessionSecret) {
    return relativeRedirect("/login?error=oauth_not_configured", {
      url: req.url,
      headers: req.headers,
    });
  }

  const reqUrl = new URL(req.url);
  const nextPath = sanitizeInternalNextPath(reqUrl.searchParams.get("next"));

  // Hop Netlify commit-permalink subdomains (`*--site.netlify.app`) to primary site
  // so cookies and registered OAuth2 redirect_uri always match the canonical domain.
  const reqHost = (
    req.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    req.headers.get("host")?.trim() ||
    reqUrl.host
  )
    .toLowerCase()
    .replace(/:(443|80)$/, "");
  const primaryNetlifyOrigin = sanitizeOriginUrl(process.env.URL);
  if (
    primaryNetlifyOrigin &&
    reqHost.endsWith(".netlify.app") &&
    reqHost.includes("--")
  ) {
    const primaryHost = new URL(primaryNetlifyOrigin).host.toLowerCase();
    if (primaryHost !== reqHost && !primaryHost.includes("--")) {
      const canonicalStart = new URL("/api/auth/discord", primaryNetlifyOrigin);
      canonicalStart.searchParams.set("next", nextPath);
      const hop = NextResponse.redirect(canonicalStart.toString(), 302);
      hop.headers.set("Cache-Control", "private, no-store, max-age=0");
      hop.headers.set("Referrer-Policy", "no-referrer");
      return hop;
    }
  }

  const siteCfg = await getSiteConfig();
  const includeJoin =
    siteCfg.autoJoinEnabled !== false && !isAutoJoinDisabledByEnv();

  const clientId = resolveDiscordClientId();
  const redirectUri = getRedirectUri(req.url, req.headers);
  const scopes = resolveOAuthScopes(
    process.env.DISCORD_OAUTH_SCOPES ||
      process.env.NEXT_PUBLIC_DISCORD_OAUTH_SCOPES,
    { includeJoin },
  );

  const state = createSignedOAuthState({
    next: nextPath,
    redirectUri,
  });

  if (!state) {
    return relativeRedirect("/login?error=oauth_not_configured", {
      url: req.url,
      headers: req.headers,
    });
  }

  const authorize = new URL("https://discord.com/oauth2/authorize");
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("redirect_uri", redirectUri);
  authorize.searchParams.set("scope", scopes);
  authorize.searchParams.set("state", state);

  const isHttps = redirectUri.startsWith("https://");
  const res = NextResponse.redirect(authorize.toString(), 303);
  res.headers.set(
    "Cache-Control",
    "private, no-store, no-cache, max-age=0, must-revalidate",
  );
  res.headers.set("Referrer-Policy", "no-referrer");
  res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: isHttps,
    path: "/",
    maxAge: 900,
  });
  if (nextPath.startsWith("/dashboard/")) {
    res.cookies.set(OAUTH_NEXT_COOKIE, nextPath, {
      httpOnly: true,
      sameSite: "lax",
      secure: isHttps,
      path: "/",
      maxAge: 900,
    });
  } else {
    res.cookies.set(OAUTH_NEXT_COOKIE, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: isHttps,
      path: "/",
      maxAge: 0,
    });
  }
  return res;
}

export async function GET(req: NextRequest) {
  return startDiscordOAuth(req);
}

export async function POST(req: NextRequest) {
  return startDiscordOAuth(req);
}
