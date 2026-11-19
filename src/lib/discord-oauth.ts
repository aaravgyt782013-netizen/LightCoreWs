export const DEFAULT_DISCORD_CLIENT_ID = "1559607601115955210";

export const DEFAULT_BOT_INVITE_URL =
  `https://discord.com/oauth2/authorize?client_id=${DEFAULT_DISCORD_CLIENT_ID}&permissions=8&integration_type=0&scope=bot%20applications.commands`;

/**
 * Strict least-privilege, read-only Discord OAuth2 user scopes:
 * - `identify`: read the user's public Discord ID, display name, and avatar
 * - `guilds`: read the user's server list & permission bitfield to show managed guilds
 * Write scopes (such as `guilds.join`) and personal data scopes (`email`) are
 * never requested.
 */
export const DEFAULT_OAUTH_SCOPES = "identify guilds";

const SNOWFLAKE_RE = /^\d{15,22}$/;

const DISCORD_AUTH_HOSTS = new Set([
  "discord.com",
  "www.discord.com",
  "canary.discord.com",
  "ptb.discord.com",
  "discordapp.com",
  "www.discordapp.com",
]);

const ALLOWED_USER_SCOPES = new Set(["identify", "guilds"]);

const SAFE_HOST_RE =
  /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*(?::\d{1,5})?$/;

/**
 * Clean values copied from .env files, Markdown, or HTML into hosting dashboards:
 * trims whitespace, strips matching surrounding quotes, decodes `&amp;`, and
 * unescapes Markdown `\_` / `\&`.
 */
export function cleanEnvString(raw?: string | null): string {
  if (typeof raw !== "string") return "";
  let s = raw.trim();
  while (
    s.length >= 2 &&
    ((s.startsWith('"') && s.endsWith('"')) ||
      (s.startsWith("'") && s.endsWith("'")) ||
      (s.startsWith("`") && s.endsWith("`")))
  ) {
    s = s.slice(1, -1).trim();
  }
  return s
    .replace(/&amp;/gi, "&")
    .replace(/\\_/g, "_")
    .replace(/\\&/g, "&")
    .trim();
}

export function isDiscordSnowflake(value?: string | null): value is string {
  return typeof value === "string" && SNOWFLAKE_RE.test(value.trim());
}

export function resolveDiscordClientId(): string {
  const pub = cleanEnvString(process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID);
  if (isDiscordSnowflake(pub)) return pub;
  const srv = cleanEnvString(process.env.DISCORD_CLIENT_ID);
  if (isDiscordSnowflake(srv)) return srv;
  return DEFAULT_DISCORD_CLIENT_ID;
}

