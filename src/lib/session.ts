import crypto from "node:crypto";
import { NextResponse } from "next/server";
import {
  cleanEnvString,
  resolveDiscordRedirectUri,
  resolvePublicOrigin,
  sanitizeRedirectUri,
} from "@/lib/discord-oauth";

export const SESSION_COOKIE = "lc_session";
export const OAUTH_STATE_COOKIE = "lc_oauth_state";
export const OAUTH_NEXT_COOKIE = "lc_oauth_next";
export const OAUTH_REDIRECT_COOKIE = "lc_oauth_redirect";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const OAUTH_STATE_TTL_SECONDS = 60 * 15; // 15 minutes

export type SessionUser = {
  id: string;
  username: string;
  globalName: string | null;
  avatar: string | null;
  email?: string | null;
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
 * Supports explicit `SESSION_SECRET` of any length, and safely derives a
 * domain-separated fallback from `DISCORD_CLIENT_SECRET` if `SESSION_SECRET`
 * was omitted or shorter than 16 characters.
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

export function getVaultCipherKey(): Buffer | null {
  const secret = getSessionSecret();
  if (!secret) return null;
  return deriveKey(secret, "lightcore-oauth-vault-v1");
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

/**
 * Creates a compact, URL-free, HMAC-SHA256 signed OAuth2 `state` token:
 * `<expBase36>-<destCode>-<nonce>-<sig>`
 * Avoids embedding base64 URLs in query strings (which trigger browser phishing
 * heuristics on shared hosting domains) while staying CSRF-safe and surviving
 * mobile Discord-app <-> browser handoffs.
 */
function encodeNextCode(next: string): string {
  if (next === "/admin") return "a";
  if (next === "/premium") return "p";
  const guildMatch = /^\/dashboard\/(\d{15,22})$/.exec(next);
  if (guildMatch) return `g${guildMatch[1]}`;
  return "d";
}

function decodeNextCode(code: string): string {
  if (code === "a") return "/admin";
  if (code === "p") return "/premium";
  if (/^g\d{15,22}$/.test(code)) return `/dashboard/${code.slice(1)}`;
  return "/dashboard";
}

export function createSignedOAuthState(input: {
  next: string;
  redirectUri: string;
}): string | null {
  const secret = getSessionSecret();
  if (!secret) return null;

  const expStr = (
    Math.floor(Date.now() / 1000) + OAUTH_STATE_TTL_SECONDS
  ).toString(36);
  const dest = encodeNextCode(input.next);
  const nonce = crypto.randomBytes(9).toString("base64url");
  const core = `${expStr}.${dest}.${nonce}`;
  const sig = crypto
    .createHmac("sha256", `lc-oauth-state-v3:${secret}`)
    .update(core)
    .digest("base64url")
    .slice(0, 22);
  void input.redirectUri;
  return `${core}.${sig}`;
}

export function verifySignedOAuthState(
  state: string | null | undefined,
): SignedOAuthStatePayload | null {
  const secret = getSessionSecret();
  if (!secret || !state || state.length > 120) return null;

  const parts = state.split(".");
  if (parts.length !== 4) return null;
  const [expStr, dest, nonce, providedSig] = parts;
  if (!expStr || !dest || !nonce || !providedSig) return null;

  const core = `${expStr}.${dest}.${nonce}`;
  const expectedSig = crypto
    .createHmac("sha256", `lc-oauth-state-v3:${secret}`)
    .update(core)
    .digest("base64url")
    .slice(0, 22);

  const a = Buffer.from(providedSig, "utf8");
  const b = Buffer.from(expectedSig, "utf8");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return null;
  }

  const exp = parseInt(expStr, 36);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return {
    n: nonce,
    exp,
    next: decodeNextCode(dest),
    ru: "",
  };
}

export function relativeRedirect(
  path: `/${string}`,
  requestContext?: { url: string; headers: Headers },
): NextResponse {
  if (requestContext) {
    const pub = resolvePublicOrigin(requestContext.url, requestContext.headers);
    const res = NextResponse.redirect(new URL(path, pub.origin), 302);
    res.headers.set(
      "Cache-Control",
      "private, no-store, no-cache, max-age=0, must-revalidate",
    );
    res.headers.set("Pragma", "no-cache");
    return res;
  }

  return new NextResponse(null, {
    status: 302,
    headers: {
      Location: path,
      "Cache-Control": "private, no-store, no-cache, max-age=0, must-revalidate",
      Pragma: "no-cache",
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
