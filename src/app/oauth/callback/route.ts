import { NextRequest } from "next/server";
import { GET as callbackGet } from "@/app/api/auth/callback/discord/route";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return callbackGet(req);
}
