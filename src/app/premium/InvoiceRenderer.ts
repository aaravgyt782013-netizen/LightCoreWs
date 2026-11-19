import type { PremiumInvoice } from "@/lib/premium-plans";
import type { SiteConfig } from "@/lib/site-config";
import { getResolvedAccentHex } from "@/lib/site-config";
import { normalizeSupportUrl } from "@/lib/site";

export function formatInvoiceDateTime(iso: string): {
  dateStr: string;
  timeStr: string;
  utcStr: string;
} {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return { dateStr: iso, timeStr: "", utcStr: iso };
  }
  const dateStr = d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeStr = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZoneName: "short",
  });
  const utcStr = d.toISOString().replace("T", " ").slice(0, 19) + " UTC";
  return { dateStr, timeStr, utcStr };
}

export function buildInvoicePlainText(
  inv: PremiumInvoice,
  siteCfg: SiteConfig,
): string {
  const dt = formatInvoiceDateTime(inv.createdAt);
  const statusLabel =
    inv.status === "fulfilled"
      ? "PAID & ACTIVATED"
      : inv.status === "cancelled"
        ? "CANCELLED"
        : "AWAITING TICKET PAYMENT";

  const lines = [
    `================================================`,
    `  ${(inv.brandName || siteCfg.brandName).toUpperCase()} — PREMIUM ORDER SUMMARY`,
    `================================================`,
    `Order Reference        : ${inv.invoiceId}`,
    `Reference Code : ${inv.verificationCode}`,
    `Status            : ${statusLabel}`,
    `Date              : ${dt.dateStr}`,
    `Time              : ${dt.timeStr}`,
    `UTC Timestamp     : ${dt.utcStr}`,
    `------------------------------------------------`,
    `CUSTOMER (DISCORD ACCOUNT)`,
    `Display Name      : ${inv.globalName || inv.username}`,
    `Username          : @${inv.username}`,
    `Discord User ID   : ${inv.userId}`,

    `Target Server     : ${
      inv.guildId
        ? `${inv.guildName || "Selected Server"} (${inv.guildId})`
        : "To be assigned in Support Ticket"
    }`,
    `------------------------------------------------`,
    `SELECTED PLAN & PRICING`,
    `Plan              : ${inv.tierName} (${inv.tierBadge})`,
    `Duration          : ${inv.durationLabel}`,
    `Payment Process   : Confirm payment instructions in Support Server`,
    `Activation Timing : Confirmed by the owner after payment verification`,
    `Total Amount      : ${inv.currencySymbol}${inv.amount.toLocaleString("en-IN")} ${inv.currencyCode}`,
    ``,
    `Included Features :`,
    ...inv.features.map((f) => `  • ${f}`),
    ...(inv.buyerNote
      ? [`------------------------------------------------`, `Customer Note     : ${inv.buyerNote}`]
      : []),
    `------------------------------------------------`,
    `NEXT STEPS TO ACTIVATE PREMIUM:`,
    `1. Join Support Server: ${normalizeSupportUrl(inv.supportUrl || siteCfg.supportUrl)}`,
    `2. Open a Support Ticket and share this order summary.`,
    `3. The support team will explain the available payment method.`,
    `4. The owner will confirm activation after payment is verified.`,
    `================================================`,
    siteCfg.invoiceFooterNote || "Order summary generated for your records.",
    "IMPORTANT: This is not a tax invoice or proof of payment. No payment is collected on this website. Confirm seller details before paying. Never share passwords or one-time codes.",
  ];
  return lines.join("\n");
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function loadImageSafe(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    const timer = window.setTimeout(() => resolve(null), 2500);
    img.onload = () => {
      window.clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      window.clearTimeout(timer);
      resolve(null);
    };
    img.src = src;
  });
}

/**
 * Renders a crisp 2x high-resolution branded order summary PNG ready to share
 * straight into a Discord Support Server ticket on both PC and mobile.
 */