export function buildCanonicalBotInviteUrl(
  clientId: string = DEFAULT_DISCORD_CLIENT_ID,
  options?: {
    permissions?: string;
    integrationType?: "0" | "1";
    includeCommandsScope?: boolean;
    guildId?: string;
    disableGuildSelect?: boolean;
  },
): string {
  const cid = isDiscordSnowflake(clientId) ? clientId : DEFAULT_DISCORD_CLIENT_ID;
  const perms =
    options?.permissions && /^\d{1,20}$/.test(options.permissions)
      ? options.permissions
      : "8";
  const intType = options?.integrationType === "1" ? "1" : "0";
  const scope =
    options?.includeCommandsScope === false
      ? "bot"
      : "bot applications.commands";

  const params = new URLSearchParams();
  params.set("client_id", cid);
  params.set("permissions", perms);
  params.set("integration_type", intType);
  params.set("scope", scope);
  if (options?.guildId && isDiscordSnowflake(options.guildId)) {
    params.set("guild_id", options.guildId);
    if (options.disableGuildSelect !== false) {
      params.set("disable_guild_select", "true");
    }
  }
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

/**
 * Sanitizes any Discord bot invite URL so it can NEVER trigger
 * "Invalid OAuth2 redirect_uri":
 * - Strips quotes, `&amp;`, Markdown `\_`, and whitespace
 * - Removes `redirect_uri`, `response_type`, `state`, `prompt`, and PKCE params
 * - Validates `client_id`, `permissions`, `integration_type`, and `scope=bot`
 */
export function sanitizeDiscordInviteUrl(
  raw?: string | null,
  fallbackClientId: string = DEFAULT_DISCORD_CLIENT_ID,
  options?: { enforceClientId?: boolean },
): string {
  const validFallbackCid = isDiscordSnowflake(fallbackClientId)
    ? fallbackClientId
    : DEFAULT_DISCORD_CLIENT_ID;
  const fallback = buildCanonicalBotInviteUrl(validFallbackCid);

  const cleaned = cleanEnvString(raw);
  if (!cleaned) return fallback;

  let parsed: URL;
  try {
    parsed = new URL(cleaned);
  } catch {
    return fallback;
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return fallback;
  }

  const host = parsed.hostname.toLowerCase();
  const isDiscordAuthorize =
    DISCORD_AUTH_HOSTS.has(host) &&
    /^\/(?:api\/(?:v\d+\/)?)?oauth2\/authorize\/?$/i.test(parsed.pathname);

  if (isDiscordAuthorize) {
    const rawCid = cleanEnvString(parsed.searchParams.get("client_id"));
    const cid = options?.enforceClientId
      ? validFallbackCid
      : isDiscordSnowflake(rawCid)
        ? rawCid
        : validFallbackCid;

    const rawPerms = cleanEnvString(parsed.searchParams.get("permissions"));
    const permissions = /^\d{1,20}$/.test(rawPerms) ? rawPerms : "8";

    const rawIntType = cleanEnvString(
      parsed.searchParams.get("integration_type"),
    );
    const integrationType: "0" | "1" = rawIntType === "1" ? "1" : "0";

    const rawScope = cleanEnvString(parsed.searchParams.get("scope"));
    const scopeTokens = rawScope
      .split(/[\s,+]+/)
      .map((t) => t.toLowerCase())
      .filter(Boolean);
    const includeCommandsScope = scopeTokens.includes("applications.commands");

    const rawGuildId = cleanEnvString(parsed.searchParams.get("guild_id"));
    const guildId = isDiscordSnowflake(rawGuildId) ? rawGuildId : undefined;
    const disableGuildSelect =
      parsed.searchParams.get("disable_guild_select") === "true";

    return buildCanonicalBotInviteUrl(cid, {
      permissions,
      integrationType,
      includeCommandsScope,
      guildId,
      disableGuildSelect: guildId ? disableGuildSelect : false,
    });
  }

  if (DISCORD_AUTH_HOSTS.has(host)) {
    parsed.protocol = "https:";
    parsed.hostname = "discord.com";
    parsed.searchParams.delete("redirect_uri");
    parsed.searchParams.delete("response_type");
    parsed.searchParams.delete("state");
    return parsed.toString();
  }

  return parsed.toString();
}

/**
 * Strictly enforces minimal read-only Discord OAuth2 scopes (`identify guilds`).
 * Any legacy write or contact scope in environment variables (e.g. `guilds.join`
 * or `email`) is ignored so authorization always remains 100% read-only.
 */
export function resolveOAuthScopes(raw?: string | null): string {
  const cleaned = cleanEnvString(raw);
  const unique: string[] = [];

  if (cleaned) {
    for (const token of cleaned.split(/[\s,+]+/)) {
      const scope = token.trim().toLowerCase();
      if (ALLOWED_USER_SCOPES.has(scope) && !unique.includes(scope)) {
        unique.push(scope);
      }
    }
  }

  if (!unique.includes("identify")) unique.unshift("identify");
  if (!unique.includes("guilds")) unique.push("guilds");
  return unique.join(" ");
}

export function sanitizeOriginUrl(raw?: string | null): string | null {
  const cleaned = cleanEnvString(raw);
  if (!cleaned) return null;
  try {
    const withProto = /^https?:\/\//i.test(cleaned)
      ? cleaned
      : `https://${cleaned}`;
    const u = new URL(withProto);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    const host = normalizeHost(u.host);
    if (!host) return null;
    const proto = isLocalHost(host) ? u.protocol : "https:";
    return `${proto}//${host}`;
  } catch {
    return null;
  }
}

function normalizeHost(rawHost?: string | null): string | null {
  if (!rawHost) return null;
  const first = rawHost
    .split(",")[0]
    .trim()
    .toLowerCase()
    .replace(/:(443|80)$/, "");
  if (!first || first.length > 253) return null;
  if (!SAFE_HOST_RE.test(first)) return null;
  return first;
}

function isLocalHost(host: string): boolean {
  const hostname = host.split(":")[0];
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0"
  );
}

