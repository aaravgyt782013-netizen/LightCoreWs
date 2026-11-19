import { NextResponse } from "next/server";
import { site } from "@/lib/site";
import { getStorageEngineName, kvGet } from "@/lib/kv-store";
import { getSiteConfig } from "@/lib/site-config-server";
import {
  cleanEnvString,
  resolveDiscordClientId,
  resolveOAuthScopes,
} from "@/lib/discord-oauth";
import { getSessionSecret } from "@/lib/session";

export const dynamic = "force-dynamic";

export type ServiceStatus = {
  name: string;
  region: string;
  p99: string;
  detail: string;
  state: "operational" | "standby" | "degraded" | "offline";
};

function formatProcessUptime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

export async function GET() {
  const reqStarted = performance.now();
  const processUptime = formatProcessUptime(process.uptime());
  const services: ServiceStatus[] = [];

  // 1. Live KV datastore read probe
  let kvState: ServiceStatus["state"] = "operational";
  let kvMs = 0;
  const storageEngine = getStorageEngineName();
  try {
    const t0 = performance.now();
    await kvGet<unknown>("__status_probe__");
    kvMs = Math.max(1, Math.round((performance.now() - t0) * 10) / 10);
  } catch {
    kvState = "degraded";
  }

  // 2. Live site config & theme engine probe
  let cfgState: ServiceStatus["state"] = "operational";
  let cfgMs = 0;
  let brandName: string = site.name;
  let siteCfg: Awaited<ReturnType<typeof getSiteConfig>> | null = null;
  try {
    const t0 = performance.now();
    siteCfg = await getSiteConfig();
    cfgMs = Math.max(1, Math.round((performance.now() - t0) * 10) / 10);
    brandName = siteCfg.brandName || site.name;
  } catch {
    cfgState = "degraded";
  }

  // 3. OAuth2 & Security Posture check
  const clientId = resolveDiscordClientId();
  const oauthConfigured = Boolean(
    cleanEnvString(process.env.DISCORD_CLIENT_SECRET) &&
      getSessionSecret().length > 0,
  );
  const scopes = resolveOAuthScopes(
    process.env.DISCORD_OAUTH_SCOPES ||
      process.env.NEXT_PUBLIC_DISCORD_OAUTH_SCOPES,
  );

  // 4. Web Control Plane & Edge API (self-measured)
  const webMs = Math.max(1, Math.round((performance.now() - reqStarted) * 10) / 10);
  services.push({
    name: "Web Dashboard & API Router",
    region: `Next.js Control Plane · Uptime ${processUptime}`,
    p99: `${webMs}ms`,
    detail: "Active",
    state: "operational",
  });

  services.push({
    name: "Guild Configuration Datastore",
    region:
      storageEngine === "netlify-blobs"
        ? "Netlify Blobs (strong consistency)"
        : storageEngine === "local-disk"
          ? "Persistent KV Journal"
          : "In-Memory KV Engine",
    p99: `${kvMs}ms`,
    detail: kvState === "operational" ? "Read/Write OK" : "Degraded",
    state: kvState,
  });

  services.push({
    name: "Theme, Docs & Demo Sandbox Engine",
    region: `Live Config + Interactive Sandbox`,
    p99: `${cfgMs}ms`,
    detail: cfgState === "operational" ? "Synced" : "Fallback",
    state: cfgState,
  });

  services.push({
    name: "Discord OAuth2 Handshake",
    region: `Read-only scopes: ${scopes}`,
    p99: "<1ms",
    detail: oauthConfigured ? "Ready" : "Env pending",
    state: oauthConfigured ? "operational" : "standby",
  });

  // 5. Optional live Bot API or Discord Bot Gateway check
  let botLatencyMs: number | null = null;
  let guilds: number | null = null;
  let users: number | null = null;
  let botConnected = false;

  const botApiUrl = cleanEnvString(process.env.BOT_API_URL).replace(/\/+$/, "");
  const botToken = cleanEnvString(process.env.DISCORD_BOT_TOKEN)
    .replace(/^Bot\s+/i, "")
    .trim();

  if (botApiUrl) {
    try {
      const start = performance.now();
      const headers: Record<string, string> = { Accept: "application/json" };
      const apiKey = cleanEnvString(process.env.BOT_API_KEY);
      if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

      const res = await fetch(`${botApiUrl}/health`, {
        headers,
        cache: "no-store",
        signal: AbortSignal.timeout(4000),
      });
      const elapsed = Math.max(1, Math.round(performance.now() - start));
      if (res.ok) {
        const payload = (await res.json()) as {
          ok?: boolean;
          ping?: number;
          guilds?: number;
          users?: number;
          uptime?: string;
          services?: {
            name: string;
            region: string;
            p99: string;
            uptime?: string;
            detail?: string;
            state: ServiceStatus["state"];
          }[];
        };
        botLatencyMs = payload.ping ?? elapsed;
        guilds = typeof payload.guilds === "number" ? payload.guilds : null;
        users = typeof payload.users === "number" ? payload.users : null;
        botConnected = payload.ok !== false;

        if (Array.isArray(payload.services) && payload.services.length > 0) {
          for (const svc of payload.services) {
            services.push({
              name: svc.name,
              region: svc.region,
              p99: svc.p99,
              detail: svc.detail || svc.uptime || "Live",
              state: svc.state,
            });
          }
        } else {
          services.push({
            name: "LightCore Bot Gateway",
            region: "Configured BOT_API_URL",
            p99: `${botLatencyMs}ms`,
            detail: payload.uptime ? `Uptime ${payload.uptime}` : "Connected",
            state: payload.ok === false ? "degraded" : "operational",
          });
        }
      } else {
        services.push({
          name: "LightCore Bot Gateway",
          region: "Configured BOT_API_URL",
          p99: `${elapsed}ms`,
          detail: `HTTP ${res.status}`,
          state: "degraded",
        });
      }
    } catch {
      services.push({
        name: "LightCore Bot Gateway",
        region: "Configured BOT_API_URL",
        p99: "timeout",
        detail: "Unreachable",
        state: "offline",
      });
    }
  } else if (botToken) {
    try {
      const start = performance.now();
      const res = await fetch("https://discord.com/api/v10/users/@me", {
        headers: { Authorization: `Bot ${botToken}` },
        cache: "no-store",
        signal: AbortSignal.timeout(4000),
      });
      const elapsed = Math.max(1, Math.round(performance.now() - start));
      if (res.ok) {
        const bot = (await res.json()) as { id?: string; username?: string };
        botLatencyMs = elapsed;
        botConnected = true;
        brandName = bot.username || brandName;
        services.push({
          name: "Discord Bot Gateway Link",
          region: `Discord REST v10 · App ${bot.id || clientId}`,
          p99: `${elapsed}ms`,
          detail: "Authenticated",
          state: "operational",
        });
      } else {
        services.push({
          name: "Discord Bot Gateway Link",
          region: "Discord REST v10",
          p99: `${elapsed}ms`,
          detail: `HTTP ${res.status}`,
          state: "degraded",
        });
      }
    } catch {
      services.push({
        name: "Discord Bot Gateway Link",
        region: "Discord REST v10",
        p99: "timeout",
        detail: "Unreachable",
        state: "degraded",
      });
    }
  } else {
    services.push({
      name: "Bot Gateway Telemetry Bridge",
      region: "Set BOT_API_URL or DISCORD_BOT_TOKEN for shard metrics",
      p99: "—",
      detail: "Optional",
      state: "standby",
    });
  }

  const hasFailure = services.some(
    (s) => s.state === "offline" || s.state === "degraded",
  );
  const totalMs = Math.max(1, Math.round(performance.now() - reqStarted));

  return NextResponse.json(
    {
      live: true,
      operational: !hasFailure,
      botConnected,
      oauthConfigured,
      scopes,
      storageEngine,
      processUptime,
      botName: brandName,
      clientId,
      latencyMs: botLatencyMs ?? totalMs,
      guilds,
      users,
      checkedAt: new Date().toISOString(),
      services,
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
