import crypto from "node:crypto";
import { NextResponse } from "next/server";
import {
  cleanEnvString,
  isDiscordSnowflake,
  resolveDiscordRedirectUri,
  resolvePublicOrigin,
  sanitizeRedirectUri,
} from "@/lib/discord-oauth";

export const SESSION_COOKIE = "lc_session";
export const OAUTH_STATE_COOKIE = "lc_oauth_state";
export const OAUTH_NEXT_COOKIE = "lc_oauth_next";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const OAUTH_STATE_TTL_SECONDS = 60 * 15; // 15 minutes

export type SessionUser = {
  id: string;
  username: string;
  globalName: string | null;
  avatar: string | null;
  scopes?: string[];
};

export type SessionPayload = {
  user: SessionUser;
  accessToken: string;
  exp: number;
};

export type SignedOAuthStatePayload = {
  /** Random nonce */
  n: string;
  /** Unix expiration timestamp (seconds) */
  exp: number;
  /** Post-login destination path */
  next: string;
  /** Exact redirect_uri sent to Discord authorize endpoint */
  ru: string;
};

const keyCache = new Map<string, Buffer>();

/**
 * Returns strong server-side key material for session & OAuth state signing.
 */
export function getSessionSecret(): string {
  const rawSession = cleanEnvString(process.env.SESSION_SECRET);
  if (rawSession.length >= 16) return rawSession;

  const clientSecret = cleanEnvString(process.env.DISCORD_CLIENT_SECRET);
  if (rawSession && clientSecret) {
    return crypto
      .createHmac("sha256", clientSecret)
      .update(`lightcore-session-mix-v1:${rawSession}`)
      .digest("base64url");
  }
  if (clientSecret.length >= 16) {
    return crypto
      .createHmac("sha256", clientSecret)
      .update("lightcore-session-derived-v1")
      .digest("base64url");
  }
  return "";
}

function deriveKey(secret: string, domain = "lightcore-session-v1"): Buffer {
  const cacheId = `${domain}:${crypto.createHash("sha256").update(secret).digest("hex").slice(0, 24)}`;
  const hit = keyCache.get(cacheId);
  if (hit) return hit;

  const derived = crypto.scryptSync(secret, domain, 32);
  if (keyCache.size > 16) {
    const oldest = keyCache.keys().next().value;
    if (oldest) keyCache.delete(oldest);
  }
  keyCache.set(cacheId, derived);
  return derived;
}

export function sealSession(payload: SessionPayload): string | null {
  const secret = getSessionSecret();
  if (!secret) return null;

  const key = deriveKey(secret, "lightcore-session-v1");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const plaintext = Buffer.from(JSON.stringify(payload), "utf8");
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [
    iv.toString("base64url"),
    tag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".");
}

