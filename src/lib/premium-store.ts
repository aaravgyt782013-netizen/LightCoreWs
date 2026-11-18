import crypto from "node:crypto";
import { kvDelete, kvGet, kvListValues, kvSet } from "@/lib/kv-store";
import { getSiteConfig } from "@/lib/site-config-server";
import {
  BILLING_CYCLES,
  DURATION_PRESETS,
  PREMIUM_PLANS,
  TIER_RANK,
  customTimeToMs,
  defaultPerksForTier,
  type BillingCycle,
  type CustomTimeUnit,
  type InvoiceStatus,
  type PremiumInvoice,
  type PremiumPerks,
  type PremiumPlanSpec,
  type PremiumRecord,
  type PremiumSubscription,
  type PremiumTargetType,
  type PremiumTier,
} from "@/lib/premium-plans";

export {
  BILLING_CYCLES,
  DURATION_PRESETS,
  PREMIUM_PLANS,
  TIER_RANK,
  type BillingCycle,
  type CustomTimeUnit,
  type InvoiceStatus,
  type PremiumInvoice,
  type PremiumPerks,
  type PremiumPlanSpec,
  type PremiumRecord,
  type PremiumSubscription,
  type PremiumTargetType,
  type PremiumTier,
};

const RECORD_PREFIX = "premium-v2/records/";
const INVOICE_PREFIX = "premium-v2/invoices/";

function recordKey(id: string): string {
  return `${RECORD_PREFIX}${id}`;
}

function invoiceKey(invoiceId: string): string {
  return `${INVOICE_PREFIX}${invoiceId}`;
}

export function isRecordCurrentlyActive(
  rec: PremiumRecord | null | undefined,
  nowMs = Date.now(),
): rec is PremiumRecord {
  if (!rec || rec.status !== "active") return false;
  if (rec.isLifetime || !rec.expiresAt) return true;
  const exp = Date.parse(rec.expiresAt);
  return Number.isFinite(exp) && exp > nowMs;
}

export function recordToSubscription(rec: PremiumRecord): PremiumSubscription {
  return {
    id: rec.id,
    targetType: rec.targetType,
    userId: rec.userId || "",
    username: rec.username || rec.guildName || "Premium",
    globalName: rec.globalName,
    avatarUrl: rec.avatarUrl,
    tier: rec.tier,
    tierName: rec.tierName,
    durationLabel: rec.durationLabel,
    isLifetime: rec.isLifetime,
    guildId: rec.guildId,
    guildName: rec.guildName,
    activatedAt: rec.startedAt,
    expiresAt: rec.expiresAt,
    invoiceId: rec.invoiceId,
    grantedBy: rec.grantedBy,
    pricePaid: rec.pricePaid,
    currencySymbol: rec.currencySymbol,
    maxServers: rec.maxServers,
    perks: rec.perks,
  };
}

function pickBestActiveRecord(records: PremiumRecord[]): PremiumRecord | null {
  const now = Date.now();
  const active = records.filter((r) => isRecordCurrentlyActive(r, now));
  if (active.length === 0) return null;
  active.sort((a, b) => {
    const rankDiff = (TIER_RANK[b.tier] || 0) - (TIER_RANK[a.tier] || 0);
    if (rankDiff !== 0) return rankDiff;
    if (a.isLifetime !== b.isLifetime) return a.isLifetime ? -1 : 1;
    const ea = a.expiresAt ? Date.parse(a.expiresAt) : 0;
    const eb = b.expiresAt ? Date.parse(b.expiresAt) : 0;
    return eb - ea;
  });
  return active[0];
}

export async function listAllPremiumRecords(
  limit = 500,
): Promise<PremiumRecord[]> {
  const all = await kvListValues<PremiumRecord>(RECORD_PREFIX, limit);
  const valid = all.filter((r) => Boolean(r && r.id && r.tier));
  const now = Date.now();

  const bucket = (r: PremiumRecord): number => {
    if (r.status !== "active") return 2; // revoked
    if (isRecordCurrentlyActive(r, now)) return 0; // active / lifetime
    return 1; // expired naturally
  };

  return valid.sort((a, b) => {
    const bd = bucket(a) - bucket(b);
    if (bd !== 0) return bd;
    return (Date.parse(b.startedAt) || 0) - (Date.parse(a.startedAt) || 0);
  });
}

