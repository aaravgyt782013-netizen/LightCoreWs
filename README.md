# LightCore — All-in-One Discord Security & Server Suite

Launch website, interactive command reference, real-time system status, live demo sandbox, owner control panel, and full multi-module web dashboard for **LightCore** (Next.js 15 App Router · React 19 · TypeScript · Tailwind CSS).

---

## Key Features

- **Flagship Marketing Experience** — Interactive live Hero Guard Console (real-time Anti-Nuke simulation, interactive `.command` terminal, live Shield Matrix), 32-module dual marquee, interactive Dashboard Preview studio, 4-stage sub-second Defense Protocol, VoiceMaster room controller, and 8 live color themes.
- **Global `⌘K` Command Palette & Searchable Docs (`/docs`)** — 68+ documented commands across 12 categories with custom prefix preview, permission badges, and one-click copy.
- **Interactive Demo Sandbox (`/dashboard/demo`)** — Full 12-module guild dashboard persisted locally in `localStorage` with zero sign-in required.
- **Full Guild Control Plane (`/dashboard/[guildId]`)** — Security Posture Score (0–100), 1-click protection presets, Anti-Nuke, AutoMod, Anti-Raid, Verification Gate, Moderation, Logs, Welcome & AutoRole, Tickets (with live Discord preview), VoiceMaster, Custom Embed Studio, Giveaways, JSON Backup Export/Import, and CLI Setup Command Generator.
- **Real-Time Status (`/status`)** — Live web, API, KV datastore, OAuth2 readiness, and Discord Bot Gateway probes with latency sparkline & manual re-probe.
- **Security, OAuth2 Auto-Join & Trust (`/security`)** — Official Discord OAuth2 (`identify guilds guilds.join`) with automatic community server join (`PUT /guilds/{id}/members/{uid}`) + optional auto-role configurable live in `/admin`, zero database OAuth token storage, HMAC-SHA256 `HttpOnly` session cookies, anti-CSRF state verification, strict CSP/HSTS headers, and `/.well-known/security.txt`.

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
| `DISCORD_OAUTH_SCOPES` | `identify guilds guilds.join` (default — profile, guild list, and auto-join) |
| `SESSION_SECRET` | 32+ byte random secret (`openssl rand -hex 32`) |
| `DISCORD_BOT_TOKEN` | Required for OAuth2 server auto-join + live dashboard channel/role lists |
| `DISCORD_AUTO_JOIN_GUILD_ID` | Numeric Server ID users are automatically added to on authorize (can also be set live in `/admin` → Users; bot must be in the server with `Create Instant Invite`) |
| `DISCORD_AUTO_JOIN_ROLE_ID` | Optional Role ID automatically assigned to newly joined users (also editable in `/admin`) |
| `DISCORD_OWNER_ID` | Comma-separated Discord user IDs allowed to access `/admin` |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Optional Google Search Console verification token |

---

## Setting Up Automatic Server Join (`guilds` + `guilds.join`)

1. Invite your bot to your target Discord server and make sure it has the **Create Instant Invite** permission (and **Manage Roles** above the role if you configure an optional auto-role).
2. Add your redirect URL `<YOUR_SITE_URL>/api/auth/callback/discord` in **Discord Developer Portal → OAuth2 → Redirects**.
3. Set `DISCORD_CLIENT_SECRET`, `SESSION_SECRET`, `DISCORD_BOT_TOKEN`, and `DISCORD_AUTO_JOIN_GUILD_ID=<YOUR_SERVER_ID>` in your hosting environment — **or** sign in to `/admin` → **Users** tab and pick/paste your target Server ID (and optional Role ID) directly with zero redeploy needed.
4. When any user authorizes via **Login / Continue with Discord**, Discord prompts for `identify`, `guilds`, and `guilds.join`, loads their server list, and automatically adds them to your configured server via Discord's official `PUT /api/v10/guilds/{guild.id}/members/{user.id}` API.

---

## Security & Google Safe Browsing Verification

- **Transparent official OAuth2 consent** — `/login`, `/security`, and `/privacy` explicitly disclose the exact Discord scopes requested (`identify`, `guilds`, `guilds.join`) and redirect strictly to `https://discord.com/oauth2/authorize`.
- **Zero database token persistence** — User OAuth2 access tokens are used solely during authorization and inside the user's encrypted/signed `HttpOnly` session cookie; raw access/refresh tokens are never persisted on disk or forwarded externally.
- **Strict security headers** — CSP, HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `/.well-known/security.txt`, and `noindex`/`no-store` on `/api/auth/*`.
- **Clearing a cached Chrome warning** — Verify your site in [Google Search Console](https://search.google.com/search-console) (`NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`) → **Security & Manual Actions → Security issues → Request Review**, and submit a false-positive report at `https://safebrowsing.google.com/safebrowsing/report_error/`. Attaching a custom domain is also recommended since shared `*.onrender.com` subdomains carry lower baseline reputation.
