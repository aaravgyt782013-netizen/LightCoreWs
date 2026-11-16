<div align="center">

# LIGHTCORE

**Real-time raid prevention, auto-moderation and nuke blocking for Discord.**

A production-ready, fully static marketing site rebuilt from
[xieron.com](https://xieron.com) — dark security aesthetic, crimson accent and a
live "guard engine" console.

[**Live site**](https://lightcore-security.vercel.app) · [Routes](#routes) · [Local development](#local-development) · [Re-origin notes](./RE-NOTES.md)

</div>

---

## What this is

The original site is a closed-source Discord security bot landing page. It was
reverse-engineered with [REA](https://github.com/morluto/rea) and
[Ghidra](https://github.com/NationalSecurityAgency/ghidra), the recovered
content was re-implemented as a Next.js 15 app, and the result is deployed on
Vercel. The full process, toolchain and findings live in
[`RE-NOTES.md`](./RE-NOTES.md).

> The target origin was unreachable from the build sandbox (egress allow-list),
> so the reconstruction is faithful to the **recovered content, structure and
> brand language** rather than a pixel-for-pixel clone of their stylesheet.
> See [RE-NOTES §2](./RE-NOTES.md) for the evidence.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | **Next.js 15.5.29** (App Router, fully static prerender) |
| UI | **React 19** + **TypeScript** (strict) |
| Styling | **Tailwind CSS 3** with a custom dark security design system |
| Fonts | **Self-hosted** Geist, Space Grotesk, JetBrains Mono — zero runtime font fetches, builds work in air-gapped CI |
| Hosting | **Vercel** — `lightcore-security.vercel.app` |

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page: hero, live guard-engine console, animated stats, 27-guild partner marquee, feature tabs, zero-config setup, security protocol pipeline, VoiceMaster mock, FAQ, CTA |
| `/login` | Dashboard sign-in (Discord OAuth entry point) |
| `/docs` | Command and module reference |
| `/status` | Service health with 45-day uptime bars |
| `/privacy` `/terms` | Legal pages |
| `404` | Guarded-route fallback |

All routes are statically prerendered at build time.

## Local development

```bash
git clone https://github.com/argamerzz9582-debug/LightCore.git
cd LightCore
npm install

npm run dev     # http://localhost:3000
npm run build   # production build (11 static routes)
npm start       # serve the production build
npm run lint    # eslint
npx tsc --noEmit  # type-check
```

Node 20+ recommended.

## Design system

Defined once in [`tailwind.config.ts`](./tailwind.config.ts) and consumed
everywhere:

- **Surface** — near-black `#050507` with layered ember radial glow, a 64px
  grid and a subtle film grain
- **Accent** — crimson ramp `brand-400 → brand-900` (`#ff5c5c → #881212`)
- **Type** — Geist for UI, Space Grotesk for display, JetBrains Mono for
  micro-labels with wide tracking
- **Motion** — CSS-only marquees, a typing guard-engine console, count-up
  statistics and scroll reveals

## Engineering notes

- **Progressive enhancement** — reveal animations only apply when JavaScript is
  active (a `js` class is set on `<html>` before paint). Without JS, every
  section is fully visible, so content is never hidden from crawlers or no-JS
  visitors.
- **`prefers-reduced-motion`** — all animation is disabled for users who ask
  for it.
- **Metadata + JSON-LD** — per-route titles, OpenGraph/Twitter cards backed by a
  generated 1200×630 image, and `SoftwareApplication` structured data.
- **No build-time network dependencies** — fonts are vendored into
  `src/fonts/`, so `next build` never reaches out to Google Fonts.
- **Brand assets are generated** — the dragon mark, favicons and OG image are
  derived from a single source PNG with `sharp`.

## Deploy

Pushes to `main` deploy production via the Vercel Git integration. To deploy a
branch manually:

```bash
vercel deploy --prod
```

`vercel.json` pins the framework preset and enables git deployments for `main`.

## Rebranding

Every brand string resolves from [`src/lib/site.ts`](./src/lib/site.ts) plus
per-page metadata. To rebrand, change `site.name`, `site.url`, the copy in
`src/lib/site.ts`, the `<LIGHT|CORE>` wordmark spans and the assets in
`public/brand/`.

## License and attribution

Released for demonstration and portfolio purposes. Brand assets, marketing copy
and the Discord application ID belong to their original owners. This project is
not affiliated with or endorsed by the original site.