export async function listActivePremiumRecords(): Promise<PremiumRecord[]> {
  const all = await listAllPremiumRecords(500);
  const now = Date.now();
  return all.filter((r) => isRecordCurrentlyActive(r, now));
}

export async function getPremiumRecord(
  id: string,
): Promise<PremiumRecord | null> {
  if (!id) return null;
  return kvGet<PremiumRecord>(recordKey(id));
}

export async function getUserSubscription(
  userId: string,
): Promise<PremiumSubscription | null> {
  if (!userId) return null;
  const all = await listAllPremiumRecords(500);
  const matching = all.filter(
    (r) =>
      (r.targetType === "user" || r.targetType === "both") &&
      r.userId === userId,
  );
  const best = pickBestActiveRecord(matching);
  return best ? recordToSubscription(best) : null;
}

export async function getGuildSubscription(
  guildId: string,
): Promise<PremiumSubscription | null> {
  if (!guildId) return null;
  const all = await listAllPremiumRecords(500);
  const matching = all.filter((r) => r.guildId === guildId);
  const best = pickBestActiveRecord(matching);
  return best ? recordToSubscription(best) : null;
}

export async function updateSubscriptionGuild(input: {
  userId: string;
  guildId: string | null;
  guildName: string | null;
}): Promise<PremiumSubscription | null> {
  const all = await listAllPremiumRecords(500);
  const matching = all.filter(
    (r) =>
      (r.targetType === "user" || r.targetType === "both") &&
      r.userId === input.userId,
  );
  const best = pickBestActiveRecord(matching);
  if (!best) return null;

  const updated: PremiumRecord = {
    ...best,
    targetType: input.guildId ? "both" : "user",
    guildId: input.guildId,
    guildName: input.guildName,
    updatedAt: new Date().toISOString(),
  };
  await kvSet(recordKey(updated.id), updated);
  return recordToSubscription(updated);
}

/**
 * Creates a premium order summary (NO payment collected on website).
 * Buyers download & share this order summary in a Support Server ticket to receive
 * payment instructions and activation confirmation after payment is verified.
 */
export async function createPremiumInvoice(input: {
  userId: string;
  username: string;
  globalName: string | null;
  avatarUrl: string | null;
  email?: string | null;
  tier: PremiumTier;
  cycle: BillingCycle;
  guildId?: string | null;
  guildName?: string | null;
  buyerNote?: string | null;
}): Promise<{ ok: true; invoice: PremiumInvoice } | { ok: false; error: string }> {
  const plan = PREMIUM_PLANS.find((p) => p.id === input.tier);
  const cycleSpec = BILLING_CYCLES.find((c) => c.id === input.cycle);
  if (!plan || !cycleSpec) {
    return { ok: false, error: "Invalid plan or billing duration selected." };
  }

  const siteCfg = await getSiteConfig();
  const planCfg = siteCfg.pricing[plan.id];
  const amount = planCfg ? planCfg[cycleSpec.id] : plan.prices[cycleSpec.id];
  const tierName = planCfg?.name || plan.name;
  const tierBadge = planCfg?.badge || plan.badge;

  const now = new Date();
  const dateStamp = [
    now.getUTCFullYear(),
    String(now.getUTCMonth() + 1).padStart(2, "0"),
    String(now.getUTCDate()).padStart(2, "0"),
  ].join("");
  const randSuffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  const invoiceId = `LC-INV-${dateStamp}-${randSuffix}`;

  const verifyHash = crypto
    .createHash("sha256")
    .update(`${invoiceId}:${input.userId}:${plan.id}:${amount}:${now.toISOString()}`)
    .digest("hex")
    .slice(0, 8)
    .toUpperCase();

  const invoice: PremiumInvoice = {
    invoiceId,
    verificationCode: `VRF-${verifyHash}`,
    createdAt: now.toISOString(),
    userId: input.userId,
    username: input.username,
    globalName: input.globalName,
    avatarUrl: input.avatarUrl,
    email: input.email ? input.email.trim().slice(0, 120) : null,
    guildId: input.guildId ? input.guildId.trim().slice(0, 24) : null,
    guildName: input.guildName ? input.guildName.trim().slice(0, 100) : null,
    tier: plan.id,
    tierName,
    tierBadge,
    features: [...plan.features],
    cycle: cycleSpec.id,
    durationLabel: `${cycleSpec.period} (${cycleSpec.days} Days)`,
    durationDays: cycleSpec.days,
    amount,
    currencySymbol: siteCfg.currencySymbol || "₹",
    currencyCode: siteCfg.currencyCode || "INR",
    paymentMethod: "Support Server Ticket · Owner QR",
    activationSla: siteCfg.activationSla || "Instant activation within 24 hours",
    supportUrl: siteCfg.supportUrl,
    brandName: siteCfg.brandName,
    buyerNote: input.buyerNote ? input.buyerNote.trim().slice(0, 240) : null,
    status: "pending_ticket",
    fulfilledAt: null,
    fulfilledBy: null,
    linkedRecordId: null,
  };

  await kvSet(invoiceKey(invoiceId), invoice);
  return { ok: true, invoice };
}

