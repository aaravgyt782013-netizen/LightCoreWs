export const DEFAULT_DISCORD_CLIENT_ID = "1559607601115955210";

export const DEFAULT_BOT_INVITE_URL =
  `https://discord.com/oauth2/authorize?client_id=${DEFAULT_DISCORD_CLIENT_ID}&permissions=8&integration_type=0&scope=bot`;

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

const ALLOWED_USER_SCOPES = new Set([
  "identify",
  "email",
  "guilds",
  "guilds.join",
  "connections",
  "role_connections.write",
]);

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
  const scope = options?.includeCommandsScope
    ? "bot applications.commands"
    : "bot";

  // Build query manually so `scope=bot` matches Discord's canonical invite link.
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

  // Also allow official discord.com/application-directory/<id> install links,
  // otherwise keep valid external redirect links (e.g. custom vanity /invite) clean.
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

export function resolveOAuthScopes(raw?: string | null): string {
  const cleaned = cleanEnvString(raw);
  if (!cleaned) return DEFAULT_OAUTH_SCOPES;

  // By default keep scopes restricted to safe bot-dashboard scopes (`identify`, `guilds`)
  // so browsers never flag shared hosting domains (*.onrender.com) for `guilds.join`
  // or `email` harvesting. Set `DISCORD_ALLOW_EXTENDED_SCOPES=true` to opt in.
  const allowExtended =
    cleanEnvString(process.env.DISCORD_ALLOW_EXTENDED_SCOPES).toLowerCase() ===
    "true";

  const unique: string[] = [];
  for (const token of cleaned.split(/[\s,+]+/)) {
    const scope = token.trim().toLowerCase();
    if (!ALLOWED_USER_SCOPES.has(scope)) continue;
    if (
      !allowExtended &&
      (scope === "guilds.join" || scope === "email")
    ) {
      continue;
    }
    if (!unique.includes(scope)) {
      unique.push(scope);
    }
  }
  if (!unique.includes("identify")) {
    unique.unshift("identify");
  }
  if (!unique.includes("guilds")) {
    unique.push("guilds");
  }
  return unique.length > 0 ? unique.join(" ") : DEFAULT_OAUTH_SCOPES;
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
 * Netlify, Wasmer, Vercel, Railway, Render, custom domains, and localhost).
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
      // In production behind a reverse proxy, `localhost:3000` / `0.0.0.0:3000`
      // is an internal container bind — keep searching or use platform URL env.
      continue;
    }

    if (isInternalCloudHost(host)) {
      continue;
    }

    // All real public domains use HTTPS (required by Discord OAuth2).
    return {
      origin: `https://${host}`,
      host,
      fromLiveRequest: true,
    };
  }

  // Fallback to platform-provided public URL environment variables.
  const envOrigins = [
    process.env.RENDER_EXTERNAL_URL, // Render web service URL (e.g. https://lightcorews.onrender.com)
    process.env.RENDER_EXTERNAL_HOSTNAME, // Render hostname
    process.env.URL, // Netlify primary site URL
    process.env.DEPLOY_PRIME_URL, // Netlify branch/deploy URL
    process.env.VERCEL_PROJECT_PRODUCTION_URL, // Vercel production domain
    process.env.VERCEL_URL, // Vercel deployment domain
    process.env.NEXT_PUBLIC_SITE_URL,
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
    // Strip accidental query/hash and trailing slash (Discord requires exact match).
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
 * - Matches the exact domain the user opened `/login` on (so cookies & callback align)
 * - Strips accidental quotes, trailing slashes, `:443` ports, and `&amp;`
 * - Honors `DISCORD_REDIRECT_URI` when it matches the live host (e.g. custom callback path),
 *   while ignoring stale cross-domain values left over from an older host
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

  // If invoked on a local server in production (e.g. local `next start` smoke test)
  if (!live.fromLiveRequest) {
    try {
      const reqHost = normalizeHost(new URL(requestUrl).host);
      if (reqHost && isLocalHost(reqHost) && !process.env.URL && !process.env.VERCEL_URL) {
        const localHost = reqHost.replace(/^0\.0\.0\.0\b/, "localhost");
        if (!process.env.NEXT_PUBLIC_SITE_URL) {
          return `${live.origin}/api/auth/callback/discord`;
        }
        void localHost;
      }
    } catch {
      // ignore
    }
  }

  return `${live.origin}/api/auth/callback/discord`;
}
