<div align="center">

# LightCore

**LIGHT FOR YOU HEAVY FOR NUKERS**

As your choice for an all in one bot.

[**Live site**](https://lightcorews.wasmer.app/) · [**Add to Discord**](https://discord.com/oauth2/authorize?client_id=1559607601115955210&permissions=8&integration_type=0&scope=bot) · [**Support Server**](https://discord.gg/np8M2TZgqa)

</div>

---

## Configuration

All public brand values live in [`src/lib/site.ts`](./src/lib/site.ts) (and can also be overridden via `NEXT_PUBLIC_*` environment variables — see [`.env.example`](./.env.example)):

| Setting | Value |
| --- | --- |
| Name | `LightCore` |
| Tagline | `LIGHT FOR YOU HEAVY FOR NUKERS` |
| Description | `As your choice for an all in one bot` |
| Command Prefix | `.` (e.g. `.antinuke enable`) |
| Site URL | `https://lightcorews.wasmer.app` |
| Discord Client ID | `1559607601115955210` |
| Owner ID (`/admin`) | `1538907226671022111` |
| OAuth2 Scopes | `identify email guilds guilds.join` |
| Bot Invite | `https://discord.com/oauth2/authorize?client_id=1559607601115955210&permissions=8&integration_type=0&scope=bot` |
| Support Server | `https://discord.gg/np8M2TZgqa` |

---

## Replace Logo, Favicon & Social Card

Drop any square PNG logo anywhere and run:

```bash
npm run brand -- ./path/to/your-logo.png
```

This regenerates `public/brand/lightcore-512.png`, `public/brand/lightcore-mark.png`, `public/brand/apple-touch-icon.png`, `src/app/icon.png`, `src/app/favicon.ico`, and `public/brand/og.png` in one step.

---

## Discord OAuth2 Login & Owner Admin Panel (`/admin`)

The OAuth2 flow requests `identify email guilds guilds.join` (profile/username, email, server list, and permission to add the user to servers where the bot is installed).

1. In [Discord Developer Portal](https://discord.com/developers/applications/1559607601115955210/oauth2), add your Redirect URI:
   - Production: `https://lightcorews.wasmer.app/api/auth/callback/discord`
   - Local dev: `http://localhost:3000/api/auth/callback/discord`
2. Set these server environment variables (in `.env.local` locally or your Wasmer/Vercel dashboard):
   - `DISCORD_CLIENT_SECRET` — from Discord Developer Portal → OAuth2
   - `SESSION_SECRET` — random 32+ character string (e.g. `openssl rand -hex 32`)
   - `DISCORD_BOT_TOKEN` — needed to list bot servers, power live `/status` latency, and add authorized `guilds.join` users into servers (the bot must be in the target server)
   - `DISCORD_AUTO_JOIN_GUILD_ID` *(optional)* — automatically add every user who logs in to this server ID (e.g. your support server)
   - `DISCORD_OWNER_ID` — defaults to `1538907226671022111` (comma-separated IDs supported)

When you sign in with Discord account `1538907226671022111`, you are routed directly to `/admin` where you can inspect authorized users & their servers, add users to any server the bot is in, view all bot guilds, check integration health, and broadcast/test logs.

---

## Connect Live Bot Logs & Discord Webhooks

1. Set `LOG_INGEST_SECRET` (and optionally `DISCORD_LOG_WEBHOOK_URL`) in your environment.
2. Push events from your bot:

```js
await fetch("https://lightcorews.wasmer.app/api/logs", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.LOG_INGEST_SECRET}`,
  },
  body: JSON.stringify({
    t: "DENY",          // GUARD | SCAN | WARN | DENY | FIX | AUDIT
    ok: false,          // true = green badge, false = red alert badge
    msg: "mass channel delete blocked in 39ms",
    guild: guild.name,  // optional
    guildId: guild.id,  // optional — enables per-server filtering in /dashboard
  }),
});
```

---

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page: hero, live guard-engine console, stats, partner marquee, features, setup, protocol, VoiceMaster, FAQ, CTA |
| `/login` | Discord OAuth2 sign-in (`identify email guilds guilds.join`) |
| `/dashboard` | User server viewer (manageable + all guilds) & live audit log stream |
| `/admin` | Owner-only admin panel (locked to Discord ID `1538907226671022111`) |
| `/docs` | Command reference (`.` prefix) & modules |
| `/status` | Live health & heartbeat monitor |
| `/privacy` `/terms` | Legal pages |
| `/api/auth/*` | Discord OAuth2 login, callback, session & logout |
| `/api/admin/*` | Owner-protected overview, `guilds.join` runner & log controls |
| `/api/logs` `/api/status` | Live log stream/ingestion & bot health API |

---

## Local Development

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npm start            # serve production build
npm run lint         # eslint
npx tsc --noEmit     # type-check
```
