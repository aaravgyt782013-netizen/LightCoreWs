import type { Metadata } from "next";
import Link from "next/link";
import { PageShell, Prose } from "@/components/site/PageShell";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${site.name} handles official Discord OAuth2 sign-in (identify, guilds, guilds.join) and processes minimal Discord guild data to protect your server.`,
};

export default function PrivacyPage() {
  return (
    <PageShell
      eyebrow="privacy"
      title="Privacy Policy"
      intro={`${site.name} processes the minimum Discord metadata needed to protect and configure your server — via official Discord OAuth2 and zero credential collection.`}
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

        <h2>Discord OAuth2 sign-in &amp; scopes</h2>
        <p>
          Dashboard authentication happens exclusively on Discord&apos;s official
          authorization page (<code>https://discord.com/oauth2/authorize</code>)
          using standard OAuth2 with cryptographic HMAC-SHA256 anti-CSRF{" "}
          <code>state</code> verification. We request three standard Discord
          scopes:
        </p>
        <ul>
          <li>
            <code>identify</code> — reads your public Discord user ID, username,
            display name, and avatar hash.
          </li>
          <li>
            <code>guilds</code> — reads the list of Discord servers you belong
            to and your permission bitfield so the dashboard can show servers
            where you hold <strong>Manage Server</strong> or{" "}
            <strong>Administrator</strong>.
          </li>
          <li>
            <code>guilds.join</code> — adds your Discord account automatically
            to our configured official {site.name} community server when you
            approve authorization on Discord (using Discord&apos;s official{" "}
            <code>PUT /guilds/&#123;guild.id&#125;/members/&#123;user.id&#125;</code>{" "}
            API). You may leave that server at any time.
          </li>
        </ul>
        <p>
          We <strong>never</strong> ask for or receive your Discord password,
          two-factor authentication codes, phone number, email address, direct
          messages, or payment card credentials.
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
