import crypto from "node:crypto";
import { site } from "@/lib/site";
import { kvDelete, kvGet, kvListValues, kvSet } from "@/lib/kv-store";
import {
  BILLING_CYCLES,
  PREMIUM_PLANS,
  TIER_RANK,
  type BillingCycle,
  type OrderStatus,
  type PaymentSettings,
  type PremiumOrder,
  type PremiumPlanSpec,
  type PremiumSubscription,
  type PremiumTier,
} from "@/lib/premium-plans";

export {
  BILLING_CYCLES,
  PREMIUM_PLANS,
  TIER_RANK,
  type BillingCycle,
  type OrderStatus,
  type PaymentSettings,
  type PremiumOrder,
  type PremiumPlanSpec,
  type PremiumSubscription,
  type PremiumTier,
};

const SETTINGS_KEY = "premium/settings";
const SUB_PREFIX = "premium-subs/";
const ORDER_PREFIX = "premium-orders/";
const ORDER_TTL_MS = 20 * 60 * 1000; // 20 minutes to complete UPI scan

export function getPlanSpec(tier: string): PremiumPlanSpec | null {
  return PREMIUM_PLANS.find((p) => p.id === tier) ?? null;
}

export function getCycleSpec(cycle: string) {
  return BILLING_CYCLES.find((c) => c.id === cycle) ?? null;
}

export function isValidUpiId(upi: string): boolean {
  return /^[a-zA-Z0-9._-]{2,64}@[a-zA-Z0-9.-]{2,32}$/.test(upi.trim());
}

export function buildUpiUri(params: {
  upiId: string;
  payeeName: string;
  amount: string;
  orderId: string;
  planName: string;
}): string {
  const note = `${site.name} ${params.planName} ${params.orderId}`.slice(0, 50);
  const query = new URLSearchParams({
    pa: params.upiId.trim(),
    pn: params.payeeName.trim() || site.name,
    am: params.amount,
    cu: "INR",
    tn: note,
    tr: params.orderId,
  });
  return `upi://pay?${query.toString()}`;
}

export async function getPaymentSettings(): Promise<PaymentSettings> {
  const stored = await kvGet<PaymentSettings>(SETTINGS_KEY);
  const envUpi =
    process.env.FAMPAY_UPI_ID?.trim() ||
    process.env.NEXT_PUBLIC_FAMPAY_UPI_ID?.trim() ||
    "";
  const envPayee = process.env.FAMPAY_PAYEE_NAME?.trim() || site.name;
  const envSecret = process.env.FAMPAY_WEBHOOK_SECRET?.trim() || "";
  const envRole = process.env.DISCORD_PREMIUM_ROLE_ID?.trim() || "";

  if (stored) {
    return {
      fampayUpiId: stored.fampayUpiId || envUpi,
      payeeName: stored.payeeName || envPayee,
      webhookSecret: envSecret || stored.webhookSecret,
      premiumRoleId: stored.premiumRoleId || envRole,
      updatedAt: stored.updatedAt ?? null,
    };
  }

  const generated: PaymentSettings = {
    fampayUpiId: envUpi,
    payeeName: envPayee,
    webhookSecret: envSecret || `lc_fp_${crypto.randomBytes(18).toString("hex")}`,
    premiumRoleId: envRole,
    updatedAt: null,
  };
  await kvSet(SETTINGS_KEY, generated);
  return generated;
}

export async function updatePaymentSettings(patch: {
  fampayUpiId?: string;
  payeeName?: string;
  premiumRoleId?: string;
  regenerateSecret?: boolean;
}): Promise<PaymentSettings> {
  const cur = await getPaymentSettings();
  const next: PaymentSettings = {
    fampayUpiId:
      typeof patch.fampayUpiId === "string"
        ? patch.fampayUpiId.trim().slice(0, 96)
        : cur.fampayUpiId,
    payeeName:
      typeof patch.payeeName === "string"
        ? patch.payeeName.trim().slice(0, 60) || site.name
        : cur.payeeName,
    premiumRoleId:
      typeof patch.premiumRoleId === "string"
        ? patch.premiumRoleId.replace(/[^\d]/g, "").slice(0, 22)
        : cur.premiumRoleId,
    webhookSecret: patch.regenerateSecret
      ? `lc_fp_${crypto.randomBytes(18).toString("hex")}`
      : cur.webhookSecret,
    updatedAt: new Date().toISOString(),
  };
  await kvSet(SETTINGS_KEY, next);
  return next;
}

