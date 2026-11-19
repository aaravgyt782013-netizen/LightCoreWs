import { NextRequest, NextResponse } from "next/server";
import {
  cleanEnvString,
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

export const dynamic = "force-dynamic";

function isSameOriginPost(req: NextRequest): boolean {
  const secFetchSite = req.headers.get("sec-fetch-site")?.toLowerCase();
  if (
    secFetchSite &&
    secFetchSite !== "same-origin" &&
    secFetchSite !== "same-site" &&
    secFetchSite !== "none"
  ) {
    return false;
  }

  const origin = req.headers.get("origin");
  if (!origin) return true;

  try {
    const originHost = new URL(origin).host
      .toLowerCase()
      .replace(/:(443|80)$/, "");
    const expectedHost = (
      req.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
      req.headers.get("host")?.trim() ||
      new URL(req.url).host
    )
      .toLowerCase()
      .replace(/:(443|80)$/, "");
    return originHost === expectedHost;
  } catch {
    return false;
  }
}

/**
 * Direct GET visits (including crawlers, prefetchers, or legacy bookmarks) land
 * cleanly on `/login` instead of starting an unprompted off-origin OAuth redirect.
 */
export async function GET(req: NextRequest) {
  const reqUrl = new URL(req.url);
  const rawNext = reqUrl.searchParams.get("next");
  const safeNext = rawNext ? sanitizeInternalNextPath(rawNext) : null;
  const target: `/${string}` =
    safeNext && safeNext !== "/dashboard"
      ? `/login?next=${encodeURIComponent(safeNext)}`
      : "/login";

  const res = relativeRedirect(target, { url: req.url, headers: req.headers });
  res.headers.set("Cache-Control", "private, no-store, max-age=0");
  res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return res;
}

/**
 * RFC 9700 / OWASP POST-initiated read-only Discord OAuth2 handshake.
 * Strictly requests `identify guilds` only (zero write or contact scopes).
 */
export async function POST(req: NextRequest) {
  if (!isSameOriginPost(req)) {
    return relativeRedirect("/login?error=invalid_state", {
      url: req.url,
      headers: req.headers,
    });
  }

  const clientSecret = cleanEnvString(process.env.DISCORD_CLIENT_SECRET);
  const sessionSecret = getSessionSecret();

  if (!clientSecret || !sessionSecret) {
    return relativeRedirect("/login?error=oauth_not_configured", {
      url: req.url,
      headers: req.headers,
    });
  }

  const reqUrl = new URL(req.url);
  let formNext: string | null = null;

  try {
    const contentType = req.headers.get("content-type") || "";
    if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      const fd = await req.formData();
      const rawNext = fd.get("next");
      if (typeof rawNext === "string") formNext = rawNext;
    }
  } catch {
    // Fall back to query param
  }

  const nextPath = sanitizeInternalNextPath(
    formNext ?? reqUrl.searchParams.get("next"),
  );

  // Hop Netlify commit-permalink subdomains (`*--site.netlify.app`) to primary site
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
      const canonicalLogin = new URL("/login", primaryNetlifyOrigin);
      canonicalLogin.searchParams.set("next", nextPath);
      const hop = NextResponse.redirect(canonicalLogin.toString(), 303);
      hop.headers.set("Cache-Control", "private, no-store, max-age=0");
      hop.headers.set("Referrer-Policy", "no-referrer");
      return hop;
    }
  }

  const clientId = resolveDiscordClientId();
  const redirectUri = getRedirectUri(req.url, req.headers);
  const scopes = resolveOAuthScopes(
    process.env.DISCORD_OAUTH_SCOPES ||
      process.env.NEXT_PUBLIC_DISCORD_OAUTH_SCOPES,
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