export async function getPremiumInvoice(
  invoiceId: string,
): Promise<PremiumInvoice | null> {
  if (!invoiceId) return null;
  return kvGet<PremiumInvoice>(invoiceKey(invoiceId));
}

export async function listPremiumInvoices(
  limit = 200,
): Promise<PremiumInvoice[]> {
  const all = await kvListValues<PremiumInvoice>(INVOICE_PREFIX, limit);
  return all
    .filter((i) => Boolean(i && i.invoiceId && i.userId))
    .sort(
      (a, b) =>
        (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0),
    );
}

export async function updateInvoiceStatus(input: {
  invoiceId: string;
  status: InvoiceStatus;
  actor?: string;
  linkedRecordId?: string | null;
}): Promise<PremiumInvoice | null> {
  const inv = await getPremiumInvoice(input.invoiceId);
  if (!inv) return null;
  const updated: PremiumInvoice = {
    ...inv,
    status: input.status,
    fulfilledAt:
      input.status === "fulfilled" ? new Date().toISOString() : inv.fulfilledAt,
    fulfilledBy: input.actor ?? inv.fulfilledBy,
    linkedRecordId:
      input.linkedRecordId !== undefined
        ? input.linkedRecordId
        : inv.linkedRecordId,
  };
  await kvSet(invoiceKey(updated.invoiceId), updated);
  return updated;
}

export async function deletePremiumInvoice(invoiceId: string): Promise<boolean> {
  const existing = await getPremiumInvoice(invoiceId);
  if (!existing) return false;
  await kvDelete(invoiceKey(invoiceId));
  return true;
}

async function tryAssignDiscordPremiumRole(userId: string | null): Promise<void> {
  if (!userId) return;
  const botToken = process.env.DISCORD_BOT_TOKEN?.trim();
  const supportGuild = process.env.DISCORD_AUTO_JOIN_GUILD_ID?.trim();
  const siteCfg = await getSiteConfig();
  const roleId = siteCfg.premiumRoleId?.trim();
  if (!botToken || !supportGuild || !roleId) return;

  try {
    await fetch(
      `https://discord.com/api/v10/guilds/${supportGuild}/members/${userId}/roles/${roleId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bot ${botToken}`,
          "X-Audit-Log-Reason": `${siteCfg.brandName} Premium activated`,
        },
        signal: AbortSignal.timeout(4000),
      },
    );
  } catch {
    // Non-fatal optional sync.
  }
}

