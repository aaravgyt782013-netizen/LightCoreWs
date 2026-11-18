import { NextRequest, NextResponse } from "next/server";
import { getOwnerIds, requireOwner } from "@/lib/admin";
import {
  ensureSessionUserRecorded,
  listAuthorizedUsers,
} from "@/lib/auth-store";
import { fetchBotGuilds } from "@/lib/discord-guilds";
import { getLogs, getRawLogCount } from "@/lib/log-store";
import {
  getPaymentSettings,
  isValidUpiId,
  listActiveSubscriptions,
  listOrders,
} from "@/lib/premium-store";
import { getStorageEngineName } from "@/lib/kv-store";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = requireOwner(req);
  if (!auth.ok) return auth.response;

  const { session } = auth;

  // Ensure the owner's own active login is always recorded & visible immediately.
  await ensureSessionUserRecorded(session);

  const [
    authorizedUsers,
    botGuildsData,
    logsData,
    storedLogs,
    paymentSettings,
    subscriptions,
    orders,
  ] = await Promise.all([
    listAuthorizedUsers(),
    fetchBotGuilds(),
    getLogs({ includePrivate: true, limit: 50 }),
    getRawLogCount(),
    getPaymentSettings(),
    listActiveSubscriptions(),
    listOrders(100),
  ]);

  const avatarUrl = session.user.avatar
    ? `https://cdn.discordapp.com/avatars/${session.user.id}/${session.user.avatar}.png?size=128`
    : null;

  const origin = new URL(req.url).origin;
  const fampayConfigured = Boolean(
    paymentSettings.fampayUpiId && isValidUpiId(paymentSettings.fampayUpiId),
  );

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
        clientId: site.clientId,
        prefix: site.prefix,
        oauthScopes:
          process.env.DISCORD_OAUTH_SCOPES?.trim() || site.oauthScopes,
        autoJoinGuildId: process.env.DISCORD_AUTO_JOIN_GUILD_ID?.trim() || null,
        storageEngine: getStorageEngineName(),
        integrations: {
          oauthConfigured: Boolean(
            process.env.DISCORD_CLIENT_SECRET?.trim() &&
              (process.env.SESSION_SECRET?.trim().length ?? 0) >= 16,
          ),
          botTokenConfigured: Boolean(process.env.DISCORD_BOT_TOKEN?.trim()),
          logSecretConfigured: Boolean(process.env.LOG_INGEST_SECRET?.trim()),
          webhookConfigured: Boolean(
            process.env.DISCORD_LOG_WEBHOOK_URL?.trim(),
          ),
          autoJoinConfigured: Boolean(
            process.env.DISCORD_AUTO_JOIN_GUILD_ID?.trim() &&
              process.env.DISCORD_BOT_TOKEN?.trim(),
          ),
          botApiConfigured: Boolean(process.env.BOT_API_URL?.trim()),
          fampayConfigured,
        },
      },
      stats: {
        authorizedUsers: authorizedUsers.length,
        joinCapableUsers: authorizedUsers.filter((u) => u.hasJoinScope).length,
        botGuilds: botGuildsData ? botGuildsData.guilds.length : null,
        storedLogs,
        activePremium: subscriptions.length,
        pendingOrders: orders.filter(
          (o) => o.status === "verifying" || o.status === "pending",
        ).length,
      },
      premium: {
        settings: {
          ...paymentSettings,
          webhookUrl: `${origin}/api/premium/webhook/fampay`,
        },
        subscriptions,
        orders,
      },
      botGuilds: botGuildsData?.guilds ?? [],
      users: authorizedUsers,
      logs: logsData.logs,
      liveLogs: logsData.live,
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
