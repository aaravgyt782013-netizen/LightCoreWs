import { NextRequest, NextResponse } from "next/server";
import { site } from "@/lib/site";
import {
  cleanEnvString,
  resolveDiscordClientId,
  resolveOAuthScopes,
  sanitizeDiscordInviteUrl,
} from "@/lib/discord-oauth";
import { getRedirectUri, getSessionSecret } from "@/lib/session";
import { getSiteConfig } from "@/lib/site-config-server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const clientId = resolveDiscordClientId();
  const redirectUri = getRedirectUri(req.url, req.headers);
  const scopes = resolveOAuthScopes(
    process.env.DISCORD_OAUTH_SCOPES ||
      process.env.NEXT_PUBLIC_DISCORD_OAUTH_SCOPES,
  );
  const clientSecret = cleanEnvString(process.env.DISCORD_CLIENT_SECRET);
  const sessionSecret = getSessionSecret();
  const siteCfg = await getSiteConfig();
  const inviteUrl = sanitizeDiscordInviteUrl(
    siteCfg.inviteUrl || site.invite,
    clientId,
  );

  return NextResponse.json(
    {
      clientId,
      redirectUri,
      inviteUrl,
      supportUrl: siteCfg.supportUrl || site.discord,
      scopes,
      oauthConfigured: Boolean(clientSecret && sessionSecret.length > 0),
    },
    {
      headers: { "Cache-Control": "no-store, max-age=0" },
    },
  );
}
