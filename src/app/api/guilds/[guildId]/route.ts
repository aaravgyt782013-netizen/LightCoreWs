import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, unsealSession } from "@/lib/session";
import {
  canManageGuild,
  fetchAllUserGuilds,
  fetchLiveGuildDetails,
  guildIconUrl,
} from "@/lib/discord-guilds";
import { loadGuildConfig, saveGuildConfig } from "@/lib/guild-config";
import { isOwnerId } from "@/lib/admin";
import { buildGuildInviteUrl, site } from "@/lib/site";
import { appendLogs, getLogs } from "@/lib/log-store";
import { sendDiscordLogEmbed } from "@/lib/discord-webhook";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ guildId: string }> };

async function authorizeGuildAccess(req: NextRequest, guildId: string) {
  if (!/^\d{15,22}$/.test(guildId)) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Invalid server ID" }, { status: 400 }),
    };
  }

  const session = unsealSession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Authentication required", code: "unauthenticated" },
        { status: 401 },
      ),
    };
  }

  const userGuilds = await fetchAllUserGuilds(session.accessToken);
  if (!userGuilds) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Could not load your Discord servers. Please sign in again.", code: "discord_error" },
        { status: 502 },
      ),
    };
  }

  const match = userGuilds.find((g) => g.id === guildId);
  if (!match || !canManageGuild(match)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          error:
            "You need Manage Server or Administrator permission in this Discord server.",
          code: "forbidden",
        },
        { status: 403 },
      ),
    };
  }

  return { ok: true as const, session, guild: match, allUserGuilds: userGuilds };
}

export async function GET(req: NextRequest, context: RouteContext) {
  const { guildId } = await context.params;
  const auth = await authorizeGuildAccess(req, guildId);
  if (!auth.ok) return auth.response;

  const { session, guild, allUserGuilds } = auth;
  const [liveDetails, configData, guildLogs] = await Promise.all([
    fetchLiveGuildDetails(guildId),
    loadGuildConfig(guildId),
    getLogs({ guildId, includePrivate: true, limit: 30 }),
  ]);

  const avatarUrl = session.user.avatar
    ? `https://cdn.discordapp.com/avatars/${session.user.id}/${session.user.avatar}.png?size=128`
    : null;

  const switcherGuilds = allUserGuilds
    .filter(canManageGuild)
    .slice(0, 60)
    .map((g) => ({
      id: g.id,
      name: g.name,
      iconUrl: guildIconUrl(g.id, g.icon),
      owner: g.owner,
    }));

  return NextResponse.json(
    {
      user: {
        id: session.user.id,
        username: session.user.username,
        globalName: session.user.globalName,
        avatarUrl,
        isOwner: isOwnerId(session.user.id),
      },
      guild: {
        id: guild.id,
        name: guild.name,
        iconUrl: guildIconUrl(guild.id, guild.icon),
        owner: guild.owner,
        inviteUrl: buildGuildInviteUrl(guild.id),
        botInGuild: liveDetails ? liveDetails.botInGuild : null,
        memberCount: liveDetails?.memberCount ?? null,
        onlineCount: liveDetails?.onlineCount ?? null,
        boostCount: liveDetails?.boostCount ?? null,
        boostTier: liveDetails?.boostTier ?? null,
        channels: liveDetails?.channels ?? [],
        roles: liveDetails?.roles ?? [],
      },
      switcherGuilds,
      config: configData.config,
      syncedWithBot: configData.syncedWithBot,
      logs: guildLogs.logs,
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const { guildId } = await context.params;
  const auth = await authorizeGuildAccess(req, guildId);
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rec = (body ?? {}) as { config?: unknown; section?: unknown };
  const patch = rec.config && typeof rec.config === "object" ? rec.config : body;
  const sectionLabel =
    typeof rec.section === "string" && rec.section.trim()
      ? rec.section.trim().slice(0, 40)
      : "settings";

  const actor = `@${auth.session.user.username}`;
  const saved = await saveGuildConfig(guildId, patch, actor);

  appendLogs([
    {
      id: crypto.randomUUID(),
      t: "CONFIG",
      ok: true,
      msg: `${sectionLabel} updated by ${actor}`,
      guild: auth.guild.name,
      guildId: auth.guild.id,
      guildOnly: true,
      ts: new Date().toISOString(),
    },
  ]);

  await sendDiscordLogEmbed({
    title: `${site.name} · Server Config Updated`,
    description: `**${auth.session.user.globalName || auth.session.user.username}** (\`${actor}\`) updated **${sectionLabel}** in **${auth.guild.name}**.`,
    color: 0x10b981,
    timestamp: new Date().toISOString(),
    fields: [
      { name: "Server ID", value: `\`${auth.guild.id}\``, inline: true },
      { name: "Module", value: `\`${sectionLabel}\``, inline: true },
      { name: "Prefix", value: `\`${saved.config.general.prefix}\``, inline: true },
    ],
  });

  return NextResponse.json({
    ok: true,
    config: saved.config,
    syncedWithBot: saved.syncedWithBot,
    savedAt: saved.config.updatedAt,
  });
}
