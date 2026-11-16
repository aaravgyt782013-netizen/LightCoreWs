# LIGHTCORE

A same-to-same reconstruction of the **LIGHTCORE Discord security** marketing site
(anti-nuke / anti-raid / AutoMod bot), rebuilt with Next.js 15 and deployed on
Vercel.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # static prerender of all routes
```

## Stack

- **Next.js 15** App Router, fully static prerender
- **React 19** + **TypeScript**
- **Tailwind CSS 3** with a custom dark security design system
- Self-hosted fonts (Geist, Space Grotesk, JetBrains Mono) — no runtime network
  font fetches, so builds work in air-gapped CI

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page: hero, guard-engine console, stats, partner marquee, features, setup, protocol, VoiceMaster, FAQ, CTA |
| `/login` | Dashboard sign-in (Discord OAuth entry point) |
| `/docs` | Command + module reference |
| `/status` | Service health with 45-day uptime bars |
| `/privacy`, `/terms` | Legal pages |
| `404` | Guarded-route fallback |

## Highlights

- **Progressive enhancement** — reveal animations only apply when JS is active
  (`.js` class on `<html>`), so content is fully visible to crawlers and no-JS
  visitors.
- **Respects `prefers-reduced-motion`** — all motion is disabled for users who
  ask for it.
- **Metadata + JSON-LD** — OpenGraph/Twitter cards with a generated 1200×630
  image, `SoftwareApplication` structured data.
- **Zero external image dependencies at build time** — partner guild avatars are
  loaded from Discord's CDN with graceful fallbacks.

## Origin reconstruction

The reverse-engineering process, tooling and findings are documented in
[`RE-NOTES.md`](./RE-NOTES.md).

## Notes

This is an independent re-implementation for demonstration purposes. Brand
assets, copy and the Discord application ID belong to their respective owners.
