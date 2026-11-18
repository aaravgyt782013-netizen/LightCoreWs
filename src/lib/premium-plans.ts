export type PremiumTier = "plus" | "pro" | "ultra";
export type BillingCycle = "1m" | "3m" | "1y";

export type PremiumPlanSpec = {
  id: PremiumTier;
  name: string;
  badge: string;
  tagline: string;
  featured?: boolean;
  prices: Record<BillingCycle, number>;
  features: string[];
};

export const BILLING_CYCLES: {
  id: BillingCycle;
  label: string;
  period: string;
  days: number;
  save?: string;
}[] = [
  { id: "1m", label: "1 Month", period: "1 Month", days: 30 },
  {
    id: "3m",
    label: "3 Months",
    period: "3 Months",
    days: 90,
    save: "Save 10%",
  },
  { id: "1y", label: "1 Year", period: "1 Year", days: 365, save: "Save 25%" },
];

export const PREMIUM_PLANS: PremiumPlanSpec[] = [
  {
    id: "plus",
    name: "Plus Plan",
    badge: "Popular",
    tagline:
      "Essential high-speed protection upgrades for growing communities.",
    prices: { "1m": 299, "3m": 799, "1y": 2699 },
    features: [
      "Limit System (advanced security)",
      "Automod (Anti Token Spam)",
      "Secure Channel Protection",
      "Anti Betray System",
      "AntiBetray Mode",
      "24/7 Support",
    ],
  },
  {
    id: "pro",
    name: "Pro Plan",
    badge: "Best Value",
    tagline:
      "Complete anti-nuke & vanity shield with no-prefix access and pro giveaways.",
    featured: true,
    prices: { "1m": 499, "3m": 1349, "1y": 4499 },
    features: [
      "Limit System (advanced security)",
      "Automod (Anti Token Spam)",
      "Secure Channel Protection",
      "Anti Betray System",
      "AntiBetray Mode",
      "Vanity Protection",
      "No-Prefix Access",
      "Advanced Giveaway System",
    ],
  },
  {
    id: "ultra",
    name: "Ultra Pro",
    badge: "Premium",
    tagline:
      "Your own custom branded LightCore instance on isolated 24/7 hosting.",
    prices: { "1m": 749, "3m": 1999, "1y": 6749 },
    features: [
      "Limit System (advanced security)",
      "Automod (Anti Token Spam)",
      "Secure Channel Protection",
      "Anti Betray System",
      "Auto Emergency Mode",
      "Vanity Protection",
      "Custom Branded Bot",
      "Dedicated 24/7 Hosting",
    ],
  },
];

export const TIER_RANK: Record<PremiumTier, number> = {
  plus: 1,
  pro: 2,
  ultra: 3,
};

export const DURATION_PRESETS: {
  id: string;
  label: string;
  ms: number | null;
  isLifetime?: boolean;
}[] = [
  { id: "1d", label: "1 Day (24 Hours)", ms: 1 * 86_400_000 },
  { id: "3d", label: "3 Days (Trial)", ms: 3 * 86_400_000 },
  { id: "7d", label: "7 Days (1 Week)", ms: 7 * 86_400_000 },
  { id: "15d", label: "15 Days", ms: 15 * 86_400_000 },
  { id: "30d", label: "1 Month (30 Days)", ms: 30 * 86_400_000 },
  { id: "90d", label: "3 Months (90 Days)", ms: 90 * 86_400_000 },
  { id: "180d", label: "6 Months (180 Days)", ms: 180 * 86_400_000 },
  { id: "365d", label: "1 Year (365 Days)", ms: 365 * 86_400_000 },
  { id: "lifetime", label: "Lifetime (Never Expires)", ms: null, isLifetime: true },
  { id: "custom", label: "Custom Time…", ms: 0 },
];

export type CustomTimeUnit = "minutes" | "hours" | "days" | "months" | "years";

export function customTimeToMs(amount: number, unit: CustomTimeUnit): {
  ms: number;
  label: string;
} {
  const n = Math.max(1, Math.min(10_000, Math.round(amount)));
  const mult: Record<CustomTimeUnit, number> = {
    minutes: 60_000,
    hours: 3_600_000,
    days: 86_400_000,
    months: 30 * 86_400_000,
    years: 365 * 86_400_000,
  };
  const singular = n === 1 ? unit.slice(0, -1) : unit;
  const cap = singular.charAt(0).toUpperCase() + singular.slice(1);
  return { ms: n * mult[unit], label: `${n} ${cap}` };
}

export type PremiumTargetType = "user" | "guild" | "both";

export type PremiumPerks = {
  noPrefix: boolean;
  vanityGuard: boolean;
  antiBetray: boolean;
  customBot: boolean;
  prioritySupport: boolean;
};