export async function downloadInvoicePng(
  inv: PremiumInvoice,
  siteCfg: SiteConfig,
): Promise<void> {
  const W = 920;
  const H = inv.buyerNote ? 1240 : 1175;
  const scale = 2;

  const canvas = document.createElement("canvas");
  canvas.width = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(scale, scale);

  const accent = getResolvedAccentHex(siteCfg);
  const dt = formatInvoiceDateTime(inv.createdAt);
  const brand = inv.brandName || siteCfg.brandName || "LightCore";

  // Background base — warm Velvet Black
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, "#0d0b07");
  bgGrad.addColorStop(0.5, "#080604");
  bgGrad.addColorStop(1, "#050403");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Subtle top radial glow
  const glow = ctx.createRadialGradient(W / 2, 0, 20, W / 2, 40, 540);
  glow.addColorStop(0, `${accent}30`);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, 460);

  // Outer card frame
  roundRectPath(ctx, 28, 28, W - 56, H - 56, 30);
  ctx.fillStyle = "rgba(15, 13, 9, 0.96)";
  ctx.fill();
  ctx.lineWidth = 1.25;
  ctx.strokeStyle = `${accent}42`;
  ctx.stroke();

  // Top glowing accent bar
  ctx.save();
  roundRectPath(ctx, 28, 28, W - 56, 8, 4);
  ctx.fillStyle = accent;
  ctx.fill();
  ctx.restore();

  // Logo + Brand Header
  const logoImg = await loadImageSafe(siteCfg.logoUrl);
  let textStartX = 64;
  if (logoImg) {
    ctx.save();
    roundRectPath(ctx, 64, 66, 58, 58, 15);
    ctx.clip();
    ctx.drawImage(logoImg, 64, 66, 58, 58);
    ctx.restore();
    roundRectPath(ctx, 64, 66, 58, 58, 15);
    ctx.strokeStyle = `${accent}66`;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    textStartX = 138;
  }

  ctx.fillStyle = "#ffffff";
  ctx.font = "700 28px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillText(brand.toUpperCase(), textStartX, 96);

  ctx.fillStyle = accent;
  ctx.font = "600 11px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillText(
    (siteCfg.tagline || "PREMIUM ORDER SUMMARY").toUpperCase().slice(0, 48),
    textStartX,
    118,
  );

  // Right Header: Order Summary Title + Status Pill
  ctx.textAlign = "right";
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 24px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillText("ORDER SUMMARY", W - 64, 88);

  const statusText =
    inv.status === "fulfilled"
      ? "PAID & ACTIVATED"
      : inv.status === "cancelled"
        ? "CANCELLED"
        : "SUBMIT IN TICKET";
  const statusColor =
    inv.status === "fulfilled"
      ? "#10b981"
      : inv.status === "cancelled"
        ? "#f87171"
        : accent;

  ctx.font = "700 11px ui-monospace, SFMono-Regular, Menlo, monospace";
  const pillW = ctx.measureText(statusText).width + 26;
  roundRectPath(ctx, W - 64 - pillW, 100, pillW, 26, 13);
  ctx.fillStyle = `${statusColor}22`;
  ctx.fill();
  ctx.strokeStyle = `${statusColor}77`;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = statusColor;
  ctx.fillText(statusText, W - 64 - 13, 117);
  ctx.textAlign = "left";

  // Divider
  ctx.strokeStyle = "rgba(148, 163, 184, 0.16)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(64, 152);
  ctx.lineTo(W - 64, 152);
  ctx.stroke();

  // Order Summary Metadata Strip (4 columns)
  const metaY = 174;
  roundRectPath(ctx, 64, metaY, W - 128, 86, 16);
  ctx.fillStyle = "rgba(6, 6, 9, 0.92)";
  ctx.fill();
  ctx.strokeStyle = "rgba(148, 163, 184, 0.14)";
  ctx.stroke();

  const metaCols = [
    { label: "ORDER REFERENCE", val: inv.invoiceId, accent: true },
    { label: "ISSUE DATE", val: dt.dateStr, accent: false },
    { label: "ISSUE TIME", val: dt.timeStr, accent: false },
    { label: "REFERENCE CODE", val: inv.verificationCode, accent: true },
  ];
  const colW = (W - 128) / 4;
  metaCols.forEach((m, idx) => {
    const cx = 82 + idx * colW;
    ctx.fillStyle = "#64748b";
    ctx.font = "600 10px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.fillText(m.label, cx, metaY + 30);
    ctx.fillStyle = m.accent ? accent : "#f1f5f9";
    ctx.font = "700 13px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.fillText(m.val.slice(0, 22), cx, metaY + 56);
  });

  // Two Info Cards: Buyer Discord Account + Target Discord Server
  const boxY = 282;
  const halfW = (W - 128 - 20) / 2;

  // Buyer Box
  roundRectPath(ctx, 64, boxY, halfW, 162, 16);
  ctx.fillStyle = "rgba(7, 7, 10, 0.88)";
  ctx.fill();
  ctx.strokeStyle = "rgba(148, 163, 184, 0.14)";
  ctx.stroke();

  ctx.fillStyle = accent;
  ctx.font = "700 10.5px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillText("BILLED TO · DISCORD USER", 84, boxY + 28);

  ctx.fillStyle = "#ffffff";
  ctx.font = "700 18px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillText((inv.globalName || inv.username).slice(0, 28), 84, boxY + 58);

  ctx.fillStyle = "#cbd5e1";
  ctx.font = "500 13px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillText(`Username : @${inv.username}`, 84, boxY + 86);
  ctx.fillText(`User ID  : ${inv.userId}`, 84, boxY + 110);
  ctx.fillStyle = "#94a3b8";
  ctx.font = "500 12px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillText(
    `UTC      : ${dt.utcStr}`,
    84,
    boxY + 134,
  );

  // Server & Delivery Box
  const rightX = 64 + halfW + 20;
  roundRectPath(ctx, rightX, boxY, halfW, 162, 16);
  ctx.fillStyle = "rgba(7, 7, 10, 0.88)";
  ctx.fill();
  ctx.strokeStyle = "rgba(148, 163, 184, 0.14)";
  ctx.stroke();

  ctx.fillStyle = accent;
  ctx.font = "700 10.5px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillText("TARGET SERVER & DELIVERY", rightX + 20, boxY + 28);

  ctx.fillStyle = "#ffffff";
  ctx.font = "700 17px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillText(
    (inv.guildName || "Assign in Support Ticket").slice(0, 28),
    rightX + 20,
    boxY + 58,
  );

  ctx.fillStyle = "#cbd5e1";
  ctx.font = "500 13px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillText(
    `Server ID: ${inv.guildId || "Provided in ticket"}`,
    rightX + 20,
    boxY + 86,
  );
  ctx.fillText(`Payment  : Confirm instructions in Support Server`, rightX + 20, boxY + 110);
  ctx.fillStyle = "#34d399";
  ctx.font = "600 12px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillText(`Delivery : Instant (within 24h)`, rightX + 20, boxY + 134);

  // Plan & Pricing Breakdown Box
  const planY = 468;
  const planH = 330;
  roundRectPath(ctx, 64, planY, W - 128, planH, 18);
  ctx.fillStyle = "rgba(6, 6, 9, 0.92)";
  ctx.fill();
  ctx.strokeStyle = `${accent}44`;
  ctx.stroke();

  // Table header
  roundRectPath(ctx, 64, planY, W - 128, 44, 18);
  ctx.fillStyle = `${accent}18`;
  ctx.fill();

  ctx.fillStyle = accent;
  ctx.font = "700 11px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillText("SELECTED PREMIUM PLAN", 88, planY + 27);
  ctx.fillText("DURATION", 470, planY + 27);
  ctx.textAlign = "right";
  ctx.fillText("AMOUNT", W - 88, planY + 27);
  ctx.textAlign = "left";

  // Plan Row
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 22px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillText(`${inv.tierName}`, 88, planY + 82);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "600 12px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillText(`${inv.tierBadge.toUpperCase()} TIER`, 88, planY + 104);

  ctx.fillStyle = "#e2e8f0";
  ctx.font = "600 15px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillText(inv.durationLabel, 470, planY + 84);

  ctx.textAlign = "right";
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 24px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillText(
    `${inv.currencySymbol}${inv.amount.toLocaleString("en-IN")}`,
    W - 88,
    planY + 84,
  );
  ctx.textAlign = "left";

  // Included features (2 columns)
  ctx.fillStyle = "#64748b";
  ctx.font = "700 10px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillText("INCLUDED PERKS & PROTECTION", 88, planY + 138);

  ctx.font = "500 13px system-ui, -apple-system, Segoe UI, sans-serif";
  inv.features.slice(0, 8).forEach((feat, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const fx = col === 0 ? 88 : 470;
    const fy = planY + 164 + row * 24;
    ctx.fillStyle = accent;
    ctx.fillText("✓", fx, fy);
    ctx.fillStyle = "#cbd5e1";
    ctx.fillText(feat.slice(0, 38), fx + 18, fy);
  });

  // Total Bar
  ctx.strokeStyle = "rgba(148, 163, 184, 0.16)";
  ctx.beginPath();
  ctx.moveTo(88, planY + 266);
  ctx.lineTo(W - 88, planY + 266);
  ctx.stroke();

  ctx.fillStyle = "#94a3b8";
  ctx.font = "600 12px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillText("TOTAL PAYABLE (IN SUPPORT TICKET)", 88, planY + 302);

  ctx.textAlign = "right";
  ctx.fillStyle = accent;
  ctx.font = "700 28px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillText(
    `${inv.currencySymbol}${inv.amount.toLocaleString("en-IN")} ${inv.currencyCode}`,
    W - 88,
    planY + 305,
  );
  ctx.textAlign = "left";

  let cursorY = planY + planH + 22;

  // Optional Buyer Note
  if (inv.buyerNote) {
    roundRectPath(ctx, 64, cursorY, W - 128, 52, 12);
    ctx.fillStyle = "rgba(18, 18, 24, 0.85)";
    ctx.fill();
    ctx.strokeStyle = "rgba(148, 163, 184, 0.16)";
    ctx.stroke();
    ctx.fillStyle = "#94a3b8";
    ctx.font = "600 12px system-ui, -apple-system, Segoe UI, sans-serif";
    ctx.fillText(`Note: ${inv.buyerNote.slice(0, 92)}`, 84, cursorY + 31);
    cursorY += 68;
  }

  // How to Claim / Support Ticket Instructions Box
  roundRectPath(ctx, 64, cursorY, W - 128, 224, 18);
  ctx.fillStyle = `${accent}12`;
  ctx.fill();
  ctx.strokeStyle = `${accent}55`;
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = "700 15px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillText("ORDER SUMMARY · SUPPORT PROCESS", 88, cursorY + 34);

  const steps = [
    `1. Open a ticket in our Support Server: ${normalizeSupportUrl(inv.supportUrl || siteCfg.supportUrl)}`,
    `2. Share this order summary (${inv.invoiceId}) inside your ticket.`,
    `3. The Owner will provide the payment instructions in your ticket.`,
    `4. The owner will confirm activation after payment is verified.`,
  ];
  ctx.font = "500 13.5px system-ui, -apple-system, Segoe UI, sans-serif";
  steps.forEach((s, idx) => {
    ctx.fillStyle = "#e2e8f0";
    ctx.fillText(s, 88, cursorY + 68 + idx * 28);
  });

  ctx.fillStyle = "#94a3b8";
  ctx.font = "500 11.5px ui-monospace, SFMono-Regular, Menlo, monospace";
  const footLines = wrapLines(
    ctx,
    "ORDER SUMMARY ONLY — NOT A TAX INVOICE OR PROOF OF PAYMENT. No payment is collected here. Confirm seller details before paying. Never share passwords or one-time codes.",
    W - 176,
  );
  footLines.slice(0, 2).forEach((ln, i) => {
    ctx.fillText(ln, 88, cursorY + 186 + i * 17);
  });

  // Footer timestamp
  ctx.fillStyle = "#475569";
  ctx.font = "500 11px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.textAlign = "center";
  ctx.fillText(
    `${brand} · Generated ${dt.utcStr} · ${inv.invoiceId} · ${inv.verificationCode}`,
    W / 2,
    H - 46,
  );

  // Trigger download
  const dataUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.download = `${inv.invoiceId}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadInvoiceText(
  inv: PremiumInvoice,
  siteCfg: SiteConfig,
): void {
  const txt = buildInvoicePlainText(inv, siteCfg);
  const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = `${inv.invoiceId}.txt`;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
