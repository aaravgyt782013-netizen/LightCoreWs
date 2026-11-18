import { NextRequest, NextResponse } from "next/server";
import { verifyBearerSecret } from "@/lib/log-store";
import {
  getGuildSubscription,
  getUserSubscription,
} from "@/lib/premium-store";

export const dynamic = "force-dynamic";

/**
 * Authenticated lookup for the LightCore Discord bot to verify User & Guild
 * Premium status, tier, perks, lifetime status, and expiry countdown.
 */
export async function GET(req: NextRequest) {
  const secret =
    process.env.BOT_API_KEY?.trim() || process.env.LOG_INGEST_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "Configure BOT_API_KEY or LOG_INGEST_SECRET on server" },
      { status: 503 },
    );
  }

  if (!verifyBearerSecret(req.headers.get("authorization"), secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId")?.trim() || "";
  const guildId = searchParams.get("guildId")?.trim() || "";

  const [userSub, guildSub] = await Promise.all([
    userId ? getUserSubscription(userId) : Promise.resolve(null),
    guildId ? getGuildSubscription(guildId) : Promise.resolve(null),
  ]);

  return NextResponse.json(
    {
      userPremium: userSub
        ? {
            active: true,
            id: userSub.id,
            userId: userSub.userId,
            tier: userSub.tier,
            tierName: userSub.tierName,
            isLifetime: userSub.isLifetime,
            guildId: userSub.guildId,
            grantedBy: userSub.grantedBy,
            perks: userSub.perks,
            activatedAt: userSub.activatedAt,
            expiresAt: userSub.expiresAt,
          }
        : { active: false },
      guildPremium: guildSub
        ? {
            active: true,
            id: guildSub.id,
            guildId: guildSub.guildId,
            ownerUserId: guildSub.userId || null,
            tier: guildSub.tier,
            tierName: guildSub.tierName,
            isLifetime: guildSub.isLifetime,
            grantedBy: guildSub.grantedBy,
            perks: guildSub.perks,
            activatedAt: guildSub.activatedAt,
            expiresAt: guildSub.expiresAt,
          }
        : { active: false },
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
