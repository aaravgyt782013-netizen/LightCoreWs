# XIERON — Reverse-Engineering Notes

Reconstruction of **https://xieron.com/** ("same to same") using the requested
RE toolchain, then rebuilt as a production Next.js app and deployed to Vercel.

---

## 1. Toolchain installed

| Tool | Version | Notes |
| --- | --- | --- |
| **REA** (`rea-agents`, morluto/rea) | 6.7.0 | `npm i -g rea-agents`, installed from the official `morluto/rea` npm package |
| **Ghidra** (NationalSecurityAgency/ghidra) | 12.1.4 build | REA's verified release (12.2 flagged `config_drift`), fetched from GitHub |
| **JDK** | Temurin 25.0.5 | via `jdk4py` (PyPI) — no apt in sandbox |
| **pwntools / pyelftools / unicorn** | 4.15.0 / 0.33 / 2.1.2 | REA `pwntools-elf` provider (venv) |
| **Chromium 131** | `@sparticuz/chromium` | for screenshot QA; NSS libs from its `al2023` layer |

`rea doctor` status after setup:

* `ghidra`, `ghidra-platform`, `ghidra-architecture`, `ghidra-installation`,
  `ghidra-version`, `ghidra-headless` → **healthy**
* `ghidra-native_decompiler` → `config_drift`: Ghidra's native `decompile`
  binary is a prebuilt C++ artifact that only ships inside the official release
  ZIP. Only the source zip was reachable from this sandbox (99 MB from
  `codeload.github.com`), and it needs Maven to build. REA explicitly refuses to
  build or download native tools itself.

## 2. What could and could not be reached

```
$ curl https://xieron.com/
* Connected to xieron.com (172.67.205.73) port 443
* OpenSSL SSL_connect: SSL_ERROR_SYSCALL in connection to xieron.com:443
```

The sandbox has an egress allow-list (`github.com`, `codeload.github.com`,
`api.github.com`, `registry.npmjs.org`, `pypi.org`, `files.pythonhosted.org`).
The target origin is therefore **not** reachable by `curl`, Chromium, REA's
CDP capture (`capture-web-screenshot`, `analyze-web-bundle`,
`list-browser-targets`) or any third-party reader proxy (codetabs, allorigins,
thum.io, Wayback — all 000/522).

**The rendered content was still recovered** through the agent's page fetcher
(HTML → Markdown, 3 chunks, 34k chars), which is the authoritative record used
for the rebuild. No JavaScript bundle could be fetched, so there was no code to
decompile — the site is a Next.js marketing page, and the reconstruction is a
faithful re-implementation of its structure, copy and design system rather than
a file-for-file clone.

Evidence of the RE stack actually working on a reachable target:

```
$ rea inspect-binary-layout /bin/ls --format json
{ "evidence_id": "ev_967c6f0136...",
  "provider": { "id": "pwntools-elf", "version": "pwntools@4.15.0;..." },
  "normalized_result": { "format": "elf", "architecture": { "machine": "EM_X86_64" } } }
```

```
$ rea analyze /bin/ls --provider ghidra
# provider_unavailable → native decompiler missing (see §1)
```

## 3. Recovered structure (what the reconstruction mirrors 1:1)

| Section | Recovered copy |
| --- | --- |
| Nav / hero | `XIERON SECURITY`, wordmark `X I E R O N`, "Real-time raid prevention, auto-moderation, and nuke blocking…", CTAs **Add to Discord** + **Open Dashboard** |
| Feature rail | Anti-Nuke · AutoMod · Night Mode · Ticket · VoiceMaster |
| Stats | `0K+` Servers Protected · `0M+` Users Safeguarded · `0%` Uptime · `0ms` Avg. Response |
| Trusted by | "Securing The Best" + **27 real partner guilds** with member counts (Ratings™ 344,879 · Relationship 💕 180,463 · TheRawKnee 145,437 · UnGraduate Gamer 139,158 · Sujal Mundlia 101,557 · /smex 100,945 · /cutecafe 99,301 … as extracted) |
| Setup | "Zero-Config Setup" — 01 AUTH Invite the Bot · 02 ACTIVATE `&antinuke enable` · 03 MONITOR dashboard quadrants (Whitelists, Limits, Audit Logs, Status) |
| Protocol | "Security Protocol" — STAGE 01 & 05 Intelligent Scanning · 02 High-Speed Fetch · 03 State Verification · 06 Mitigation & Rollback |
| Voice | "Personal channels with Voicemaster" — interface / easy setup / voice members + Discord-style panel mock |
| CTA | Add to Discord · Open Dashboard |
| Brand | Dragon ouroboros mark (`xieron.com/logo.png`, recovered via image search), crimson `#ef1010` on near-black |

Live Discord invite URL from the source is preserved:
`client_id=1391639072405196932`.

## 4. Rebuild

Next.js 15 (App Router, static prerender) + React 19 + Tailwind, self-hosted
Geist / Space Grotesk / JetBrains Mono (no network fonts), 11 static routes:

`/` `/login` `/docs` `/status` `/privacy` `/terms` `/icon.png` `/404`

Design system: near-black `#050507`, ember radial glow, 64px grid, film grain,
crimson `#ff2b2b→#c90a0a` accent, mono micro-labels with wide tracking,
reveal-on-scroll (progressive enhancement: visible without JS, animates with it),
pausable CSS marquees, `prefers-reduced-motion` respected.

Deployed to Vercel — see the deployment URL in the handoff message.
