import { NextRequest } from "next/server";
import { handleDiscordOAuthCallback } from "../../callback/discord/route";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handleDiscordOAuthCallback(req);
}
