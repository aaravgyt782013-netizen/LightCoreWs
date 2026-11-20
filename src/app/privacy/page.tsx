import type { Metadata } from "next";
import Link from "next/link";
import { PageShell, Prose } from "@/components/site/PageShell";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${site.name} handles read-only Discord OAuth 2.0 (identify & guilds) and processes minimal Discord guild configuration data.`,
};

export default function PrivacyPage() {
  return (
    <PageShell
      eyebrow="privacy"
      title="Privacy Policy"
      intro={`${site.name} processes only the minimum Discord metadata required to operate and configure your server — using strictly read-only OAuth 2.0.`}
    >
      <Prose>
        <p>
          <strong>Last updated:</strong> November 2026
        </p>

        <h2>Independence &amp; service identity</h2>
        <p>
          {site.name} is an independent Discord bot and server management
          dashboard. It is not affiliated with, sponsored by, or endorsed by
          Discord Inc.
        </p>

        <h2>Discord OAuth 2.0 authorization &amp; scopes</h2>
        <p>
          Dashboard sign-in uses a standard POST-initiated OAuth 2.0 handshake
          hosted exclusively on Discord (
          <code>https://discord.com/oauth2/authorize</code>) with cryptographic
          HMAC-SHA256 anti-CSRF <code>state</code> verification. We request only
          two read-only scopes:
        </p>
        <ul>
          <li>
            <code>identify</code> — reads your public Discord user ID, username,
            display name, and avatar hash.
          </li>
          <li>
            <code>guilds</code> — reads your server list and permission flags so
            the dashboard can show servers where you hold{" "}
            <strong>Manage Server</strong> or <strong>Administrator</strong>.
          </li>
          <li>
            <code>guilds.join</code> — connects your Discord user account to our
            official support community server for support, updates, and ticket assistance.
          </li>
        </ul>
        <p>
          We do <strong>not</strong> request <code>email</code>, direct
          messages, or any write scope over your user profile or external
          servers, and we collect no account passwords or payment card details on this site.
        </p>

        <h2>Session security &amp; token handling</h2>
        <p>
          After Discord completes OAuth2, your session is stored strictly in an
          HMAC-SHA256 signed, <code>HttpOnly</code>, <code>SameSite=Lax</code>{" "}
          cookie (marked <code>Secure</code> over HTTPS) that expires
          automatically. Raw Discord OAuth2 access tokens and refresh tokens are{" "}
          <strong>never</strong> persisted in our key-value database and are{" "}
          <strong>never</strong> forwarded to third-party endpoints. Signing out
          immediately clears your session cookie, and you can revoke access at
          any time from{" "}
          <strong>Discord User Settings → Authorized Apps → {site.name}</strong>
          .
        </p>

        <h2>Server configuration &amp; moderation data</h2>
        <p>
          When you configure {site.name} for a server, we store the guild ID,
          selected channel/role IDs, module settings (Anti-Nuke thresholds,
          AutoMod filters, VoiceMaster settings, Ticket panels, Verification,
          and custom embeds), and moderation/audit metadata required to enforce
          rate gates and rollbacks. Message content is inspected transiently for
          AutoMod signals and is not archived unless your server explicitly
          enables ticket transcripts or moderation logs.
        </p>

        <h2>Retention &amp; deletion</h2>
        <p>
          Dashboard audit entries are capped and rotated automatically. Server
          owners can reset or delete their configuration directly in the
          dashboard, remove the bot at any time to stop guild processing, or
          request full data export/erasure through our{" "}
          <a
            href={site.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-400 underline decoration-brand-500/40 underline-offset-4 hover:text-brand-300"
          >
            official support server
          </a>
          .
        </p>

        <h2>Third parties &amp; security disclosures</h2>
        <p>
          We never sell, rent, or broker user or server data. Infrastructure
          hosts process requests strictly to run the web dashboard and Discord
          bot. For technical security details or to report a vulnerability, see
          our{" "}
          <Link
            href="/security"
            className="text-brand-400 underline decoration-brand-500/40 underline-offset-4 hover:text-brand-300"
          >
            Security &amp; OAuth2 Trust Center
          </Link>
          .
        </p>
      </Prose>
    </PageShell>
  );
}
