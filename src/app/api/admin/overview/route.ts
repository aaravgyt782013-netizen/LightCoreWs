import { NextRequest, NextResponse } from "next/server";
import { getOwnerIds, requireOwner } from "@/lib/admin";
import {
  ensureSessionUserRecorded,
  listAuthorizedUsers,
} from "@/lib/auth-store";
import { fetchBotGuilds } from "@/lib/discord-guilds";
import { getLogs, getRawLogCount } from "@/lib/log-store";
import {
  isRecordCurrentlyActive,
  listAllPremiumRecords,
  listPremiumInvoices,
} from "@/lib/premium-store";
import { getSiteConfig } from "@/lib/site-config-server";
import { getStorageEngineName } from "@/lib/kv-store";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = requireOwner(req);
  if (!auth.ok) return auth.response;

  const { session } = auth;
  await ensureSessionUserRecorded(session);

  const [
    authorizedUsers,
    botGuildsData,
    logsData,
    storedLogs,
    premiumRecords,
    invoices,
    siteConfig,
  ] = await Promise.all([
    listAuthorizedUsers(),
    fetchBotGuilds(),
    getLogs({ includePrivate: true, limit: 60 }),
    getRawLogCount(),
    listAllPremiumRecords(500),
    listPremiumInvoices(200),
    getSiteConfig(),
  ]);

  const avatarUrl = session.user.avatar
    ? `https://cdn.discordapp.com/avatars/${session.user.id}/${session.user.avatar}.png?size=128`
    : null;

  const now = Date.now();
  const activeRecords = premiumRecords.filter((r) =>
    isRecordCurrentlyActive(r, now),
  );
  const activePremiumUsers = activeRecords.filter(
    (r) => r.targetType === "user" || r.targetType === "both",
  ).length;
  const activePremiumGuilds = activeRecords.filter(
    (r) => r.targetType === "guild" || r.targetType === "both",
  ).length;
  const pendingInvoices = invoices.filter(
    (i) => i.status === "pending_ticket",
  ).length;

  return NextResponse.json(
    {
      owner: {
        id: session.user.id,
        username: session.user.username,
        globalName: session.user.globalName,
        avatarUrl,
      },
      config: {
        ownerIds: getOwnerIds(),
        clientId: process.env.DISCORD_CLIENT_ID || site.clientId,
        prefix: siteConfig.prefix || site.prefix,
        oauthScopes: site.oauthScopes,
        autoJoinGuildId: process.env.DISCORD_AUTO_JOIN_GUILD_ID?.trim() || null,
        storageEngine: getStorageEngineName(),
        integrations: {
          oauthConfigured: Boolean(
            process.env.DISCORD_CLIENT_SECRET &&
              process.env.SESSION_SECRET &&
              process.env.SESSION_SECRET.length >= 16,
          ),
          botTokenConfigured: Boolean(process.env.DISCORD_BOT_TOKEN?.trim()),
          logSecretConfigured: Boolean(process.env.LOG_INGEST_SECRET?.trim()),
          webhookConfigured: Boolean(
            process.env.DISCORD_LOG_WEBHOOK_URL?.trim(),
          ),
          autoJoinConfigured: Boolean(
            process.env.DISCORD_AUTO_JOIN_GUILD_ID?.trim(),
          ),
          botApiConfigured: Boolean(process.env.BOT_API_URL?.trim()),
        },
      },
      stats: {
        authorizedUsers: authorizedUsers.length,
        joinCapableUsers: authorizedUsers.filter((u) => u.hasJoinScope).length,
        botGuilds: botGuildsData ? botGuildsData.guilds.length : null,
        storedLogs,
        activePremium: activeRecords.length,
        activePremiumUsers,
        activePremiumGuilds,
        totalPremiumRecords: premiumRecords.length,
        pendingInvoices,
      },
      siteConfig,
      premium: {
        records: premiumRecords,
        invoices,
      },
      botGuilds: botGuildsData?.guilds ?? [],
      users: authorizedUsers,
      logs: logsData.logs,
      liveLogs: logsData.live,
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
