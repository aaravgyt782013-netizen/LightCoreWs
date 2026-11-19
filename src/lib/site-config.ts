import { normalizeSupportUrl, normalizeTagline, site } from "@/lib/site";
import { sanitizeDiscordInviteUrl } from "@/lib/discord-oauth";

export type ThemePresetId =
  | "aqua"
  | "violet"
  | "emerald"
  | "crimson"
  | "cobalt"
  | "gold"
  | "rose"
  | "arctic"
  | "custom";

export type SurfacePresetId = "ocean" | "obsidian" | "void" | "slate";
export type GlowIntensity = "subtle" | "balanced" | "vibrant";
export type LogoShape = "squircle" | "circle" | "rounded";

export type BrandPaletteHex = {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
};

export type SurfacePaletteHex = {
  950: string;
  900: string;
  850: string;
  800: string;
  700: string;
  600: string;
  500: string;
};

export const THEME_PRESETS: {
  id: Exclude<ThemePresetId, "custom">;
  name: string;
  subtitle: string;
  swatch: string;
  palette: BrandPaletteHex;
}[] = [
  {
    id: "gold",
    name: "Solar Gold",
    subtitle: "Signature LightCore yellow & black (Default)",
    swatch: "#facc15",
    palette: {
      50: "#fffdf0",
      100: "#fef9c3",
      200: "#fef08a",
      300: "#fde047",
      400: "#facc15",
      500: "#eab308",
      600: "#ca8a04",
      700: "#a16207",
      800: "#854d0e",
      900: "#713f12",
      950: "#2e1a05",
    },
  },
  {
    id: "crimson",
    name: "Crimson Core",
    subtitle: "Bold ruby accent on dark",
    swatch: "#ef4444",
    palette: {
      50: "#fef2f2",
      100: "#fee2e2",
      200: "#fecaca",
      300: "#fca5a5",
      400: "#f87171",
      500: "#ef4444",
      600: "#dc2626",
      700: "#b91c1c",
      800: "#991b1b",
      900: "#7f1d1d",
      950: "#3b0709",
    },
  },
  {
    id: "aqua",
    name: "Aqua Pulse",
    subtitle: "Luminous oceanic cyan",
    swatch: "#06b6d4",
    palette: {
      50: "#ecfeff",
      100: "#cffafe",
      200: "#a5f3fc",
      300: "#67e8f9",
      400: "#22d3ee",
      500: "#06b6d4",
      600: "#0891b2",
      700: "#0e7490",
      800: "#155e75",
      900: "#164e63",
      950: "#062836",
    },
  },
  {
    id: "arctic",
    name: "Arctic Sky",
    subtitle: "Crisp glacier ice blue",
    swatch: "#0ea5e9",
    palette: {
      50: "#f0f9ff",
      100: "#e0f2fe",
      200: "#bae6fd",
      300: "#7dd3fc",
      400: "#38bdf8",
      500: "#0ea5e9",
      600: "#0284c7",
      700: "#0369a1",
      800: "#075985",
      900: "#0c4a6e",
      950: "#082f49",
    },
  },
  {
    id: "cobalt",
    name: "Electric Cobalt",
    subtitle: "High-voltage sapphire blue",
    swatch: "#3b82f6",
    palette: {
      50: "#eff6ff",
      100: "#dbeafe",
      200: "#bfdbfe",
      300: "#93c5fd",
      400: "#60a5fa",
      500: "#3b82f6",
      600: "#2563eb",
      700: "#1d4ed8",
      800: "#1e40af",
      900: "#1e3a8a",
      950: "#112255",
    },
  },
  {
    id: "violet",
    name: "Royal Violet",
    subtitle: "Ultra-sleek amethyst glow",
    swatch: "#8b5cf6",
    palette: {
      50: "#f5f3ff",
      100: "#ede9fe",
      200: "#ddd6fe",
      300: "#c4b5fd",
      400: "#a78bfa",
      500: "#8b5cf6",
      600: "#7c3aed",
      700: "#6d28d9",
      800: "#5b21b6",
      900: "#4c1d95",
      950: "#260f52",
    },
  },
  {
    id: "emerald",
    name: "Emerald Matrix",
    subtitle: "Cyber security neon jade",
    swatch: "#10b981",
    palette: {
      50: "#ecfdf5",
      100: "#d1fae5",
      200: "#a7f3d0",
      300: "#6ee7b7",
      400: "#34d399",
      500: "#10b981",
      600: "#059669",
      700: "#047857",
      800: "#065f46",
      900: "#064e3b",
      950: "#032b21",
    },
  },
  {
    id: "rose",
    name: "Sakura Neon",
    subtitle: "Vibrant magenta pulse",
    swatch: "#ec4899",
    palette: {
      50: "#fdf2f8",
      100: "#fce7f3",
      200: "#fbcfe8",
      300: "#f9a8d4",
      400: "#f472b6",
      500: "#ec4899",
      600: "#db2777",
      700: "#be185d",
      800: "#9d174d",
      900: "#831843",
      950: "#420b22",
    },
  },
];

