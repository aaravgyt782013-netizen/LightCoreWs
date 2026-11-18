#!/usr/bin/env node
/**
 * Regenerates LightCore brand icons and the OpenGraph social preview card.
 *
 * Usage:
 *   npm run brand                      # rebuilds public/brand/og.png from current logo
 *   npm run brand -- ./path/to/logo.png  # updates all icons + favicon + og.png
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const brandDir = path.join(root, "public", "brand");
const appDir = path.join(root, "src", "app");

const lead = process.env.NEXT_PUBLIC_WORDMARK_LEAD || "LIGHT";
const accent = process.env.NEXT_PUBLIC_WORDMARK_ACCENT || "CORE";
const tagline = (
  process.env.NEXT_PUBLIC_SITE_TAGLINE || "LIGHT FOR YOU HEAVY FOR NUKERS"
).toUpperCase();
const description =
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
  "As your choice for an all in one bot";

function escapeXml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildIcoFromPng(pngBuffer, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // ICO type
  header.writeUInt16LE(1, 4); // 1 image

  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0);
  entry.writeUInt8(size >= 256 ? 0 : size, 1);
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bpp
  entry.writeUInt32LE(pngBuffer.length, 8);
  entry.writeUInt32LE(22, 12); // offset

  return Buffer.concat([header, entry, pngBuffer]);
}

async function generateIcons(sourcePath) {
  const resolved = path.resolve(root, sourcePath);
  const input = await fs.readFile(resolved);

  const resize = (size) =>
    sharp(input)
      .resize(size, size, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();

  const [png512, png256, png180, png64, png32] = await Promise.all([
    resize(512),
    resize(256),
    resize(180),
    resize(64),
    resize(32),
  ]);

  await fs.mkdir(brandDir, { recursive: true });
  await Promise.all([
    fs.writeFile(path.join(brandDir, "logo.png"), png512),
    fs.writeFile(path.join(brandDir, "lightcore-logo.png"), input),
    fs.writeFile(path.join(brandDir, "lightcore-512.png"), png512),
    fs.writeFile(path.join(brandDir, "lightcore-mark.png"), png256),
    fs.writeFile(path.join(brandDir, "apple-touch-icon.png"), png180),
    fs.writeFile(path.join(appDir, "icon.png"), png64),
    fs.writeFile(path.join(appDir, "favicon.ico"), buildIcoFromPng(png32, 32)),
  ]);

  console.log(`Updated logo icons & favicon from ${sourcePath}`);
}

async function generateOg() {
  const logoPath = path.join(brandDir, "lightcore-512.png");
  const logoSize = 96;
  const roundMask = Buffer.from(
    `<svg width="${logoSize}" height="${logoSize}"><rect x="0" y="0" width="${logoSize}" height="${logoSize}" rx="22" ry="22" fill="#fff"/></svg>`,
  );
  const logoRounded = await sharp(logoPath)
    .resize(logoSize, logoSize, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .composite([{ input: roundMask, blend: "dest-in" }])
    .png()
    .toBuffer();

  const spacedTagline = escapeXml(tagline);
  const safeLead = escapeXml(lead);
  const safeAccent = escapeXml(accent);
  const safeDesc = escapeXml(description);

  const bgSvg = Buffer.from(`<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="50%" cy="0%" r="65%">
      <stop offset="0%" stop-color="#ef1010" stop-opacity="0.34"/>
      <stop offset="60%" stop-color="#881212" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#050507" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse">
      <path d="M 64 0 L 0 0 0 64" fill="none" stroke="rgba(255,255,255,0.045)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="#050507"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <rect x="${600 - logoSize / 2 - 4}" y="92" width="${logoSize + 8}" height="${logoSize + 8}" rx="26" fill="rgba(255,255,255,0.025)" stroke="rgba(255,92,92,0.28)" stroke-width="1.5"/>

  <text x="600" y="256" text-anchor="middle" fill="#ff5c5c" font-family="DejaVu Sans Mono, monospace" font-size="15" font-weight="600" letter-spacing="5">${spacedTagline}</text>

  <text x="600" y="362" text-anchor="middle" font-family="DejaVu Sans, Arial, sans-serif" font-size="86" font-weight="700" letter-spacing="10">
    <tspan fill="#f4f4f5">${safeLead}</tspan><tspan fill="#ff2b2b">${safeAccent}</tspan>
  </text>

  <text x="600" y="424" text-anchor="middle" fill="#a1a1aa" font-family="DejaVu Sans, Arial, sans-serif" font-size="22" letter-spacing="0.6">${safeDesc}</text>

  <rect x="478" y="478" width="244" height="52" rx="26" fill="#ef1010"/>
  <text x="600" y="511" text-anchor="middle" fill="#ffffff" font-family="DejaVu Sans, Arial, sans-serif" font-size="18" font-weight="700">Add to Discord</text>
</svg>`);

  const ogBuffer = await sharp(bgSvg)
    .composite([
      {
        input: logoRounded,
        left: Math.round(600 - logoSize / 2),
        top: 96,
      },
    ])
    .png()
    .toBuffer();

  await fs.writeFile(path.join(brandDir, "og.png"), ogBuffer);
  console.log("Updated public/brand/og.png");
}

const arg = process.argv[2];
if (arg) {
  await generateIcons(arg);
}
await generateOg();
