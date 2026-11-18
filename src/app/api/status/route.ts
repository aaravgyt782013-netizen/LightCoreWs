import { NextResponse } from "next/server";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export type ServiceStatus = {
  name: string;
  region: string;
  p99: string;
  uptime: string;
  state: "operational" | "degraded" | "offline";
};

export async function GET() {
  const botApiUrl = process.env.BOT_API_URL?.replace(/\/+$/, "");

  if (botApiUrl) {
    try {
      const start = Date.now();
      const headers: Record<string, string> = { Accept: "application/json" };
      if (process.env.BOT_API_KEY) {
        headers.Authorization = `Bearer ${process.env.BOT_API_KEY}`;
      }
      const res = await fetch(`${botApiUrl}/health`, {
        headers,
        cache: "no-store",
        signal: AbortSignal.timeout(4000),
      });
      const latencyMs = Date.now() - start;
      if (res.ok) {
        const payload = (await res.json()) as {
          ok?: boolean;
          ping?: number;
          guilds?: number;
          users?: number;
          uptime?: string;
          services?: ServiceStatus[];
        };
        const pingLabel = `${payload.ping ?? latencyMs}ms`;
        const services =
          Array.isArray(payload.services) && payload.services.length > 0
            ? payload.services
            : [
                {
                  name: "Bot API",
                  region: "configured endpoint",
                  p99: pingLabel,
                  uptime: "Not reported",
                  state: payload.ok === false ? "degraded" : "operational",
                } satisfies ServiceStatus,
              ];
        return NextResponse.json(
          {
            live: true,
            operational: payload.ok !== false,
            botName: site.name,
            clientId: site.clientId,
            latencyMs: payload.ping ?? latencyMs,
            guilds: payload.guilds ?? null,
            users: payload.users ?? null,
            checkedAt: new Date().toISOString(),
            services,
          },
          { headers: { "Cache-Control": "no-store, max-age=0" } },
        );
      }
    } catch {
      // Fall through to Discord bot token check or defaults.
    }
  }

  const botToken = process.env.DISCORD_BOT_TOKEN?.trim();
  if (botToken) {
    try {
      const start = Date.now();
      const res = await fetch("https://discord.com/api/v10/users/@me", {
        headers: { Authorization: `Bot ${botToken}` },
        cache: "no-store",
        signal: AbortSignal.timeout(4000),
      });
      const latencyMs = Date.now() - start;
      if (res.ok) {
        const bot = (await res.json()) as { id: string; username: string };
        return NextResponse.json(
          {
            live: true,
            operational: false,
            botName: bot.username || site.name,
            clientId: bot.id || site.clientId,
            latencyMs,
            guilds: null,
            users: null,
            checkedAt: new Date().toISOString(),
            services: [
              {
                name: "Discord API connection",
                region: "global",
                p99: `${latencyMs}ms`,
                uptime: "Not reported",
                state: "operational",
              } satisfies ServiceStatus,
            ],
          },
          { headers: { "Cache-Control": "no-store, max-age=0" } },
        );
      }
    } catch {
      // Fall through to static baseline.
    }
  }

  return NextResponse.json(
    {
      live: false,
      operational: false,
      botName: site.name,
      clientId: site.clientId,
      latencyMs: null,
      guilds: null,
      users: null,
      checkedAt: new Date().toISOString(),
      services: [],
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