export async function grantPremiumRecord(input: {
  targetType: PremiumTargetType;
  userId?: string | null;
  username?: string | null;
  globalName?: string | null;
  avatarUrl?: string | null;
  guildId?: string | null;
  guildName?: string | null;
  tier: PremiumTier;
  customTierName?: string | null;
  durationPreset: string;
  customAmount?: number;
  customUnit?: CustomTimeUnit;
  pricePaid: number;
  currencyCode?: string;
  currencySymbol?: string;
  paymentMethod?: string;
  paymentReference?: string | null;
  invoiceId?: string | null;
  ticketId?: string | null;
  grantedBy: string;
  grantedById: string;
  maxServers?: number;
  perks?: Partial<PremiumPerks>;
  notes?: string | null;
}): Promise<{ ok: true; record: PremiumRecord } | { ok: false; error: string }> {
  const cleanUserId = (input.userId || "").replace(/\D/g, "").trim();
  const cleanGuildId = (input.guildId || "").replace(/\D/g, "").trim();

  if (
    (input.targetType === "user" || input.targetType === "both") &&
    !/^\d{15,22}$/.test(cleanUserId)
  ) {
    return {
      ok: false,
      error: "Enter a valid Discord User ID (15–22 digits).",
    };
  }
  if (
    (input.targetType === "guild" || input.targetType === "both") &&
    !/^\d{15,22}$/.test(cleanGuildId)
  ) {
    return {
      ok: false,
      error: "Enter a valid Discord Guild / Server ID (15–22 digits).",
    };
  }

  const plan = PREMIUM_PLANS.find((p) => p.id === input.tier);
  if (!plan) {
    return { ok: false, error: "Invalid Premium tier selected." };
  }

  // Resolve duration
  let isLifetime = false;
  let durationMs: number | null = 30 * 86_400_000;
  let durationLabel = "1 Month (30 Days)";

  if (input.durationPreset === "lifetime") {
    isLifetime = true;
    durationMs = null;
    durationLabel = "Lifetime";
  } else if (input.durationPreset === "custom") {
    const unit: CustomTimeUnit = [
      "minutes",
      "hours",
      "days",
      "months",
      "years",
    ].includes(input.customUnit as string)
      ? (input.customUnit as CustomTimeUnit)
      : "days";
    const resolved = customTimeToMs(Number(input.customAmount) || 30, unit);
    durationMs = resolved.ms;
    durationLabel = resolved.label;
  } else {
    const preset = DURATION_PRESETS.find((d) => d.id === input.durationPreset);
    if (preset) {
      isLifetime = Boolean(preset.isLifetime);
      durationMs = preset.ms;
      durationLabel = preset.label;
    }
  }

  const siteCfg = await getSiteConfig();
  const now = Date.now();
  const startedAt = new Date(now).toISOString();
  const expiresAt =
    isLifetime || durationMs === null
      ? null
      : new Date(now + durationMs).toISOString();

  const id = `PRM-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  const basePerks = defaultPerksForTier(plan.id);
  const perks: PremiumPerks = {
    noPrefix:
      typeof input.perks?.noPrefix === "boolean"
        ? input.perks.noPrefix
        : basePerks.noPrefix,
    vanityGuard:
      typeof input.perks?.vanityGuard === "boolean"
        ? input.perks.vanityGuard
        : basePerks.vanityGuard,
    antiBetray:
      typeof input.perks?.antiBetray === "boolean"
        ? input.perks.antiBetray
        : basePerks.antiBetray,
    customBot:
      typeof input.perks?.customBot === "boolean"
        ? input.perks.customBot
        : basePerks.customBot,
    prioritySupport:
      typeof input.perks?.prioritySupport === "boolean"
        ? input.perks.prioritySupport
        : basePerks.prioritySupport,
  };

  const currencyCode = (
    input.currencyCode ||
    siteCfg.currencyCode ||
    "INR"
  )
    .trim()
    .slice(0, 8)
    .toUpperCase();

  const currencySymbol =
    currencyCode === "FREE"
      ? ""
      : (input.currencySymbol || siteCfg.currencySymbol || "₹")
          .trim()
          .slice(0, 6);

  const safePrice =
    currencyCode === "FREE"
      ? 0
      : Math.max(0, Math.min(9_999_999, Number(input.pricePaid) || 0));

  const useUser = input.targetType === "user" || input.targetType === "both";
  const useGuild = input.targetType === "guild" || input.targetType === "both";

  const record: PremiumRecord = {
    id,
    targetType: input.targetType,
    userId: useUser ? cleanUserId : null,
    username: useUser
      ? (input.username || "").trim().replace(/^@/, "").slice(0, 64) ||
        `user_${cleanUserId.slice(-4)}`
      : null,
    globalName: useUser
      ? (input.globalName || "").trim().slice(0, 64) || null
      : null,
    avatarUrl: useUser ? input.avatarUrl || null : null,
    guildId: useGuild ? cleanGuildId : null,
    guildName: useGuild
      ? (input.guildName || "").trim().slice(0, 100) ||
        `Server ${cleanGuildId.slice(-4)}`
      : null,
    tier: plan.id,
    tierName:
      (input.customTierName || "").trim().slice(0, 48) ||
      siteCfg.pricing[plan.id]?.name ||
      plan.name,
    durationLabel,
    durationMs,
    isLifetime,
    pricePaid: safePrice,
    currencyCode,
    currencySymbol,
    paymentMethod:
      (input.paymentMethod || "Support Ticket QR").trim().slice(0, 48),
    paymentReference:
      (input.paymentReference || "").trim().slice(0, 96) || null,
    invoiceId: (input.invoiceId || "").trim().slice(0, 40) || null,
    ticketId: (input.ticketId || "").trim().slice(0, 48) || null,
    grantedBy: (input.grantedBy || "Owner").trim().slice(0, 64),
    grantedById: input.grantedById,
    maxServers: Math.max(1, Math.min(50, Math.round(Number(input.maxServers) || 1))),
    perks,
    notes: (input.notes || "").trim().slice(0, 400) || null,
    startedAt,
    expiresAt,
    updatedAt: startedAt,
    status: "active",
    revokedAt: null,
    revokedBy: null,
    revokeReason: null,
  };

  await kvSet(recordKey(record.id), record);

  if (record.invoiceId) {
    await updateInvoiceStatus({
      invoiceId: record.invoiceId,
      status: "fulfilled",
      actor: record.grantedBy,
      linkedRecordId: record.id,
    });
  }

  await tryAssignDiscordPremiumRole(record.userId);
  return { ok: true, record };
}

export async function extendPremiumRecord(input: {
  id: string;
  addDays: number;
  actor: string;
}): Promise<PremiumRecord | null> {
  const existing = await getPremiumRecord(input.id);
  if (!existing) return null;

  const addMs = Math.max(1, Math.min(3650, Math.round(input.addDays))) * 86_400_000;
  const now = Date.now();
  const baseEnd =
    existing.expiresAt && Date.parse(existing.expiresAt) > now && existing.status === "active"
      ? Date.parse(existing.expiresAt)
      : now;
  const nextExpires = new Date(baseEnd + addMs).toISOString();

  const updated: PremiumRecord = {
    ...existing,
    isLifetime: false,
    status: "active",
    revokedAt: null,
    revokedBy: null,
    revokeReason: null,
    expiresAt: nextExpires,
    durationMs: (existing.durationMs || 0) + addMs,
    durationLabel: `${existing.durationLabel} (+${Math.round(input.addDays)}d)`,
    updatedAt: new Date(now).toISOString(),
    notes: existing.notes
      ? `${existing.notes} · Extended +${Math.round(input.addDays)}d by ${input.actor}`
      : `Extended +${Math.round(input.addDays)}d by ${input.actor}`,
  };

  await kvSet(recordKey(updated.id), updated);
  return updated;
}

export async function revokePremiumRecord(input: {
  id: string;
  actor: string;
  reason?: string | null;
}): Promise<PremiumRecord | null> {
  const existing = await getPremiumRecord(input.id);
  if (!existing) return null;
  const nowIso = new Date().toISOString();
  const updated: PremiumRecord = {
    ...existing,
    status: "revoked",
    revokedAt: nowIso,
    revokedBy: input.actor,
    revokeReason: (input.reason || "").trim().slice(0, 200) || null,
    updatedAt: nowIso,
  };
  await kvSet(recordKey(updated.id), updated);
  return updated;
}

export async function deletePremiumRecord(id: string): Promise<boolean> {
  const existing = await getPremiumRecord(id);
  if (!existing) return false;
  await kvDelete(recordKey(id));
  return true;
}