export function defaultPerksForTier(tier: PremiumTier): PremiumPerks {
  return {
    noPrefix: tier === "pro" || tier === "ultra",
    vanityGuard: tier === "pro" || tier === "ultra",
    antiBetray: true,
    customBot: tier === "ultra",
    prioritySupport: true,
  };
}

export type PremiumRecord = {
  id: string;
  targetType: PremiumTargetType;
  userId: string | null;
  username: string | null;
  globalName: string | null;
  avatarUrl: string | null;
  guildId: string | null;
  guildName: string | null;
  tier: PremiumTier;
  tierName: string;
  durationLabel: string;
  durationMs: number | null;
  isLifetime: boolean;
  pricePaid: number;
  currencyCode: string;
  currencySymbol: string;
  paymentMethod: string;
  paymentReference: string | null;
  invoiceId: string | null;
  ticketId: string | null;
  grantedBy: string;
  grantedById: string;
  maxServers: number;
  perks: PremiumPerks;
  notes: string | null;
  startedAt: string;
  expiresAt: string | null;
  updatedAt: string;
  status: "active" | "revoked";
  revokedAt: string | null;
  revokedBy: string | null;
  revokeReason: string | null;
};

/** Backwards-compatible summary returned to user dashboard & /premium */
export type PremiumSubscription = {
  id: string;
  targetType: PremiumTargetType;
  userId: string;
  username: string;
  globalName: string | null;
  avatarUrl: string | null;
  tier: PremiumTier;
  tierName: string;
  durationLabel: string;
  isLifetime: boolean;
  guildId: string | null;
  guildName: string | null;
  activatedAt: string;
  expiresAt: string | null;
  invoiceId: string | null;
  grantedBy: string;
  pricePaid: number;
  currencySymbol: string;
  maxServers: number;
  perks: PremiumPerks;
};

export type InvoiceStatus = "pending_ticket" | "fulfilled" | "cancelled";

export type PremiumInvoice = {
  invoiceId: string;
  verificationCode: string;
  createdAt: string;
  userId: string;
  username: string;
  globalName: string | null;
  avatarUrl: string | null;
  email: string | null;
  guildId: string | null;
  guildName: string | null;
  tier: PremiumTier;
  tierName: string;
  tierBadge: string;
  features: string[];
  cycle: BillingCycle;
  durationLabel: string;
  durationDays: number;
  amount: number;
  currencySymbol: string;
  currencyCode: string;
  paymentMethod: string;
  activationSla: string;
  supportUrl: string;
  brandName: string;
  buyerNote: string | null;
  status: InvoiceStatus;
  fulfilledAt: string | null;
  fulfilledBy: string | null;
  linkedRecordId: string | null;
};

export type RuntimePremiumState =
  | "lifetime"
  | "active"
  | "expiring"
  | "expired"
  | "revoked";

export type CountdownBreakdown = {
  state: RuntimePremiumState;
  remainingMs: number;
  elapsedMs: number;
  progressPct: number; // 0..100 remaining
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  compact: string;
  digital: string;
};

export function computeLiveCountdown(
  rec: Pick<
    PremiumRecord,
    "status" | "isLifetime" | "startedAt" | "expiresAt" | "durationMs"
  >,
  nowMs: number,
): CountdownBreakdown {
  const startMs = Date.parse(rec.startedAt) || nowMs;
  const elapsedMs = Math.max(0, nowMs - startMs);

  if (rec.status === "revoked") {
    return {
      state: "revoked",
      remainingMs: 0,
      elapsedMs,
      progressPct: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      compact: "Revoked",
      digital: "00 : 00 : 00 : 00",
    };
  }

  if (rec.isLifetime || !rec.expiresAt) {
    return {
      state: "lifetime",
      remainingMs: Number.POSITIVE_INFINITY,
      elapsedMs,
      progressPct: 100,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      compact: "∞ Lifetime",
      digital: "∞ LIFETIME",
    };
  }

  const endMs = Date.parse(rec.expiresAt) || nowMs;
  const remainingMs = Math.max(0, endMs - nowMs);
  const totalSpan = Math.max(1, endMs - startMs, rec.durationMs || 0);
  const progressPct = Math.max(
    0,
    Math.min(100, (remainingMs / totalSpan) * 100),
  );

  if (remainingMs <= 0) {
    return {
      state: "expired",
      remainingMs: 0,
      elapsedMs,
      progressPct: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      compact: "Expired",
      digital: "00 : 00 : 00 : 00",
    };
  }

  const totalSec = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  const state: RuntimePremiumState =
    remainingMs <= 3 * 86_400_000 ? "expiring" : "active";

  const compact =
    days > 0
      ? `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`
      : `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;

  const digital = `${pad(days)}d : ${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s`;

  return {
    state,
    remainingMs,
    elapsedMs,
    progressPct,
    days,
    hours,
    minutes,
    seconds,
    compact,
    digital,
  };
}