export const SURFACE_PRESETS: {
  id: SurfacePresetId;
  name: string;
  subtitle: string;
  palette: SurfacePaletteHex;
}[] = [
  {
    id: "void",
    name: "Velvet Black",
    subtitle: "Warm pitch-black with golden depth (Default)",
    palette: {
      950: "#060504",
      900: "#0d0b08",
      850: "#14110c",
      800: "#1c1811",
      700: "#2b251b",
      600: "#3f3627",
      500: "#594d38",
    },
  },
  {
    id: "obsidian",
    name: "Gilded Onyx",
    subtitle: "Deep espresso-onyx with warm amber undertone",
    palette: {
      950: "#080603",
      900: "#110d07",
      850: "#19130b",
      800: "#231b10",
      700: "#342818",
      600: "#4a3922",
      500: "#665031",
    },
  },
  {
    id: "ocean",
    name: "Deep Ocean",
    subtitle: "Rich abyssal navy-slate",
    palette: {
      950: "#03070c",
      900: "#060d16",
      850: "#091320",
      800: "#0d1b2b",
      700: "#13253a",
      600: "#1b334e",
      500: "#284869",
    },
  },
  {
    id: "slate",
    name: "Titanium Slate",
    subtitle: "Modern neutral gunmetal",
    palette: {
      950: "#06080c",
      900: "#0c0f16",
      850: "#121620",
      800: "#181e2b",
      700: "#232b3c",
      600: "#313c52",
      500: "#445370",
    },
  },
];

export type PlanPricingConfig = {
  plus: { name: string; badge: string; "1m": number; "3m": number; "1y": number };
  pro: { name: string; badge: string; "1m": number; "3m": number; "1y": number };
  ultra: { name: string; badge: string; "1m": number; "3m": number; "1y": number };
};

export type SiteConfig = {
  // Branding & Logos
  brandName: string;
  wordmarkLead: string;
  wordmarkAccent: string;
  navBadge: string;
  tagline: string;
  description: string;
  heroSubtext: string;
  prefix: string;
  logoUrl: string;
  faviconUrl: string;
  logoShape: LogoShape;
  logoGlow: boolean;

  // Theme & Visuals
  themePreset: ThemePresetId;
  customAccentHex: string;
  surfacePreset: SurfacePresetId;
  glowIntensity: GlowIntensity;
  showGrid: boolean;
  enableRouteLoader: boolean;
  loaderText: string;

  // Links & Footer
  supportUrl: string;
  inviteUrl: string;
  inviteButtonLabel: string;
  footerStatusText: string;
  footerCopyright: string;

  // Announcement & Maintenance Banners
  announcementEnabled: boolean;
  announcementBadge: string;
  announcementText: string;
  announcementLinkLabel: string;
  announcementLinkUrl: string;
  maintenanceEnabled: boolean;
  maintenanceMessage: string;

  // Premium Invoice & Pricing Settings (NO website payment system)
  currencySymbol: string;
  currencyCode: string;
  activationSla: string;
  ticketInstructions: string;
  invoiceFooterNote: string;
  premiumRoleId: string;
  pricing: PlanPricingConfig;

  // Metadata
  updatedAt: string | null;
  updatedBy: string | null;
};