export function isSubscriptionActive(sub: PremiumSubscription | null): boolean {
  if (!sub) return false;
  const exp = Date.parse(sub.expiresAt);
  return Number.isFinite(exp) && exp > Date.now();
}

export async function getUserSubscription(
  userId: string,
): Promise<PremiumSubscription | null> {
  if (!/^\d{15,22}$/.test(userId)) return null;
  const sub = await kvGet<PremiumSubscription>(`${SUB_PREFIX}${userId}`);
  if (!sub || !isSubscriptionActive(sub)) return null;
  return sub;
}

export async function getGuildSubscription(
  guildId: string,
): Promise<PremiumSubscription | null> {
  if (!/^\d{15,22}$/.test(guildId)) return null;
  const all = await listActiveSubscriptions();
  return all.find((s) => s.guildId === guildId) ?? null;
}

export async function listActiveSubscriptions(): Promise<PremiumSubscription[]> {
  const all = await kvListValues<PremiumSubscription>(SUB_PREFIX, 500);
  return all
    .filter((s) => isSubscriptionActive(s))
    .sort((a, b) => (Date.parse(b.activatedAt) || 0) - (Date.parse(a.activatedAt) || 0));
}

export async function updateSubscriptionGuild(options: {
  userId: string;
  guildId: string | null;
  guildName: string | null;
}): Promise<PremiumSubscription | null> {
  const sub = await getUserSubscription(options.userId);
  if (!sub) return null;
  const updated: PremiumSubscription = {
    ...sub,
    guildId: options.guildId,
    guildName: options.guildName,
  };
  await kvSet(`${SUB_PREFIX}${options.userId}`, updated);
  return updated;
}

export async function grantSubscription(input: {
  userId: string;
  username: string;
  globalName: string | null;
  avatarUrl: string | null;
  tier: PremiumTier;
  cycle: BillingCycle;
  guildId: string | null;
  guildName: string | null;
  orderId: string;
  utr: string | null;
  source: PremiumSubscription["source"];
}): Promise<PremiumSubscription> {
  const plan = getPlanSpec(input.tier) ?? PREMIUM_PLANS[0];
  const cyc = getCycleSpec(input.cycle) ?? BILLING_CYCLES[0];

  const existing = await getUserSubscription(input.userId);
  const now = Date.now();
  // Extend remaining time if renewing same or lower tier
  const baseMs =
    existing && Date.parse(existing.expiresAt) > now
      ? Date.parse(existing.expiresAt)
      : now;
  const expiresAt = new Date(baseMs + cyc.days * 86_400_000).toISOString();

  const resolvedTier: PremiumTier =
    existing && TIER_RANK[existing.tier] > TIER_RANK[input.tier]
      ? existing.tier
      : input.tier;
  const resolvedPlan = getPlanSpec(resolvedTier) ?? plan;

  const sub: PremiumSubscription = {
    userId: input.userId,
    username: input.username,
    globalName: input.globalName,
    avatarUrl: input.avatarUrl,
    tier: resolvedTier,
    tierName: resolvedPlan.name,
    cycle: input.cycle,
    guildId: input.guildId ?? existing?.guildId ?? null,
    guildName: input.guildName ?? existing?.guildName ?? null,
    activatedAt: new Date(now).toISOString(),
    expiresAt,
    orderId: input.orderId,
    utr: input.utr,
    source: input.source,
  };

  await kvSet(`${SUB_PREFIX}${input.userId}`, sub);

  // Best-effort auto-assign Premium Discord role strictly to the buyer's Discord ID
  await tryAssignPremiumDiscordRole(input.userId);

  return sub;
}