function isInternalCloudHost(host: string): boolean {
  const hostname = host.split(":")[0];
  return (
    hostname.endsWith(".internal") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".amazonaws.com") ||
    hostname.includes(".lambda-url.")
  );
}

/**
 * Determines the live public origin the user is currently visiting (works on
 * custom domains, Render, Vercel, Netlify, Railway, Wasmer, and localhost).
 */
export function resolvePublicOrigin(
  requestUrl: string,
  headers?: Headers,
): { origin: string; host: string; fromLiveRequest: boolean } {
  const candidates = [
    headers?.get("x-forwarded-host"),
    headers?.get("host"),
    (() => {
      try {
        return new URL(requestUrl).host;
      } catch {
        return null;
      }
    })(),
  ];

  const isProd = process.env.NODE_ENV === "production";

  for (const raw of candidates) {
    const host = normalizeHost(raw);
    if (!host) continue;

    if (isLocalHost(host)) {
      if (!isProd) {
        const localHost = host.replace(/^0\.0\.0\.0\b/, "localhost");
        return {
          origin: `http://${localHost}`,
          host: localHost,
          fromLiveRequest: true,
        };
      }
      continue;
    }

    if (isInternalCloudHost(host)) {
      continue;
    }

    return {
      origin: `https://${host}`,
      host,
      fromLiveRequest: true,
    };
  }

  const envOrigins = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.RENDER_EXTERNAL_URL,
    process.env.RENDER_EXTERNAL_HOSTNAME,
    process.env.URL,
    process.env.DEPLOY_PRIME_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
    "https://lightcorews.onrender.com",
  ];

  for (const raw of envOrigins) {
    const origin = sanitizeOriginUrl(raw);
    if (origin) {
      const host = new URL(origin).host.toLowerCase();
      return { origin, host, fromLiveRequest: false };
    }
  }

  return {
    origin: "https://lightcorews.onrender.com",
    host: "lightcorews.onrender.com",
    fromLiveRequest: false,
  };
}

export function sanitizeRedirectUri(raw?: string | null): string | null {
  const cleaned = cleanEnvString(raw);
  if (!cleaned) return null;
  try {
    const u = new URL(cleaned);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    const host = normalizeHost(u.host);
    if (!host) return null;
    if (!isLocalHost(host) && u.protocol !== "https:") {
      u.protocol = "https:";
    }
    const cleanPath =
      u.pathname === "/" || !u.pathname
        ? "/api/auth/callback/discord"
        : u.pathname.replace(/\/+$/, "");
    const proto = isLocalHost(host) ? u.protocol : "https:";
    return `${proto}//${host}${cleanPath}`;
  } catch {
    return null;
  }
}

/**
 * Resolves the exact Discord OAuth2 `redirect_uri` for the incoming request.
 */
export function resolveDiscordRedirectUri(
  requestUrl: string,
  headers?: Headers,
): string {
  const live = resolvePublicOrigin(requestUrl, headers);
  const envRedirect = sanitizeRedirectUri(process.env.DISCORD_REDIRECT_URI);

  if (envRedirect) {
    const envHost = normalizeHost(new URL(envRedirect).host);
    if (!live.fromLiveRequest || envHost === live.host) {
      return envRedirect;
    }
  }

  return `${live.origin}/api/auth/callback/discord`;
}