export function unsealSession(token: string | undefined): SessionPayload | null {
  const secret = getSessionSecret();
  if (!secret || !token) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const [ivB64, tagB64, dataB64] = parts;
    const iv = Buffer.from(ivB64, "base64url");
    const tag = Buffer.from(tagB64, "base64url");
    const encrypted = Buffer.from(dataB64, "base64url");
    if (iv.length !== 12 || tag.length !== 16) return null;

    const key = deriveKey(secret, "lightcore-session-v1");
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);
    const parsed = JSON.parse(decrypted.toString("utf8")) as SessionPayload;
    if (
      !parsed ||
      typeof parsed.exp !== "number" ||
      parsed.exp < Math.floor(Date.now() / 1000) ||
      !parsed.user?.id ||
      typeof parsed.accessToken !== "string"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function sanitizeInternalNextPath(raw: string | null | undefined): `/${string}` {
  if (!raw) return "/dashboard";
  const trimmed = raw.trim();
  if (trimmed === "/dashboard" || trimmed === "/admin" || trimmed === "/premium") {
    return trimmed;
  }
  const guildMatch = /^\/dashboard\/(\d{15,22})$/.exec(trimmed);
  if (guildMatch && isDiscordSnowflake(guildMatch[1])) {
    return `/dashboard/${guildMatch[1]}`;
  }
  return "/dashboard";
}

function encodeDestChar(next: string): string {
  if (next === "/admin") return "a";
  if (next === "/premium") return "p";
  if (/^\/dashboard\/\d{15,22}$/.test(next)) return "g";
  return "d";
}

function decodeDestChar(ch: string): string {
  if (ch === "a") return "/admin";
  if (ch === "p") return "/premium";
  return "/dashboard";
}

/**
 * Creates a clean RFC 6749 opaque hexadecimal HMAC-SHA256 OAuth2 `state` token
 * (49 lowercase alphanumeric chars, no embedded URLs or base64 payloads).
 */
export function createSignedOAuthState(input: {
  next: string;
  redirectUri: string;
}): string | null {
  const secret = getSessionSecret();
  if (!secret) return null;

  const exp = Math.floor(Date.now() / 1000) + OAUTH_STATE_TTL_SECONDS;
  const expHex = exp.toString(16).padStart(8, "0").slice(-8);
  const dest = encodeDestChar(input.next);
  const nonce = crypto.randomBytes(8).toString("hex");
  const core = `${expHex}${dest}${nonce}`;
  const sig = crypto
    .createHmac("sha256", `lc-oauth-state-v4:${secret}`)
    .update(core)
    .digest("hex")
    .slice(0, 24);
  void input.redirectUri;
  return `${core}${sig}`;
}

export function verifySignedOAuthState(
  state: string | null | undefined,
  nextCookie?: string | null,
): SignedOAuthStatePayload | null {
  const secret = getSessionSecret();
  if (!secret || !state || state.length !== 49) return null;
  if (!/^[0-9a-f]{8}[adpg][0-9a-f]{40}$/.test(state)) return null;

  const core = state.slice(0, 25);
  const providedSig = state.slice(25);
  const expectedSig = crypto
    .createHmac("sha256", `lc-oauth-state-v4:${secret}`)
    .update(core)
    .digest("hex")
    .slice(0, 24);

  const a = Buffer.from(providedSig, "utf8");
  const b = Buffer.from(expectedSig, "utf8");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return null;
  }

  const exp = parseInt(core.slice(0, 8), 16);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  const destChar = core[8];
  const resolvedNext =
    destChar === "g" && nextCookie
      ? sanitizeInternalNextPath(nextCookie)
      : decodeDestChar(destChar);

  return {
    n: core.slice(9, 25),
    exp,
    next: resolvedNext,
    ru: "",
  };
}

export function relativeRedirect(
  path: `/${string}`,
  requestContext?: { url: string; headers: Headers },
): NextResponse {
  const safePath = path.startsWith("/") && !path.startsWith("//") ? path : "/";
  if (requestContext) {
    const pub = resolvePublicOrigin(requestContext.url, requestContext.headers);
    const res = NextResponse.redirect(new URL(safePath, pub.origin), 303);
    res.headers.set(
      "Cache-Control",
      "private, no-store, no-cache, max-age=0, must-revalidate",
    );
    res.headers.set("Referrer-Policy", "no-referrer");
    res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    return res;
  }

  return new NextResponse(null, {
    status: 303,
    headers: {
      Location: safePath,
      "Cache-Control": "private, no-store, no-cache, max-age=0, must-revalidate",
      "Referrer-Policy": "no-referrer",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
  });
}

export function getRedirectUri(
  requestUrl: string,
  headers?: Headers,
  storedRedirectUri?: string | null,
): string {
  if (storedRedirectUri) {
    const cleanStored = sanitizeRedirectUri(storedRedirectUri);
    if (cleanStored) {
      return cleanStored;
    }
  }
  return resolveDiscordRedirectUri(requestUrl, headers);
}