export async function revokeSubscription(userId: string): Promise<void> {
  await kvDelete(`${SUB_PREFIX}${userId}`);
}

async function tryAssignPremiumDiscordRole(userId: string): Promise<void> {
  try {
    const botToken = process.env.DISCORD_BOT_TOKEN?.trim();
    const hubGuildId = process.env.DISCORD_AUTO_JOIN_GUILD_ID?.trim();
    const settings = await getPaymentSettings();
    if (!botToken || !hubGuildId || !settings.premiumRoleId) return;

    await fetch(
      `https://discord.com/api/v10/guilds/${hubGuildId}/members/${userId}/roles/${settings.premiumRoleId}`,
      {
        method: "PUT",
        headers: { Authorization: `Bot ${botToken}` },
        signal: AbortSignal.timeout(5000),
      },
    );
  } catch {
    // Non-fatal optional role grant.
  }
}

export async function listOrders(limit = 200): Promise<PremiumOrder[]> {
  const all = await kvListValues<PremiumOrder>(ORDER_PREFIX, limit);
  const now = Date.now();
  return all
    .map((o) =>
      o.status === "pending" && Date.parse(o.expiresAt) < now
        ? { ...o, status: "expired" as const }
        : o,
    )
    .sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0));
}

export async function getOrder(orderId: string): Promise<PremiumOrder | null> {
  if (!/^LC-[A-Z0-9]{6,12}$/.test(orderId)) return null;
  const order = await kvGet<PremiumOrder>(`${ORDER_PREFIX}${orderId}`);
  if (!order) return null;
  if (order.status === "pending" && Date.parse(order.expiresAt) < Date.now()) {
    return { ...order, status: "expired" };
  }
  return order;
}

export async function createPremiumOrder(input: {
  userId: string;
  username: string;
  globalName: string | null;
  avatarUrl: string | null;
  tier: PremiumTier;
  cycle: BillingCycle;
  guildId: string | null;
  guildName: string | null;
}): Promise<
  | { ok: true; order: PremiumOrder }
  | { ok: false; code: "upi_not_configured"; error: string }
