import { NextRequest, NextResponse } from "next/server";
import { requireOwner } from "@/lib/admin";

export const dynamic = "force-dynamic";

/**
 * Bulk-joining previously authenticated users is intentionally disabled.
 * The site's Discord OAuth flow only requests identify/guilds; it does not
 * request the explicit guilds.join consent required for this action.
 */
export async function POST(req: NextRequest) {
  const auth = requireOwner(req);
  if (!auth.ok) return auth.response;

  return NextResponse.json(
    {
      error:
        "This action is disabled. Users have not granted the Discord guilds.join OAuth permission.",
    },
    { status: 501 },
  );
}