export function createDefaultSiteConfig(): SiteConfig {
  return {
    brandName: site.name,
    wordmarkLead: site.wordmark.lead,
    wordmarkAccent: site.wordmark.accent,
    navBadge: "All-in-One",
    tagline: site.tagline,
    description: site.description,
    heroSubtext:
      "Smart security, gentle auto-moderation, temporary voice rooms, support tickets, and welcomes — all managed from one calm, effortless dashboard.",
    prefix: site.prefix,
    logoUrl: site.logo,
    faviconUrl: "/brand/lightcore-mark.png",
    logoShape: "squircle",
    logoGlow: true,

    themePreset: "gold",
    customAccentHex: "#facc15",
    surfacePreset: "void",
    glowIntensity: "balanced",
    showGrid: false,
    enableRouteLoader: true,
    loaderText: "Warming things up...",

    supportUrl: site.discord,
    inviteUrl: site.invite,
    inviteButtonLabel: "Add to Discord",
    footerStatusText: "view service status",
    footerCopyright: site.name,

    announcementEnabled: false,
    announcementBadge: "UPDATE",
    announcementText: "LightCore Premium is now live — open a ticket with your invoice!",
    announcementLinkLabel: "View Plans",
    announcementLinkUrl: "/premium",
    maintenanceEnabled: false,
    maintenanceMessage:
      "Scheduled maintenance in progress — some bot modules may respond slower than usual.",

    currencySymbol: "₹",
    currencyCode: "INR",
    activationSla: "Activation after payment confirmation",
    ticketInstructions:
      "Review the order summary, then contact the Support Server for payment instructions. Confirm the seller and amount before paying. Never share passwords or one-time codes.",
    invoiceFooterNote:
      "This is an order summary, not a tax invoice or proof of payment. No payment is collected here. Confirm seller details before paying. Never share passwords or one-time codes.",
    premiumRoleId: "",
    pricing: {
      plus: { name: "Plus Plan", badge: "Popular", "1m": 299, "3m": 799, "1y": 2699 },
      pro: { name: "Pro Plan", badge: "Best Value", "1m": 499, "3m": 1349, "1y": 4499 },
      ultra: { name: "Ultra Pro", badge: "Premium", "1m": 749, "3m": 1999, "1y": 6749 },
    },

    updatedAt: null,
    updatedBy: null,
  };
}

