import { NextRequest, NextResponse } from "next/server";
import { verifyBearerSecret } from "@/lib/log-store";
import {
  getGuildSubscription,
  getUserSubscription,
} from "@/lib/premium-store";

export const dynamic = "force-dynamic";

/**
 * Authenticated lookup for the LightCore Discord bot to enforce account-locked
 * No-Prefix, Vanity Guard, Anti-Betray, and Ultra Pro features.
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
            userId: userSub.userId,
            tier: userSub.tier,
            tierName: userSub.tierName,
            guildId: userSub.guildId,
            expiresAt: userSub.expiresAt,
          }
        : { active: false },
      guildPremium: guildSub
        ? {
            active: true,
            guildId: guildSub.guildId,
            ownerUserId: guildSub.userId,
            tier: guildSub.tier,
            tierName: guildSub.tierName,
            expiresAt: guildSub.expiresAt,
          }
        : { active: false },
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
