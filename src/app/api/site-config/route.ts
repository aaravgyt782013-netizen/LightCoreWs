import { NextResponse } from "next/server";
import { getSiteConfig } from "@/lib/site-config-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = await getSiteConfig();
  return NextResponse.json(
    { config },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
