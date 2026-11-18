import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, unsealSession } from "@/lib/session";
import { buildGuildInviteUrl } from "@/lib/site";
import {
  canManageGuild,
  fetchAllUserGuilds,
  fetchBotGuilds,
  guildIconUrl,
} from "@/lib/discord-guilds";
import { isOwnerId } from "@/lib/admin";
import { ensureSessionUserRecorded } from "@/lib/auth-store";
import { getUserSubscription } from "@/lib/premium-store";
import { getSiteConfig } from "@/lib/site-config-server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = unsealSession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const [rawGuilds, botGuilds, premium, siteCfg] = await Promise.all([
    fetchAllUserGuilds(session.accessToken).catch(() => null),
    fetchBotGuilds().catch(() => null),
    getUserSubscription(session.user.id).catch(() => null),
    getSiteConfig().catch(() => null),
  ]);

  // Persist/refresh this signed-in user so the Owner Panel always lists every active login.
  await ensureSessionUserRecorded(session, rawGuilds).catch(() => {});

  const allGuilds = (rawGuilds ?? [])
    .map((g) => {
      const canManage = canManageGuild(g);
      return {
        id: g.id,
        name: g.name,
        iconUrl: guildIconUrl(g.id, g.icon),
        owner: g.owner,
        canManage,
        botPresent: botGuilds ? botGuilds.ids.has(g.id) : null,
        inviteUrl: buildGuildInviteUrl(g.id, siteCfg?.inviteUrl),
      };
    })
    .sort(
      (a, b) =>
        Number(Boolean(b.botPresent)) - Number(Boolean(a.botPresent)) ||
        Number(b.canManage) - Number(a.canManage),
    );

  const guilds = allGuilds.filter((g) => g.canManage);

  const avatarUrl = session.user.avatar
    ? `https://cdn.discordapp.com/avatars/${session.user.id}/${session.user.avatar}.png?size=128`
    : null;

  return NextResponse.json(
    {
      authenticated: true,
      user: {
        ...session.user,
        avatarUrl,
        isOwner: isOwnerId(session.user.id),
      },
      premium,
      guilds,
      allGuilds,
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
