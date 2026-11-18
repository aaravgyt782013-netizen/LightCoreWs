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

export type PaymentSettings = {
  fampayUpiId: string;
  payeeName: string;
  webhookSecret: string;
  premiumRoleId: string;
  updatedAt: string | null;
};

export type PremiumSubscription = {
  userId: string;
  username: string;
  globalName: string | null;
  avatarUrl: string | null;
  tier: PremiumTier;
  tierName: string;
  cycle: BillingCycle;
  guildId: string | null;
  guildName: string | null;
  activatedAt: string;
  expiresAt: string;
  orderId: string;
  utr: string | null;
  source: "fampay-auto" | "utr-approved" | "owner-grant";
};

export type OrderStatus =
  | "pending"
  | "verifying"
  | "paid"
  | "rejected"
  | "expired";

export type PremiumOrder = {
  orderId: string;
  userId: string;
  username: string;
  globalName: string | null;
  avatarUrl: string | null;
  tier: PremiumTier;
  tierName: string;
  cycle: BillingCycle;
  periodLabel: string;
  baseAmount: number;
  exactAmount: string;
  upiId: string;
  payeeName: string;
  upiUri: string;
  guildId: string | null;
  guildName: string | null;
  status: OrderStatus;
  utr: string | null;
  createdAt: string;
  expiresAt: string;
  paidAt: string | null;
  verifiedBy: string | null;
};
