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
import {
  cleanEnvString,
  resolveDiscordClientId,
  resolveOAuthScopes,
  sanitizeDiscordInviteUrl,
} from "@/lib/discord-oauth";
import { getRedirectUri, getSessionSecret } from "@/lib/session";
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
        clientId: resolveDiscordClientId(),
        prefix: siteConfig.prefix || site.prefix,
        oauthScopes: resolveOAuthScopes(
          process.env.DISCORD_OAUTH_SCOPES || site.oauthScopes,
        ),
        redirectUri: getRedirectUri(req.url, req.headers),
        inviteUrl: sanitizeDiscordInviteUrl(
          siteConfig.inviteUrl || site.invite,
          site.clientId,
        ),
        autoJoinGuildId:
          cleanEnvString(process.env.DISCORD_AUTO_JOIN_GUILD_ID) || null,
        storageEngine: getStorageEngineName(),
        integrations: {
          oauthConfigured: Boolean(
            cleanEnvString(process.env.DISCORD_CLIENT_SECRET) &&
              getSessionSecret().length > 0,
          ),
          botTokenConfigured: Boolean(
            cleanEnvString(process.env.DISCORD_BOT_TOKEN),
          ),
          logSecretConfigured: Boolean(
            cleanEnvString(process.env.LOG_INGEST_SECRET),
          ),
          webhookConfigured: Boolean(
            cleanEnvString(process.env.DISCORD_LOG_WEBHOOK_URL),
          ),
          autoJoinConfigured: Boolean(
            cleanEnvString(process.env.DISCORD_AUTO_JOIN_GUILD_ID),
          ),
          botApiConfigured: Boolean(cleanEnvString(process.env.BOT_API_URL)),
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
