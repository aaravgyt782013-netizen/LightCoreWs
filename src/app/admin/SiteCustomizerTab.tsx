"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";
import {
  SURFACE_PRESETS,
  THEME_PRESETS,
  type GlowIntensity,
  type LogoShape,
  type SiteConfig,
  type SurfacePresetId,
  type ThemePresetId,
} from "@/lib/site-config";
import {
  applySiteThemeToDom,
  useSiteConfig,
} from "@/components/site/SiteConfigProvider";
import { ColorSwatchSelect, CustomSelect } from "@/components/ui/CustomSelect";
import {
  CheckIcon,
  PaletteIcon,
  RefreshIcon,
  UploadIcon,
} from "@/components/ui/Icons";

type SubSection = "theme" | "branding" | "links" | "pricing";

async function resizeImageFileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Invalid image format."));
      img.onload = () => {
        const maxDim = 256;
        const ratio = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * ratio));
        const h = Math.max(1, Math.round(img.height * ratio));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas unavailable."));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        const png = canvas.toDataURL("image/png");
        if (png.length <= 340_000) {
          resolve(png);
        } else {
          resolve(canvas.toDataURL("image/webp", 0.86));
        }
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export function SiteCustomizerTab({
  initialConfig,
  onSaved,
}: {
  initialConfig: SiteConfig;
  onSaved: (next: SiteConfig) => void;
}) {
  const { setLiveConfig } = useSiteConfig();
  const [section, setSection] = useState<SubSection>("theme");
  const [draft, setDraft] = useState<SiteConfig>(initialConfig);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!dirty) setDraft(initialConfig);
  }, [initialConfig, dirty]);

  const update = <K extends keyof SiteConfig>(key: K, val: SiteConfig[K]) => {
    setDraft((prev) => {
      const next = { ...prev, [key]: val };
      // Instant live theme preview right on the page!
      applySiteThemeToDom(next);
      return next;
    });
    setDirty(true);
    setNotice(null);
  };

  const updatePlan = (
    tier: "plus" | "pro" | "ultra",
    field: "name" | "badge" | "1m" | "3m" | "1y",
    value: string | number,
  ) => {
    setDraft((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [tier]: {
          ...prev.pricing[tier],
          [field]: value,
        },
      },
    }));
    setDirty(true);
    setNotice(null);
  };

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setNotice({ ok: false, text: "Please choose a PNG, JPG, WebP, or GIF image." });
      return;
    }
    try {
      const dataUrl = await resizeImageFileToDataUrl(file);
      setDraft((prev) => ({
        ...prev,
        logoUrl: dataUrl,
        faviconUrl: dataUrl,
      }));
      setDirty(true);
      setNotice({
        ok: true,
        text: "Logo loaded into preview! Click 'Save & Publish Live' to apply site-wide.",
      });
    } catch (err) {
      setNotice({
        ok: false,
        text: err instanceof Error ? err.message : "Could not process image.",
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/site-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        config?: SiteConfig;
        error?: string;
      };
      if (!res.ok || !json.ok || !json.config) {
        setNotice({ ok: false, text: json.error || "Could not save settings." });
        return;
      }
      setDraft(json.config);
      setLiveConfig(json.config);
      onSaved(json.config);
      setDirty(false);
      setNotice({
        ok: true,
        text: "Website theme, logo & settings published live across every page!",
      });
    } catch {
      setNotice({ ok: false, text: "Network error while saving configuration." });
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    setSaving(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/site-config", { method: "DELETE" });
      const json = (await res.json()) as { ok?: boolean; config?: SiteConfig };
      if (res.ok && json.config) {
        setDraft(json.config);
        setLiveConfig(json.config);
        onSaved(json.config);
        setDirty(false);
        setNotice({
          ok: true,
          text: "Restored default Crimson Core & Obsidian Black theme, LightCore logo, and settings.",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header + Save / Reset Bar */}
      <div className="panel panel-inner flex flex-wrap items-center justify-between gap-4 rounded-2xl border-brand-400/35 p-4 sm:p-5">
        <div>
          <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.24em] text-brand-400">
            <PaletteIcon className="size-3.5" />
            Live Website Studio
          </p>
          <p className="mt-1 text-[13px] text-zinc-400">
            Customize themes, accent colors, logos, text, banners, links &amp;
            plan prices live — no code or redeploy required.
            {draft.updatedAt && (
              <span className="ml-1.5 font-mono text-[10.5px] text-zinc-500">
                (Last saved by {draft.updatedBy || "Owner"})
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleResetDefaults()}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-brand-200/15 bg-ink-950/75 px-3.5 text-[12px] font-medium text-zinc-300 hover:border-brand-400/40 hover:text-white disabled:opacity-40"
          >
            <RefreshIcon className="size-3.5" />
            Reset Defaults
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleSave()}
            className="btn-glow relative inline-flex h-10 items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-5 text-[13px] font-semibold text-white shadow-[0_8px_24px_-6px_rgb(var(--brand-400)/0.8)] hover:brightness-110 disabled:opacity-50"
          >
            <CheckIcon className="size-4" />
            {saving
              ? "Publishing…"
              : dirty
                ? "Save & Publish Live *"
                : "Save & Publish Live"}
          </button>
        </div>
      </div>

      {notice && (
        <div
          className={`rounded-xl border px-4 py-3 font-mono text-[11.5px] ${
            notice.ok
              ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-300"
              : "border-amber-400/35 bg-amber-500/10 text-amber-200"
          }`}
        >
          {notice.text}
        </div>
      )}

      {/* Sub-Navigation Pills */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["theme", "1. Theme & Colors"],
            ["branding", "2. Logos & Brand Identity"],
            ["links", "3. Links & Top Banners"],
            ["pricing", "4. Plan Pricing & Invoice"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setSection(id)}
            className={`rounded-xl border px-4 py-2 text-[12.5px] font-semibold transition-all ${
              section === id
                ? "border-brand-400/60 bg-brand-500/20 text-white shadow-[0_0_20px_-8px_rgb(var(--brand-400))]"
                : "border-brand-200/10 bg-ink-900/60 text-zinc-400 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* SECTION 1: THEME & COLORS */}
      {section === "theme" && (
        <div className="space-y-5">
          <div className="panel panel-inner rounded-2xl p-5 sm:p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-brand-400">
              Color Theme Presets (Instant Live Preview)
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {THEME_PRESETS.map((t) => {
                const active = draft.themePreset === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => update("themePreset", t.id as ThemePresetId)}
                    className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-all ${
                      active
                        ? "border-brand-400 bg-brand-500/15 shadow-glow"
                        : "border-brand-200/10 bg-ink-950/70 hover:border-brand-400/35"
                    }`}
                  >
                    <span
                      style={{
                        backgroundColor: t.swatch,
                        boxShadow: `0 0 18px ${t.swatch}88`,
                      }}
                      className="mt-0.5 size-7 shrink-0 rounded-xl ring-2 ring-white/20"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="truncate text-[13px] font-semibold text-white">
                          {t.name}
                        </p>
                        {active && (
                          <CheckIcon className="size-3.5 shrink-0 text-brand-300" />
                        )}
                      </div>
                      <p className="mt-0.5 text-[11px] leading-snug text-zinc-400">
                        {t.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Accent Hex Option */}
            <div className="mt-5 grid gap-4 border-t border-brand-200/[0.08] pt-5 sm:grid-cols-2">
              <div>
                <Label>Or Pick Any Custom Accent Color</Label>
                <ColorSwatchSelect
                  value={draft.customAccentHex}
                  onChange={(hex) => {
                    setDraft((prev) => {
                      const next: SiteConfig = {
                        ...prev,
                        themePreset: "custom",
                        customAccentHex: hex,
                      };
                      applySiteThemeToDom(next);
                      return next;
                    });
                    setDirty(true);
                  }}
                />
                {draft.themePreset === "custom" && (
                  <p className="mt-1 font-mono text-[10px] text-brand-300">
                    ✓ Custom accent active ({draft.customAccentHex})
                  </p>
                )}
              </div>

              <div>
                <Label>Background Surface Style</Label>
                <CustomSelect
                  title="Select Background Surface"
                  value={draft.surfacePreset}
                  onChange={(v) => update("surfacePreset", v as SurfacePresetId)}
                  options={SURFACE_PRESETS.map((s) => ({
                    value: s.id,
                    label: s.name,
                    description: s.subtitle,
                  }))}
                />
              </div>
            </div>
          </div>

          <div className="panel panel-inner grid gap-4 rounded-2xl p-5 sm:grid-cols-2 lg:grid-cols-4 sm:p-6">
            <div>
              <Label>Ambient Glow Intensity</Label>
              <CustomSelect
                title="Select Ambient Glow Intensity"
                value={draft.glowIntensity}
                onChange={(v) => update("glowIntensity", v as GlowIntensity)}
                options={[
                  { value: "subtle", label: "Subtle & Minimal" },
                  { value: "balanced", label: "Balanced (Recommended)" },
                  { value: "vibrant", label: "Vibrant Neon" },
                ]}
              />
            </div>

            <div>
              <Label>Loading Screen Text</Label>
              <input
                type="text"
                value={draft.loaderText}
                onChange={(e) => update("loaderText", e.target.value)}
                placeholder="Connection Establishing..."
                className="input-aqua"
              />
            </div>

            <ToggleTile
              label="Architectural Grid"
              description="Show subtle background grid"
              checked={draft.showGrid}
              onChange={(v) => update("showGrid", v)}
            />

            <ToggleTile
              label="Route Loader Animation"
              description="Spinning logo splash on nav"
              checked={draft.enableRouteLoader}
              onChange={(v) => update("enableRouteLoader", v)}
            />
          </div>
        </div>
      )}

      {/* SECTION 2: LOGOS & BRAND IDENTITY */}
      {section === "branding" && (
        <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
          {/* Logo Uploader + Live Card */}
          <div className="panel panel-inner space-y-4 rounded-2xl p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-brand-400">
              Website &amp; Bot Logo
            </p>

            <div className="flex items-center gap-4 rounded-2xl border border-brand-200/12 bg-ink-950/80 p-4">
              <div className="relative flex size-16 shrink-0 items-center justify-center">
                {draft.logoGlow && (
                  <span className="absolute inset-0 rounded-full bg-brand-400/35 blur-xl" />
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={draft.logoUrl || site.logo}
                  alt="Logo preview"
                  className={`relative size-16 object-cover ring-1 ring-brand-300/30 ${
                    draft.logoShape === "circle"
                      ? "rounded-full"
                      : draft.logoShape === "rounded"
                        ? "rounded-xl"
                        : "rounded-[24%]"
                  }`}
                />
              </div>
              <div className="min-w-0">
                <p className="truncate font-display text-[18px] font-bold tracking-[0.14em] text-white">
                  <span>{draft.wordmarkLead}</span>
                  <span className="text-brand-400">{draft.wordmarkAccent}</span>
                </p>
                <p className="mt-0.5 truncate font-mono text-[9.5px] uppercase tracking-[0.22em] text-brand-300">
                  {draft.navBadge || "All-in-One"}
                </p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={(e) => void handleUploadLogo(e)}
              className="hidden"
            />

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-3 text-[12px] font-semibold text-white hover:bg-brand-500"
              >
                <UploadIcon className="size-3.5" />
                Upload Logo
              </button>
              <button
                type="button"
                onClick={() => {
                  update("logoUrl", site.logo);
                  update("faviconUrl", site.logo);
                }}
                className="h-10 rounded-xl border border-brand-200/15 bg-ink-950/70 px-3 text-[12px] text-zinc-300 hover:text-white"
              >
                Default Logo
              </button>
            </div>

            <div>
              <Label>Or Paste Logo Image URL</Label>
              <input
                type="text"
                value={
                  draft.logoUrl.startsWith("data:")
                    ? "(Uploaded custom image)"
                    : draft.logoUrl
                }
                onChange={(e) => {
                  if (!e.target.value.startsWith("(Uploaded")) {
                    update("logoUrl", e.target.value);
                  }
                }}
                placeholder="https://... or /brand/lightcore-logo.png"
                className="input-aqua font-mono text-[11.5px]"
              />
            </div>

            <div>
              <Label>Favicon URL</Label>
              <input
                type="text"
                value={
                  draft.faviconUrl.startsWith("data:")
                    ? "(Synced with uploaded logo)"
                    : draft.faviconUrl
                }
                onChange={(e) => {
                  if (!e.target.value.startsWith("(Synced")) {
                    update("faviconUrl", e.target.value);
                  }
                }}
                placeholder="/brand/lightcore-logo.png"
                className="input-aqua font-mono text-[11.5px]"
              />
            </div>

            <div>
              <Label>Logo Frame Shape</Label>
              <CustomSelect
                title="Select Logo Shape"
                value={draft.logoShape}
                onChange={(v) => update("logoShape", v as LogoShape)}
                options={[
                  { value: "squircle", label: "Modern Squircle (Default)" },
                  { value: "circle", label: "Perfect Circle" },
                  { value: "rounded", label: "Soft Rounded Square" },
                ]}
              />
            </div>

            <ToggleTile
              label="Logo Ambient Halo"
              description="Soft neon glow behind logo"
              checked={draft.logoGlow}
              onChange={(v) => update("logoGlow", v)}
            />
          </div>

          {/* Brand Copy & Wordmark */}
          <div className="panel panel-inner space-y-4 rounded-2xl p-5 sm:p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-brand-400">
              Brand Name, Wordmark &amp; Hero Copy
            </p>

            <div className="grid gap-3.5 sm:grid-cols-2">
              <div>
                <Label>Website / Bot Name</Label>
                <input
                  type="text"
                  value={draft.brandName}
                  onChange={(e) => update("brandName", e.target.value)}
                  className="input-aqua"
                />
              </div>
              <div>
                <Label>Bot Command Prefix</Label>
                <input
                  type="text"
                  maxLength={6}
                  value={draft.prefix}
                  onChange={(e) => update("prefix", e.target.value)}
                  className="input-aqua font-mono"
                />
              </div>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-3">
              <div>
                <Label>Wordmark Lead (White)</Label>
                <input
                  type="text"
                  value={draft.wordmarkLead}
                  onChange={(e) => update("wordmarkLead", e.target.value)}
                  className="input-aqua font-mono"
                />
              </div>
              <div>
                <Label>Wordmark Accent (Theme)</Label>
                <input
                  type="text"
                  value={draft.wordmarkAccent}
                  onChange={(e) => update("wordmarkAccent", e.target.value)}
                  className="input-aqua font-mono"
                />
              </div>
              <div>
                <Label>Navbar Sub-Label</Label>
                <input
                  type="text"
                  value={draft.navBadge}
                  onChange={(e) => update("navBadge", e.target.value)}
                  placeholder="All-in-One"
                  className="input-aqua font-mono"
                />
              </div>
            </div>

            <div>
              <Label>Hero Tagline</Label>
              <input
                type="text"
                value={draft.tagline}
                onChange={(e) => update("tagline", e.target.value)}
                className="input-aqua font-mono text-[12px]"
              />
            </div>

            <div>
              <Label>Main Description</Label>
              <input
                type="text"
                value={draft.description}
                onChange={(e) => update("description", e.target.value)}
                className="input-aqua"
              />
            </div>

            <div>
              <Label>Hero Secondary Text</Label>
              <textarea
                rows={3}
                value={draft.heroSubtext}
                onChange={(e) => update("heroSubtext", e.target.value)}
                className="input-aqua h-auto py-2.5"
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: LINKS, FOOTER & BANNERS */}
      {section === "links" && (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="panel panel-inner space-y-4 rounded-2xl p-5 sm:p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-brand-400">
              Links, Buttons &amp; Footer
            </p>
            <div>
              <Label>Support Server Invite URL (Used for Tickets)</Label>
              <input
                type="url"
                value={draft.supportUrl}
                onChange={(e) => update("supportUrl", e.target.value)}
                className="input-aqua font-mono text-[12px]"
              />
            </div>
            <div>
              <Label>Bot Invite URL</Label>
              <input
                type="url"
                value={draft.inviteUrl}
                onChange={(e) => update("inviteUrl", e.target.value)}
                className="input-aqua font-mono text-[12px]"
              />
            </div>
            <div className="grid gap-3.5 sm:grid-cols-2">
              <div>
                <Label>Invite Button Text</Label>
                <input
                  type="text"
                  value={draft.inviteButtonLabel}
                  onChange={(e) => update("inviteButtonLabel", e.target.value)}
                  className="input-aqua"
                />
              </div>
              <div>
                <Label>Footer Copyright Name</Label>
                <input
                  type="text"
                  value={draft.footerCopyright}
                  onChange={(e) => update("footerCopyright", e.target.value)}
                  className="input-aqua"
                />
              </div>
            </div>
            <div>
              <Label>Footer Operational Status Text</Label>
              <input
                type="text"
                value={draft.footerStatusText}
                onChange={(e) => update("footerStatusText", e.target.value)}
                className="input-aqua font-mono text-[12px]"
              />
            </div>
          </div>

          <div className="panel panel-inner space-y-4 rounded-2xl p-5 sm:p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-brand-400">
              Global Announcement &amp; Maintenance Strip
            </p>
            <ToggleTile
              label="Top Announcement Banner"
              description="Display a sleek announcement bar across the website"
              checked={draft.announcementEnabled}
              onChange={(v) => update("announcementEnabled", v)}
            />
            <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
              <div>
                <Label>Badge</Label>
                <input
                  type="text"
                  value={draft.announcementBadge}
                  onChange={(e) => update("announcementBadge", e.target.value)}
                  placeholder="NEW"
                  className="input-aqua font-mono text-[12px]"
                />
              </div>
              <div>
                <Label>Banner Text</Label>
                <input
                  type="text"
                  value={draft.announcementText}
                  onChange={(e) => update("announcementText", e.target.value)}
                  className="input-aqua"
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Link Button Label</Label>
                <input
                  type="text"
                  value={draft.announcementLinkLabel}
                  onChange={(e) =>
                    update("announcementLinkLabel", e.target.value)
                  }
                  placeholder="View Plans"
                  className="input-aqua"
                />
              </div>
              <div>
                <Label>Link URL</Label>
                <input
                  type="text"
                  value={draft.announcementLinkUrl}
                  onChange={(e) =>
                    update("announcementLinkUrl", e.target.value)
                  }
                  placeholder="/premium"
                  className="input-aqua font-mono text-[12px]"
                />
              </div>
            </div>

            <div className="border-t border-brand-200/[0.08] pt-4">
              <ToggleTile
                label="Maintenance Notice Strip"
                description="Show a live maintenance warning bar on all pages"
                checked={draft.maintenanceEnabled}
                onChange={(v) => update("maintenanceEnabled", v)}
              />
              <div className="mt-3">
                <Label>Maintenance Message</Label>
                <input
                  type="text"
                  value={draft.maintenanceMessage}
                  onChange={(e) => update("maintenanceMessage", e.target.value)}
                  className="input-aqua"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: PREMIUM PLAN PRICING & INVOICE CUSTOMIZATION */}
      {section === "pricing" && (
        <div className="space-y-5">
          <div className="panel panel-inner rounded-2xl p-5 sm:p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-brand-400">
              Premium Plan Names, Badges &amp; Prices
            </p>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              {(["plus", "pro", "ultra"] as const).map((tier) => {
                const p = draft.pricing[tier];
                return (
                  <div
                    key={tier}
                    className="space-y-3 rounded-xl border border-brand-200/12 bg-ink-950/70 p-4"
                  >
                    <p className="font-mono text-[10px] uppercase tracking-wider text-brand-300">
                      {tier} tier
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Plan Name</Label>
                        <input
                          type="text"
                          value={p.name}
                          onChange={(e) =>
                            updatePlan(tier, "name", e.target.value)
                          }
                          className="input-aqua"
                        />
                      </div>
                      <div>
                        <Label>Badge</Label>
                        <input
                          type="text"
                          value={p.badge}
                          onChange={(e) =>
                            updatePlan(tier, "badge", e.target.value)
                          }
                          className="input-aqua"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {(["1m", "3m", "1y"] as const).map((c) => (
                        <div key={c}>
                          <Label>{c.toUpperCase()}</Label>
                          <input
                            type="number"
                            min={0}
                            value={p[c]}
                            onChange={(e) =>
                              updatePlan(tier, c, Number(e.target.value) || 0)
                            }
                            className="input-aqua font-mono text-[12px]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="panel panel-inner space-y-4 rounded-2xl p-5 sm:p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-brand-400">
              Invoice &amp; Support Ticket Text
            </p>
            <div className="grid gap-3.5 sm:grid-cols-3">
              <div>
                <Label>Currency</Label>
                <CustomSelect
                  title="Select Website Currency"
                  value={draft.currencyCode}
                  onChange={(code) => {
                    const symMap: Record<string, string> = {
                      INR: "₹",
                      USD: "$",
                      EUR: "€",
                      GBP: "£",
                    };
                    update("currencyCode", code);
                    update("currencySymbol", symMap[code] || "₹");
                  }}
                  options={[
                    { value: "INR", label: "INR (₹ Rupee)" },
                    { value: "USD", label: "USD ($ Dollar)" },
                    { value: "EUR", label: "EUR (€ Euro)" },
                    { value: "GBP", label: "GBP (£ Pound)" },
                  ]}
                />
              </div>
              <div>
                <Label>Activation SLA Promise</Label>
                <input
                  type="text"
                  value={draft.activationSla}
                  onChange={(e) => update("activationSla", e.target.value)}
                  className="input-aqua"
                />
              </div>
              <div>
                <Label>Discord Premium Role ID (Optional)</Label>
                <input
                  type="text"
                  value={draft.premiumRoleId}
                  onChange={(e) => update("premiumRoleId", e.target.value)}
                  placeholder="Auto-grant role on activation"
                  className="input-aqua font-mono text-[12px]"
                />
              </div>
            </div>
            <div>
              <Label>Checkout &amp; Ticket Instructions</Label>
              <textarea
                rows={2}
                value={draft.ticketInstructions}
                onChange={(e) => update("ticketInstructions", e.target.value)}
                className="input-aqua h-auto py-2.5"
              />
            </div>
            <div>
              <Label>Downloaded Invoice Footer Note</Label>
              <input
                type="text"
                value={draft.invoiceFooterNote}
                onChange={(e) => update("invoiceFooterNote", e.target.value)}
                className="input-aqua"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1.5 block font-mono text-[9.5px] uppercase tracking-[0.2em] text-zinc-400">
      {children}
    </span>
  );
}

function ToggleTile({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`flex items-center justify-between gap-3 rounded-xl border p-3.5 text-left transition-all ${
        checked
          ? "border-brand-400/45 bg-brand-500/12"
          : "border-brand-200/10 bg-ink-950/70"
      }`}
    >
      <div className="min-w-0">
        <p className="text-[12.5px] font-semibold text-white">{label}</p>
        <p className="mt-0.5 text-[11px] text-zinc-400">{description}</p>
      </div>
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-brand-500" : "bg-ink-700"
        }`}
      >
        <span
          className={`inline-block size-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </span>
    </button>
  );
}