function hexToRgbTuple(hex: string): [number, number, number] {
  const clean = hex.replace("#", "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return [250, 204, 21];
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function mixRgb(
  base: [number, number, number],
  target: [number, number, number],
  weight: number,
): string {
  const r = Math.round(base[0] * (1 - weight) + target[0] * weight);
  const g = Math.round(base[1] * (1 - weight) + target[1] * weight);
  const b = Math.round(base[2] * (1 - weight) + target[2] * weight);
  return `${r} ${g} ${b}`;
}

export function generateCustomBrandRgb(hex: string): Record<keyof BrandPaletteHex, string> {
  const base = hexToRgbTuple(hex);
  const white: [number, number, number] = [255, 255, 255];
  const black: [number, number, number] = [3, 6, 12];
  return {
    50: mixRgb(base, white, 0.92),
    100: mixRgb(base, white, 0.82),
    200: mixRgb(base, white, 0.66),
    300: mixRgb(base, white, 0.44),
    400: mixRgb(base, white, 0.22),
    500: `${base[0]} ${base[1]} ${base[2]}`,
    600: mixRgb(base, black, 0.16),
    700: mixRgb(base, black, 0.32),
    800: mixRgb(base, black, 0.48),
    900: mixRgb(base, black, 0.62),
    950: mixRgb(base, black, 0.8),
  };
}

export function getResolvedAccentHex(cfg: SiteConfig): string {
  if (cfg.themePreset === "custom" && /^#[0-9a-fA-F]{6}$/.test(cfg.customAccentHex)) {
    return cfg.customAccentHex;
  }
  const found = THEME_PRESETS.find((p) => p.id === cfg.themePreset) ?? THEME_PRESETS[0];
  return found.palette[400];
}

export function buildThemeCssVariables(cfg: SiteConfig): Record<string, string> {
  const vars: Record<string, string> = {};

  if (cfg.themePreset === "custom") {
    const custom = generateCustomBrandRgb(cfg.customAccentHex);
    for (const [shade, rgb] of Object.entries(custom)) {
      vars[`--brand-${shade}`] = rgb;
    }
  } else {
    const preset =
      THEME_PRESETS.find((t) => t.id === cfg.themePreset) ?? THEME_PRESETS[0];
    for (const [shade, hex] of Object.entries(preset.palette)) {
      const [r, g, b] = hexToRgbTuple(hex);
      vars[`--brand-${shade}`] = `${r} ${g} ${b}`;
    }
  }

  const surface =
    SURFACE_PRESETS.find((s) => s.id === cfg.surfacePreset) ?? SURFACE_PRESETS[0];
  for (const [shade, hex] of Object.entries(surface.palette)) {
    const [r, g, b] = hexToRgbTuple(hex);
    vars[`--ink-${shade}`] = `${r} ${g} ${b}`;
  }

  vars["--background"] = surface.palette[950];
  vars["--glow-scale"] =
    cfg.glowIntensity === "subtle"
      ? "0.58"
      : cfg.glowIntensity === "vibrant"
        ? "1.35"
        : "1";
  vars["--grid-opacity"] = cfg.showGrid ? "0.026" : "0";

  // Automatic luminance-aware button contrast:
  // Luminous presets (Solar Gold, Aqua) render silky sunlit buttons with velvet-black ink;
  // deeper jewel presets (Violet, Cobalt, Crimson, Rose) keep crisp white ink.
  const b400 = (vars["--brand-400"] || "250 204 21").split(" ").map(Number);
  const lum = (0.299 * b400[0] + 0.587 * b400[1] + 0.114 * b400[2]) / 255;
  if (lum >= 0.62) {
    vars["--btn-from"] = vars["--brand-300"];
    vars["--btn-via"] = vars["--brand-400"];
    vars["--btn-to"] = vars["--brand-500"];
    vars["--btn-ink"] = "12 9 3";
    vars["--btn-shine"] = "rgb(255 255 255 / 0.52)";
  } else {
    vars["--btn-from"] = vars["--brand-500"];
    vars["--btn-via"] = vars["--brand-600"];
    vars["--btn-to"] = vars["--brand-700"];
    vars["--btn-ink"] = "255 255 255";
    vars["--btn-shine"] = "rgb(255 255 255 / 0.28)";
  }

  return vars;
}

function cleanStr(val: unknown, fallback: string, maxLen: number, allowEmpty = false): string {
  if (typeof val !== "string") return fallback;
  const trimmed = val.trim().slice(0, maxLen);
  if (!trimmed && !allowEmpty) return fallback;
  return trimmed;
}

function cleanUrl(val: unknown, fallback: string, allowDataImage = false): string {
  if (typeof val !== "string") return fallback;
  const trimmed = val.trim();
  if (!trimmed) return fallback;
  if (allowDataImage && /^data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(trimmed)) {
    // Cap data URI at ~350KB so KV reads remain lightning fast
    if (trimmed.length <= 360_000) return trimmed;
    return fallback;
  }
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && trimmed.length <= 300) {
    return trimmed;
  }
  if (/^https?:\/\/[^\s"'<>]+$/i.test(trimmed) && trimmed.length <= 500) {
    return trimmed;
  }
  return fallback;
}

function cleanPrice(val: unknown, fallback: number): number {
  const n = typeof val === "number" ? val : Number(val);
  if (!Number.isFinite(n) || n < 0 || n > 999_999) return fallback;
  return Math.round(n);
}

export function mergeSiteConfig(
  base: SiteConfig,
  rawPatch: unknown,
  updatedBy?: string,
): SiteConfig {
  if (!rawPatch || typeof rawPatch !== "object") return base;
  const p = rawPatch as Record<string, unknown>;

  const validThemes: ThemePresetId[] = [
    "aqua",
    "arctic",
    "cobalt",
    "violet",
    "emerald",
    "crimson",
    "gold",
    "rose",
    "custom",
  ];
  const validSurfaces: SurfacePresetId[] = ["ocean", "obsidian", "void", "slate"];
  const validGlows: GlowIntensity[] = ["subtle", "balanced", "vibrant"];
  const validShapes: LogoShape[] = ["squircle", "circle", "rounded"];

  const rawPricing =
    p.pricing && typeof p.pricing === "object"
      ? (p.pricing as Record<string, Record<string, unknown>>)
      : {};

  const mergePlan = (tier: "plus" | "pro" | "ultra") => {
    const src = rawPricing[tier] && typeof rawPricing[tier] === "object" ? rawPricing[tier] : {};
    const cur = base.pricing[tier];
    return {
      name: cleanStr(src.name, cur.name, 36),
      badge: cleanStr(src.badge, cur.badge, 24),
      "1m": cleanPrice(src["1m"], cur["1m"]),
      "3m": cleanPrice(src["3m"], cur["3m"]),
      "1y": cleanPrice(src["1y"], cur["1y"]),
    };
  };

  const nextCustomHex =
    typeof p.customAccentHex === "string" && /^#[0-9a-fA-F]{6}$/.test(p.customAccentHex.trim())
      ? p.customAccentHex.trim().toLowerCase()
      : base.customAccentHex;

  return {
    brandName: cleanStr(p.brandName, base.brandName, 36),
    wordmarkLead: cleanStr(p.wordmarkLead, base.wordmarkLead, 24),
    wordmarkAccent: cleanStr(p.wordmarkAccent, base.wordmarkAccent, 24, true),
    navBadge: cleanStr(p.navBadge, base.navBadge, 24, true),
    tagline: normalizeTagline(cleanStr(p.tagline, base.tagline, 90)),
    description: cleanStr(p.description, base.description, 220),
    heroSubtext: cleanStr(p.heroSubtext, base.heroSubtext, 260, true),
    prefix: cleanStr(p.prefix, base.prefix, 6),
    logoUrl: cleanUrl(p.logoUrl, base.logoUrl, true),
    faviconUrl: cleanUrl(p.faviconUrl, base.faviconUrl, true),
    logoShape: validShapes.includes(p.logoShape as LogoShape)
      ? (p.logoShape as LogoShape)
      : base.logoShape,
    logoGlow: typeof p.logoGlow === "boolean" ? p.logoGlow : base.logoGlow,

    themePreset: validThemes.includes(p.themePreset as ThemePresetId)
      ? (p.themePreset as ThemePresetId)
      : base.themePreset,
    customAccentHex: nextCustomHex,
    surfacePreset: validSurfaces.includes(p.surfacePreset as SurfacePresetId)
      ? (p.surfacePreset as SurfacePresetId)
      : base.surfacePreset,
    glowIntensity: validGlows.includes(p.glowIntensity as GlowIntensity)
      ? (p.glowIntensity as GlowIntensity)
      : base.glowIntensity,
    showGrid: typeof p.showGrid === "boolean" ? p.showGrid : base.showGrid,
    enableRouteLoader:
      typeof p.enableRouteLoader === "boolean"
        ? p.enableRouteLoader
        : base.enableRouteLoader,
    loaderText: cleanStr(p.loaderText, base.loaderText, 60),

    supportUrl: normalizeSupportUrl(cleanUrl(p.supportUrl, base.supportUrl, false)),
    inviteUrl:
      typeof p.inviteUrl === "string" && p.inviteUrl.trim()
        ? sanitizeDiscordInviteUrl(p.inviteUrl, site.clientId)
        : sanitizeDiscordInviteUrl(base.inviteUrl, site.clientId),
    inviteButtonLabel: cleanStr(p.inviteButtonLabel, base.inviteButtonLabel, 28),
    footerStatusText: cleanStr(p.footerStatusText, base.footerStatusText, 48),
    footerCopyright: cleanStr(p.footerCopyright, base.footerCopyright, 48),

    announcementEnabled:
      typeof p.announcementEnabled === "boolean"
        ? p.announcementEnabled
        : base.announcementEnabled,
    announcementBadge: cleanStr(p.announcementBadge, base.announcementBadge, 16, true),
    announcementText: cleanStr(p.announcementText, base.announcementText, 180, true),
    announcementLinkLabel: cleanStr(
      p.announcementLinkLabel,
      base.announcementLinkLabel,
      28,
      true,
    ),
    announcementLinkUrl:
      typeof p.announcementLinkUrl === "string" && !p.announcementLinkUrl.trim()
        ? ""
        : cleanUrl(p.announcementLinkUrl, base.announcementLinkUrl, false),
    maintenanceEnabled:
      typeof p.maintenanceEnabled === "boolean"
        ? p.maintenanceEnabled
        : base.maintenanceEnabled,
    maintenanceMessage: cleanStr(p.maintenanceMessage, base.maintenanceMessage, 220),

    currencySymbol: cleanStr(p.currencySymbol, base.currencySymbol, 6),
    currencyCode: cleanStr(p.currencyCode, base.currencyCode, 6).toUpperCase(),
    activationSla: cleanStr(p.activationSla, base.activationSla, 90),
    ticketInstructions: cleanStr(p.ticketInstructions, base.ticketInstructions, 420),
    invoiceFooterNote: cleanStr(p.invoiceFooterNote, base.invoiceFooterNote, 240, true),
    premiumRoleId:
      typeof p.premiumRoleId === "string"
        ? p.premiumRoleId.replace(/\D/g, "").slice(0, 22)
        : base.premiumRoleId,
    pricing: {
      plus: mergePlan("plus"),
      pro: mergePlan("pro"),
      ultra: mergePlan("ultra"),
    },

    updatedAt: updatedBy ? new Date().toISOString() : (base.updatedAt ?? null),
    updatedBy: updatedBy ?? base.updatedBy ?? null,
  };
}
