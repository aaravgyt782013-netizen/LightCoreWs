# LightCore — All-in-One Discord Security & Server Suite

Launch website, interactive command reference, real-time system status, live demo sandbox, owner control panel, and full multi-module web dashboard for **LightCore** (Next.js 15 App Router · React 19 · TypeScript · Tailwind CSS).

---

## Key Features

- **Flagship Marketing Experience** — Interactive live Hero Guard Console (real-time Anti-Nuke simulation, interactive `.command` terminal, live Shield Matrix), 32-module dual marquee, interactive Dashboard Preview studio, 4-stage sub-second Defense Protocol, VoiceMaster room controller, and 8 live color themes.
- **Global `⌘K` Command Palette & Searchable Docs (`/docs`)** — 68+ documented commands across 12 categories with custom prefix preview, permission badges, and one-click copy.
- **Interactive Demo Sandbox (`/dashboard/demo`)** — Full 12-module guild dashboard persisted locally in `localStorage` with zero sign-in required.
- **Full Guild Control Plane (`/dashboard/[guildId]`)** — Security Posture Score (0–100), 1-click protection presets, Anti-Nuke, AutoMod, Anti-Raid, Verification Gate, Moderation, Logs, Welcome & AutoRole, Tickets (with live Discord preview), VoiceMaster, Custom Embed Studio, Giveaways, JSON Backup Export/Import, and CLI Setup Command Generator.
- **Real-Time Status (`/status`)** — Live web, API, KV datastore, OAuth2 readiness, and Discord Bot Gateway probes with latency sparkline & manual re-probe.
- **Least-Privilege Security & Trust (`/security`)** — Strictly read-only POST-initiated Discord OAuth 2.0 (`identify guilds` only — zero `guilds.join`, zero auto-join, zero `email`), zero database OAuth token storage, HMAC-SHA256 `HttpOnly` session cookies, anti-CSRF state verification, strict CSP/HSTS headers, and `/.well-known/security.txt`.

---

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Even without Discord OAuth secrets configured, the entire landing page, `/docs`, `/status`, `/premium`, `/security`, and `/dashboard/demo` work out of the box.

---

## Required Environment Variables (Production)

See [`.env.example`](.env.example) for the complete reference:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical HTTPS URL (e.g. `https://lightcore.yourdomain.com`) |
| `NEXT_PUBLIC_DISCORD_CLIENT_ID` | Discord Application Client ID |
| `DISCORD_CLIENT_SECRET` | Discord OAuth2 Client Secret |
| `DISCORD_REDIRECT_URI` | Exact callback registered in Discord Developer Portal: `<SITE_URL>/api/auth/callback/discord` |
| `DISCORD_OAUTH_SCOPES` | `identify guilds` (strictly enforced read-only profile + server list) |
| `SESSION_SECRET` | 32+ byte random secret (`openssl rand -hex 32`) |
| `DISCORD_BOT_TOKEN` | Optional — populates live dashboard channel/role dropdowns & bot telemetry |
| `DISCORD_OWNER_ID` | Comma-separated Discord user IDs allowed to access `/admin` |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Optional Google Search Console verification token |

---

## Security & Google Safe Browsing Verification

- **Strict read-only OAuth 2.0 (`identify guilds`)** — Sign-in uses same-origin `POST /api/auth/discord` redirecting strictly to `https://discord.com/oauth2/authorize` with read-only `identify` and `guilds` scopes only. Both `guilds.join` and all automatic server-join endpoints have been removed.
- **Zero database token persistence** — User OAuth 2.0 access tokens live exclusively inside the user's signed `HttpOnly`, `SameSite=Lax`, `Secure` session cookie; raw access/refresh tokens are never stored on disk or sent to third parties.
- **Strict security headers & disclosures** — CSP, HSTS, `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, clear non-affiliation notices on `/login` and the footer, plus `/security`, `/privacy`, `/terms`, and `/.well-known/security.txt`.
- **Clearing a cached Chrome warning** — Deploy to production, open [Google Search Console](https://search.google.com/search-console) → **Security & Manual Actions → Security issues → Request Review**, and submit a false-positive report at `https://safebrowsing.google.com/safebrowsing/report_error/`.
