import { NextResponse } from "next/server";
import { getSiteConfig } from "@/lib/site-config-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const full = await getSiteConfig();
  const config = {
    ...full,
    premiumRoleId: "",
  };
  return NextResponse.json(
    { config },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