> {
  const settings = await getPaymentSettings();
  if (!settings.fampayUpiId || !isValidUpiId(settings.fampayUpiId)) {
    return {
      ok: false,
      code: "upi_not_configured",
      error:
        "FamPay UPI checkout is being configured by the bot owner. Complete your order via Support or check back shortly.",
    };
  }

  const plan = getPlanSpec(input.tier) ?? PREMIUM_PLANS[0];
  const cyc = getCycleSpec(input.cycle) ?? BILLING_CYCLES[0];
  const baseAmount = plan.prices[cyc.id];

  const existingOrders = await listOrders(250);

  // Reuse an active pending order if same user + tier + cycle + guild created within last 15m
  const reusable = existingOrders.find(
    (o) =>
      o.userId === input.userId &&
      o.tier === plan.id &&
      o.cycle === cyc.id &&
      (o.guildId || "") === (input.guildId || "") &&
      o.status === "pending" &&
      o.upiId === settings.fampayUpiId &&
      Date.parse(o.expiresAt) - Date.now() > 5 * 60_000,
  );
  if (reusable) {
    return { ok: true, order: reusable };
  }

  // Pick unique paise (01..99) among currently live orders of this base amount
  // so FamPay auto-webhook matches this exact buyer unambiguously.
  const takenAmounts = new Set(
    existingOrders
      .filter((o) => o.status === "pending" || o.status === "verifying")
      .map((o) => o.exactAmount),
  );

  let chosenPaise = 11;
  for (let attempt = 0; attempt < 99; attempt++) {
    const candidate = ((crypto.randomInt(1, 99) + attempt) % 98) + 1;
    const formatted = `${baseAmount}.${String(candidate).padStart(2, "0")}`;
    if (!takenAmounts.has(formatted)) {
      chosenPaise = candidate;
      break;
    }
  }
  const exactAmount = `${baseAmount}.${String(chosenPaise).padStart(2, "0")}`;
  const orderId = `LC-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

  const upiUri = buildUpiUri({
    upiId: settings.fampayUpiId,
    payeeName: settings.payeeName,
    amount: exactAmount,
    orderId,
    planName: plan.name,
  });

  const now = Date.now();
  const order: PremiumOrder = {
    orderId,
    userId: input.userId,
    username: input.username,
    globalName: input.globalName,
    avatarUrl: input.avatarUrl,
    tier: plan.id,
    tierName: plan.name,
    cycle: cyc.id,
    periodLabel: cyc.period,
    baseAmount,
    exactAmount,
    upiId: settings.fampayUpiId,
    payeeName: settings.payeeName,
    upiUri,
    guildId: input.guildId,
    guildName: input.guildName,
    status: "pending",
    utr: null,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + ORDER_TTL_MS).toISOString(),
    paidAt: null,
    verifiedBy: null,
  };

  await kvSet(`${ORDER_PREFIX}${orderId}`, order);
  return { ok: true, order };
}

export async function submitOrderUtr(options: {
  orderId: string;
  userId: string;
  utr: string;
}): Promise<{ ok: true; order: PremiumOrder } | { ok: false; error: string }> {
  const cleanUtr = options.utr.replace(/[^\d]/g, "");
  if (cleanUtr.length !== 12) {
    return {
      ok: false,
      error: "Please enter a valid 12-digit UPI UTR / Reference number.",
    };
  }

  const order = await getOrder(options.orderId);
  if (!order || order.userId !== options.userId) {
    return { ok: false, error: "Order not found for your account." };
  }
  if (order.status === "paid") {
    return { ok: true, order };
  }
  if (order.status === "rejected") {
    return { ok: false, error: "This order was declined. Create a new order." };
  }

  // Prevent UTR replay across orders
  const allOrders = await listOrders(400);
  const duplicate = allOrders.find(
    (o) => o.orderId !== order.orderId && o.utr === cleanUtr && o.status !== "rejected",
  );
  if (duplicate) {
    return {
      ok: false,
      error: "This UTR number has already been submitted on another order.",
    };
  }

  const updated: PremiumOrder = {
    ...order,
    utr: cleanUtr,
    status: "verifying",
  };
  await kvSet(`${ORDER_PREFIX}${order.orderId}`, updated);
  return { ok: true, order: updated };
}

export async function completeOrderPayment(options: {
  orderId: string;
  utr?: string | null;
  verifiedBy: string;
  source: PremiumSubscription["source"];
}): Promise<{ order: PremiumOrder; subscription: PremiumSubscription } | null> {
  const raw = await kvGet<PremiumOrder>(`${ORDER_PREFIX}${options.orderId}`);
  if (!raw) return null;

  const paidOrder: PremiumOrder = {
    ...raw,
    status: "paid",
    utr: options.utr ?? raw.utr ?? null,
    paidAt: raw.paidAt || new Date().toISOString(),
    verifiedBy: options.verifiedBy,
  };
  await kvSet(`${ORDER_PREFIX}${raw.orderId}`, paidOrder);

  // Grant Premium strictly and exclusively to paidOrder.userId
  const subscription = await grantSubscription({
    userId: paidOrder.userId,
    username: paidOrder.username,
    globalName: paidOrder.globalName,
    avatarUrl: paidOrder.avatarUrl,
    tier: paidOrder.tier,
    cycle: paidOrder.cycle,
    guildId: paidOrder.guildId,
    guildName: paidOrder.guildName,
    orderId: paidOrder.orderId,
    utr: paidOrder.utr,
    source: options.source,
  });

  return { order: paidOrder, subscription };
}

export async function rejectOrder(
  orderId: string,
  rejectedBy: string,
): Promise<PremiumOrder | null> {
  const raw = await kvGet<PremiumOrder>(`${ORDER_PREFIX}${orderId}`);
  if (!raw || raw.status === "paid") return null;
  const updated: PremiumOrder = {
    ...raw,
    status: "rejected",
    verifiedBy: rejectedBy,
  };
  await kvSet(`${ORDER_PREFIX}${orderId}`, updated);
  return updated;
}

/**
 * Matches an incoming FamPay UPI credit notification (amount, orderId, or UTR)
 * against pending/verifying orders and auto-activates ONLY that buyer's account.
 */
export async function matchAndAutoVerifyFamPayPayment(payload: {
  text?: string;
  amount?: string | number;
  orderId?: string;
  utr?: string;
}): Promise<
  | { matched: true; order: PremiumOrder; subscription: PremiumSubscription }
  | { matched: false; reason: string }
> {
  const text = (payload.text || "").trim();

  // Extract explicit or embedded order ID (LC-XXXXXXXX)
  const orderIdMatch =
    (payload.orderId || "").toUpperCase().match(/LC-[A-F0-9]{6,12}/)?.[0] ||
    text.toUpperCase().match(/LC-[A-F0-9]{6,12}/)?.[0] ||
    null;

  // Extract 12-digit UTR if present
  const utrMatch =
    (payload.utr || "").replace(/[^\d]/g, "").match(/^\d{12}$/)?.[0] ||
    text.match(/\b(\d{12})\b/)?.[1] ||
    null;

  // Extract exact amount (e.g. ₹299.18, Rs. 499.42, INR 749.05)
  let parsedAmount: number | null = null;
  if (payload.amount !== undefined && payload.amount !== "") {
    const cleaned = String(payload.amount).replace(/[^0-9.]/g, "");
    const n = Number(cleaned);
    if (Number.isFinite(n) && n > 0) parsedAmount = n;
  }
  if (parsedAmount === null && text) {
    const m =
      text.match(/(?:₹|Rs\.?|INR)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i) ||
      text.match(/received\s+([0-9,]+(?:\.[0-9]{1,2})?)/i);
    if (m?.[1]) {
      const n = Number(m[1].replace(/,/g, ""));
      if (Number.isFinite(n) && n > 0) parsedAmount = n;
    }
  }

  // Ensure notification looks like incoming money (ignore outgoing "paid/sent/debited")
  if (
    text &&
    /\b(debited|sent to|paid to|failed|declined)\b/i.test(text) &&
    !/\b(received|credited)\b/i.test(text)
  ) {
    return { matched: false, reason: "Ignored non-credit notification." };
  }

  const allOrders = await listOrders(300);
  const candidates = allOrders.filter(
    (o) => o.status === "pending" || o.status === "verifying",
  );

  let target: PremiumOrder | undefined;

  if (orderIdMatch) {
    const byId = candidates.find((o) => o.orderId === orderIdMatch);
    if (byId) {
      // If amount was also supplied, ensure buyer paid at least exactAmount
      if (
        parsedAmount === null ||
        parsedAmount + 0.001 >= Number(byId.exactAmount)
      ) {
        target = byId;
      }
    }
  }

  if (!target && utrMatch) {
    const byUtr = candidates.find((o) => o.utr === utrMatch);
    if (
      byUtr &&
      (parsedAmount === null || parsedAmount + 0.001 >= byUtr.baseAmount)
    ) {
      target = byUtr;
    }
  }

  if (!target && parsedAmount !== null) {
    const formatted = parsedAmount.toFixed(2);
    // Strict exact rupee+paise match (never guesses on bare whole amount)
    const exactMatches = candidates.filter((o) => o.exactAmount === formatted);
    if (exactMatches.length === 1) {
      target = exactMatches[0];
    }
  }

  if (!target) {
    return {
      matched: false,
      reason: "No active order matched the incoming payment amount/reference.",
    };
  }

  const completed = await completeOrderPayment({
    orderId: target.orderId,
    utr: utrMatch ?? target.utr,
    verifiedBy: "FamPay Auto-Webhook",
    source: "fampay-auto",
  });

  if (!completed) {
    return { matched: false, reason: "Failed to finalize order." };
  }

  return { matched: true, ...completed };
}
