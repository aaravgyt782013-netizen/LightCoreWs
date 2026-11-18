"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { site } from "@/lib/site";
import {
  ArrowRight,
  BoltIcon,
  CheckIcon,
  ChevronLeftIcon,
  CrownIcon,
  DiscordIcon,
  ShieldIcon,
} from "@/components/ui/Icons";

type BillingCycle = "1m" | "3m" | "1y";

type Plan = {
  id: "plus" | "pro" | "ultra";
  name: string;
  badge: string;
  tagline: string;
  featured?: boolean;
  accent: "crimson" | "gold" | "royal";
  prices: Record<BillingCycle, number>;
  features: string[];
};

const BILLING_OPTIONS: {
  id: BillingCycle;
  label: string;
  period: string;
  save?: string;
}[] = [
  { id: "1m", label: "1 Month", period: "1 Month" },
  { id: "3m", label: "3 Months", period: "3 Months", save: "Save 10%" },
  { id: "1y", label: "1 Year", period: "1 Year", save: "Save 25%" },
];

const PLANS: Plan[] = [
  {
    id: "plus",
    name: "Plus Plan",
    badge: "Popular",
    tagline: "Essential high-speed protection upgrades for growing servers.",
    accent: "crimson",
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
      "Full anti-nuke & vanity protection with no-prefix access and pro giveaways.",
    featured: true,
    accent: "gold",
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
      "Your own custom branded LightCore instance on dedicated 24/7 infrastructure.",
    accent: "royal",
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

const COMPARISON_ROWS: {
  feature: string;
  plus: boolean;
  pro: boolean;
  ultra: boolean;
}[] = [
  { feature: "Limit System (advanced security)", plus: true, pro: true, ultra: true },
  { feature: "Automod (Anti Token Spam)", plus: true, pro: true, ultra: true },
  { feature: "Secure Channel Protection", plus: true, pro: true, ultra: true },
  { feature: "Anti Betray System & Mode", plus: true, pro: true, ultra: true },
  { feature: "Priority 24/7 Support", plus: true, pro: true, ultra: true },
  { feature: "Vanity URL Protection", plus: false, pro: true, ultra: true },
  { feature: "No-Prefix Command Access", plus: false, pro: true, ultra: true },
  { feature: "Advanced Giveaway System", plus: false, pro: true, ultra: true },
  { feature: "Auto Emergency Raid Mode", plus: false, pro: false, ultra: true },
  { feature: "Custom Branded Bot (Avatar, Name & Bio)", plus: false, pro: false, ultra: true },
  { feature: "Dedicated 24/7 Isolated Hosting", plus: false, pro: false, ultra: true },
];

const PREMIUM_FAQS = [
  {
    q: "How fast is Premium activated on my server?",
    a: `Instant once verified! Click Buy Now on your plan, copy your order summary, and open a billing ticket in the ${site.name} Support Server. Staff activates your server ID and perks within minutes.`,
  },
  {
    q: "Can I transfer Premium to a different Discord server later?",
    a: "Yes. Pro and Ultra Pro subscribers can transfer their active server slot by contacting 24/7 Support with their registered Discord account.",
  },
  {
    q: "What is included in Ultra Pro's Custom Branded Bot?",
    a: `You get a private, dedicated 24/7 bot instance running the entire ${site.name} engine under your own community's custom bot name, avatar, banner, and status.`,
  },
  {
    q: "Which payment methods are supported?",
    a: "UPI (GPay, PhonePe, Paytm, FamPay), NetBanking, Cards, and international methods are supported directly through our official Discord billing desk.",
  },
];

type SimpleGuild = { id: string; name: string };
type SimpleUser = { id: string; username: string; globalName: string | null };

const checkoutBase =
  process.env.NEXT_PUBLIC_PREMIUM_CHECKOUT_URL?.trim() || site.discord;

function PremiumQuerySync({
  onParams,
}: {
  onParams: (guildId: string, guildName: string) => void;
}) {
  const searchParams = useSearchParams();
  const g = searchParams.get("guild") || "";
  const n = searchParams.get("name") || "";

  useEffect(() => {
    onParams(g, n);
  }, [g, n, onParams]);

  return null;
}

export function PremiumClient() {
  const [initialGuildId, setInitialGuildId] = useState("");
  const [initialGuildName, setInitialGuildName] = useState("");

  const [cycle, setCycle] = useState<BillingCycle>("1m");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [guilds, setGuilds] = useState<SimpleGuild[]>([]);
  const [targetGuildId, setTargetGuildId] = useState("");
  const [copied, setCopied] = useState(false);

  const handleQueryParams = useCallback((g: string, n: string) => {
    setInitialGuildId(g);
    setInitialGuildName(n);
    if (g) {
      setTargetGuildId((cur) => cur || g);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const loadMe = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok || !active) return;
        const json = (await res.json()) as {
          authenticated?: boolean;
          user?: SimpleUser;
          guilds?: SimpleGuild[];
        };
        if (!active || !json.authenticated) return;
        if (json.user) setUser(json.user);
        if (Array.isArray(json.guilds)) {
          setGuilds(json.guilds);
          setTargetGuildId((cur) => cur || json.guilds?.[0]?.id || "");
        }
      } catch {
        // Optional personalization for logged-in users.
      }
    };
    void loadMe();
    return () => {
      active = false;
    };
  }, []);

  const activeCycleMeta =
    BILLING_OPTIONS.find((b) => b.id === cycle) ?? BILLING_OPTIONS[0];

  const selectedGuildName = useMemo(() => {
    const found = guilds.find((g) => g.id === targetGuildId);
    if (found) return found.name;
    if (targetGuildId && targetGuildId === initialGuildId && initialGuildName) {
      return initialGuildName;
    }
    return "";
  }, [guilds, targetGuildId, initialGuildId, initialGuildName]);

  const orderSummary = useMemo(() => {
    if (!selectedPlan) return "";
    const price = selectedPlan.prices[cycle];
    const lines = [
      `${site.name} Premium Order`,
      `Plan: ${selectedPlan.name} (${selectedPlan.badge})`,
      `Duration: ${activeCycleMeta.period}`,
      `Amount: ₹${price.toLocaleString("en-IN")}`,
      user
        ? `User: @${user.username} (${user.id})`
        : "User: (your Discord tag)",
      targetGuildId
        ? `Server: ${selectedGuildName ? `${selectedGuildName} ` : ""}(${targetGuildId})`
        : "Server ID: (paste server ID)",
    ];
    return lines.join("\n");
  }, [selectedPlan, cycle, activeCycleMeta, user, targetGuildId, selectedGuildName]);

  const handleCopyOrder = async () => {
    if (!orderSummary) return;
    try {
      await navigator.clipboard.writeText(orderSummary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const buildCheckoutHref = (plan: Plan) => {
    if (checkoutBase === site.discord) return site.discord;
    try {
      const u = new URL(checkoutBase);
      u.searchParams.set("plan", plan.id);
      u.searchParams.set("cycle", cycle);
      if (targetGuildId) u.searchParams.set("guild", targetGuildId);
      return u.toString();
    } catch {
      return checkoutBase;
    }
  };

  return (
    <div className="space-y-16">
      <Suspense fallback={null}>
        <PremiumQuerySync onParams={handleQueryParams} />
      </Suspense>

      {/* Hero Header */}
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-5 flex items-center justify-center gap-3">
          <Link
            href={
              initialGuildId ? `/dashboard/${initialGuildId}` : "/dashboard"
            }
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400 transition-colors hover:border-white/25 hover:text-white"
          >
            <ChevronLeftIcon className="size-3" />
            {initialGuildName
              ? `Back to ${initialGuildName}`
              : "Back to Dashboard"}
          </Link>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/35 bg-amber-500/10 px-4 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.28em] text-amber-300">
          <CrownIcon className="size-3.5" />
          {site.name} Premium
        </div>

        <h1 className="mt-5 font-display text-[36px] font-bold leading-[1.06] tracking-tight text-white sm:text-[52px]">
          Unleash Maximum{" "}
          <span className="text-gradient-brand">Server Protection</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-zinc-400">
          Supercharge your community with {site.name}&apos;s advanced Limit
          System, Anti-Token Spam, Anti-Betray Mode, Vanity Guard, No-Prefix
          access, and your own Custom Branded Bot.
        </p>

        {initialGuildName && (
          <p className="mt-4 inline-flex items-center gap-2 rounded-xl border border-brand-500/30 bg-brand-950/35 px-4 py-2 font-mono text-[11px] text-brand-200">
            <ShieldIcon className="size-3.5 text-brand-400" />
            Upgrading server:{" "}
            <strong className="text-white">{initialGuildName}</strong>
          </p>
        )}

        {/* Billing Duration Switcher */}
        <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-ink-900/90 p-1.5 shadow-panel">
          {BILLING_OPTIONS.map((opt) => {
            const active = cycle === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setCycle(opt.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold transition-all ${
                  active
                    ? "bg-brand-600 text-white shadow-[0_6px_22px_-6px_rgba(239,16,16,0.85)]"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <span>{opt.label}</span>
                {opt.save && (
                  <span
                    className={`rounded-md px-1.5 py-0.5 font-mono text-[9px] uppercase ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-amber-500/15 text-amber-300"
                    }`}
                  >
                    {opt.save}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3 Pricing Cards (Zynrax-inspired) */}
      <div className="grid items-stretch gap-6 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const price = plan.prices[cycle];
          const isFeatured = Boolean(plan.featured);
          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between overflow-hidden rounded-3xl border p-7 transition-all duration-300 sm:p-8 ${
                isFeatured
                  ? "border-brand-500/60 bg-gradient-to-b from-brand-950/55 via-ink-900 to-ink-950 shadow-[0_0_0_1px_rgba(255,43,43,0.3),0_28px_80px_-20px_rgba(239,16,16,0.5)] lg:-translate-y-2"
                  : plan.id === "ultra"
                    ? "border-amber-400/30 bg-gradient-to-b from-amber-950/25 via-ink-900/90 to-ink-950 shadow-panel hover:border-amber-400/55"
                    : "border-white/10 bg-ink-900/80 shadow-panel hover:border-brand-500/40"
              }`}
            >
              {/* Top glow */}
              <div
                aria-hidden
                className={`pointer-events-none absolute -top-24 left-1/2 size-64 -translate-x-1/2 rounded-full blur-2xl ${
                  isFeatured
                    ? "bg-[radial-gradient(closest-side,rgba(239,16,16,0.28),transparent)]"
                    : plan.id === "ultra"
                      ? "bg-[radial-gradient(closest-side,rgba(245,158,11,0.2),transparent)]"
                      : "bg-[radial-gradient(closest-side,rgba(239,16,16,0.14),transparent)]"
                }`}
              />

              <div className="relative">
                {/* Plan Title + Badge */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`flex size-9 items-center justify-center rounded-xl border ${
                        plan.id === "ultra"
                          ? "border-amber-400/35 bg-amber-500/15 text-amber-300"
                          : "border-brand-500/35 bg-brand-600/15 text-brand-400"
                      }`}
                    >
                      {plan.id === "plus" ? (
                        <ShieldIcon className="size-4" />
                      ) : plan.id === "pro" ? (
                        <BoltIcon className="size-4" />
                      ) : (
                        <CrownIcon className="size-4" />
                      )}
                    </span>
                    <h2 className="font-display text-[21px] font-bold tracking-tight text-white">
                      {plan.name}
                    </h2>
                  </div>

                  <span
                    className={`rounded-full border px-3 py-1 font-mono text-[9.5px] font-medium uppercase tracking-[0.18em] ${
                      isFeatured
                        ? "border-brand-400/50 bg-brand-600 text-white shadow-[0_0_20px_-4px_#ff2b2b]"
                        : plan.id === "ultra"
                          ? "border-amber-400/40 bg-amber-500/15 text-amber-300"
                          : "border-white/15 bg-white/[0.06] text-zinc-200"
                    }`}
                  >
                    {plan.badge}
                  </span>
                </div>

                <p className="mt-3 text-[13px] leading-relaxed text-zinc-400">
                  {plan.tagline}
                </p>

                {/* Price */}
                <div className="mt-6 flex items-baseline gap-2 border-y border-white/[0.08] py-5">
                  <span className="font-display text-[44px] font-bold leading-none tracking-tight text-white">
                    ₹{price.toLocaleString("en-IN")}
                  </span>
                  <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-zinc-400">
                    / {activeCycleMeta.period}
                  </span>
                </div>

                {/* Feature Checklist */}
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feat) => (
                    <li
                      key={feat}
                      className="flex items-start gap-3 text-[13.5px] text-zinc-200"
                    >
                      <span
                        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${
                          plan.id === "ultra"
                            ? "bg-amber-500/15 text-amber-300"
                            : "bg-brand-600/20 text-brand-400"
                        }`}
                      >
                        <CheckIcon className="size-3" />
                      </span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Buy Now Button */}
              <button
                type="button"
                onClick={() => {
                  setCopied(false);
                  setSelectedPlan(plan);
                }}
                className={`group relative mt-8 inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl text-[14px] font-semibold transition-all ${
                  isFeatured
                    ? "btn-glow bg-brand-600 text-white shadow-[0_12px_34px_-10px_rgba(239,16,16,0.9)] hover:bg-brand-500"
                    : plan.id === "ultra"
                      ? "btn-glow bg-gradient-to-r from-amber-500 to-brand-600 text-white shadow-[0_12px_34px_-10px_rgba(245,158,11,0.55)] hover:brightness-110"
                      : "border border-brand-500/40 bg-brand-950/45 text-white hover:border-brand-500 hover:bg-brand-600"
                }`}
              >
                Buy Now
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Table */}
      <div className="panel panel-inner overflow-hidden rounded-3xl shadow-panel">
        <div className="border-b border-white/[0.07] px-6 py-5 sm:px-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-brand-400">
            Compare Tiers
          </p>
          <h2 className="mt-1 font-display text-[22px] font-semibold text-white">
            Full Feature Breakdown
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[580px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-white/[0.07] font-mono text-[10.5px] uppercase tracking-[0.18em] text-zinc-400">
                <th className="px-6 py-4 sm:px-8">Capability</th>
                <th className="px-4 py-4 text-center">Plus (₹299)</th>
                <th className="px-4 py-4 text-center text-brand-300">
                  Pro (₹499)
                </th>
                <th className="px-4 py-4 text-center text-amber-300">
                  Ultra Pro (₹749)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {COMPARISON_ROWS.map((row) => (
                <tr
                  key={row.feature}
                  className="transition-colors hover:bg-white/[0.015]"
                >
                  <td className="px-6 py-3.5 text-zinc-200 sm:px-8">
                    {row.feature}
                  </td>
                  {(["plus", "pro", "ultra"] as const).map((tier) => (
                    <td key={tier} className="px-4 py-3.5 text-center">
                      {row[tier] ? (
                        <span className="inline-flex size-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                          <CheckIcon className="size-3" />
                        </span>
                      ) : (
                        <span className="font-mono text-zinc-700">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Premium FAQ */}
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <p className="eyebrow">Billing &amp; Perks</p>
          <h2 className="mt-2 font-display text-[26px] font-semibold text-white">
            Premium FAQ
          </h2>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {PREMIUM_FAQS.map((item) => (
            <div
              key={item.q}
              className="panel panel-inner rounded-2xl p-5 sm:p-6"
            >
              <h3 className="font-display text-[15.5px] font-semibold text-white">
                {item.q}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Buy Now Checkout Modal */}
      {selectedPlan && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Purchase ${selectedPlan.name}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          onClick={() => setSelectedPlan(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="panel panel-inner relative w-full max-w-lg rounded-3xl border border-brand-500/40 bg-ink-900 p-6 shadow-panel sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-amber-300">
                  {selectedPlan.badge} · Instant Activation
                </span>
                <h3 className="mt-1 font-display text-[24px] font-bold text-white">
                  {selectedPlan.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlan(null)}
                aria-label="Close modal"
                className="flex size-8 items-center justify-center rounded-full border border-white/10 text-zinc-400 hover:border-white/25 hover:text-white"
              >
                ×
              </button>
            </div>

            {/* Duration selector inside modal */}
            <div className="mt-5">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                Billing Duration
              </span>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {BILLING_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setCycle(opt.id)}
                    className={`rounded-xl border px-3 py-2.5 text-center transition-colors ${
                      cycle === opt.id
                        ? "border-brand-500 bg-brand-600/20 text-white"
                        : "border-white/10 bg-ink-950/70 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <p className="text-[12px] font-semibold">{opt.label}</p>
                    <p className="mt-0.5 font-mono text-[11px] text-brand-300">
                      ₹{selectedPlan.prices[opt.id].toLocaleString("en-IN")}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Target server selector */}
            <div className="mt-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                Select Server to Upgrade
              </span>
              {guilds.length > 0 ? (
                <select
                  value={targetGuildId}
                  onChange={(e) => setTargetGuildId(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-xl border border-white/10 bg-ink-950 px-3 text-[13px] text-white focus:border-brand-500/50 focus:outline-none"
                >
                  <option value="">Choose one of your servers…</option>
                  {guilds.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.id})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={targetGuildId}
                  onChange={(e) => setTargetGuildId(e.target.value)}
                  placeholder="Paste your Discord Server ID (optional)"
                  className="mt-1.5 h-10 w-full rounded-xl border border-white/10 bg-ink-950 px-3.5 font-mono text-[12px] text-white placeholder:text-zinc-600 focus:border-brand-500/50 focus:outline-none"
                />
              )}
            </div>

            {/* Order summary preview + Copy */}
            <div className="mt-4 rounded-xl border border-white/[0.08] bg-ink-950/85 p-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-zinc-500">
                  Order Summary
                </span>
                <button
                  type="button"
                  onClick={() => void handleCopyOrder()}
                  className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] text-brand-300 hover:border-brand-500/40 hover:text-white"
                >
                  {copied ? "✓ Copied!" : "Copy Summary"}
                </button>
              </div>
              <pre className="mt-2 whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-zinc-300">
                {orderSummary}
              </pre>
            </div>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <a
                href={buildCheckoutHref(selectedPlan)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => void handleCopyOrder()}
                className="btn-glow relative inline-flex h-12 flex-1 items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-brand-600 px-5 text-[14px] font-semibold text-white hover:bg-brand-500"
              >
                <DiscordIcon className="size-4" />
                Complete Purchase — ₹
                {selectedPlan.prices[cycle].toLocaleString("en-IN")}
              </a>
            </div>
            <p className="mt-3 text-center font-mono text-[10px] text-zinc-500">
              Copies your order &amp; opens {site.name} Billing Desk · UPI,
              Cards &amp; Instant Activation
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
