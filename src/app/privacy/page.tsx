import type { Metadata } from "next";
import { PageShell, Prose } from "@/components/site/PageShell";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${site.name} collects, processes and retains Discord guild data while protecting your server.`,
};

export default function PrivacyPage() {
  return (
    <PageShell
      eyebrow="privacy"
      title="Privacy Policy"
      intro={`${site.name} processes the minimum amount of Discord data required to keep your server safe. This page explains exactly what that means.`}
    >
      <Prose>
        <p>
          <strong>Last updated:</strong> November 2026
        </p>
        <h2>Discord sign-in and account data</h2>
        <p>
          {site.name} is an independent Discord bot and server management
          dashboard and is not affiliated with or endorsed by Discord Inc.
          Sign-in takes place on <code>discord.com</code> using Discord OAuth2.
          We request only the <code>identify</code> and <code>guilds</code>
          permissions so the dashboard can read your Discord profile and server
          list. We do not request your email address, Discord password, phone
          number, payment credentials, or one-time codes. The dashboard receives
          an OAuth access token from Discord to make the requested profile and
          server-list calls; stored tokens are encrypted. You can revoke access
          from Discord User Settings → Authorized Apps.
        </p>
        <h2>Data we process</h2>
        <p>
          Guild identifiers, channel and role identifiers, member identifiers
          involved in moderation events, and the audit actions required to
          evaluate rate gates. Message content is inspected transiently for
          AutoMod signals and is not stored unless a confirmed incident demands
          a transcript.
        </p>
        <h2>Why we process it</h2>
        <p>
          To detect raids, nukes and abusive behaviour in real time, to apply
          sanctions and rollbacks, and to keep an audit trail that guild owners
          can review in the dashboard.
        </p>
        <h2>Retention</h2>
        <p>
          Incident records are retained for 90 days by default and can be
          purged on request. Aggregate counters used for uptime and latency
          reporting are irreversible and contain no member data.
        </p>
        <h2>Your controls</h2>
        <ul>
          <li>Remove the bot at any time to stop all processing.</li>
          <li>
            Request export or deletion of incident records via a ticket in our{" "}
            <a
              href={site.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-400 underline decoration-brand-500/40 underline-offset-4 hover:text-brand-300"
            >
              support server
            </a>
            .
          </li>
          <li>Disable individual modules without losing the audit stream.</li>
        </ul>
        <h2>Third parties</h2>
        <p>
          We do not sell data. Infrastructure providers process data solely to
          operate the service, under contractual confidentiality.
        </p>
      </Prose>
    </PageShell>
  );
}
