"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { site } from "@/lib/site";
import {
  BILLING_CYCLES,
  PREMIUM_PLANS,
  type BillingCycle,
  type PremiumOrder,
  type PremiumPlanSpec,
  type PremiumSubscription,
} from "@/lib/premium-plans";
import { CustomSelect } from "@/components/ui/CustomSelect";
import {
  ArrowRight,
  BoltIcon,
  CheckIcon,
  ChevronLeftIcon,
  CopyIcon,
  CrownIcon,
  DiscordIcon,
  LockIcon,
  ShieldIcon,
} from "@/components/ui/Icons";

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
    q: "How does automatic FamPay / UPI activation work?",
    a: `Sign in with Discord, pick your plan, and scan the dynamic QR (on PC) or tap Pay with FamPay / UPI (on mobile). Each order carries a unique exact amount tied strictly to your Discord ID so ${site.name} unlocks Premium automatically on your account only.`,
  },
  {
    q: "Is Premium locked exclusively to my Discord account?",
    a: "Yes — 100%. Every subscription binds cryptographically to your verified Discord User ID. Nobody else can claim your order, access your No-Prefix perk, or move your server slot.",
  },
  {
    q: "Can I switch which Discord server gets my Premium slot?",
    a: "Yes! Right from the top of this page you can assign or transfer your active Premium server slot to any server you manage in a single tap.",
  },
  {
    q: "Which UPI apps can I pay with?",
    a: "FamPay (FamApp), Google Pay, PhonePe, Paytm, BHIM, and every UPI-enabled app in India send payment straight to our verified FamPay ID with zero extra gateway fee.",
  },
];

type SimpleGuild = { id: string; name: string; iconUrl?: string | null };
type SimpleUser = {
  id: string;
  username: string;
  globalName: string | null;
  isOwner?: boolean;
};

const customCheckoutUrl =
  process.env.NEXT_PUBLIC_PREMIUM_CHECKOUT_URL?.trim() || "";

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
  const [selectedPlan, setSelectedPlan] = useState<PremiumPlanSpec | null>(
    null,
  );
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [guilds, setGuilds] = useState<SimpleGuild[]>([]);
  const [targetGuildId, setTargetGuildId] = useState("");

  // Account-locked premium & FamPay checkout state
  const [fampayEnabled, setFampayEnabled] = useState(false);
  const [subscription, setSubscription] = useState<PremiumSubscription | null>(
    null,
  );
  const [slotSaving, setSlotSaving] = useState(false);
  const [slotNotice, setSlotNotice] = useState<string | null>(null);

  const [activeOrder, setActiveOrder] = useState<PremiumOrder | null>(null);
  const [qrSvg, setQrSvg] = useState<string | null>(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const [utrInput, setUtrInput] = useState("");
  const [utrBusy, setUtrBusy] = useState(false);
  const [utrMsg, setUtrMsg] = useState<{ ok: boolean; text: string } | null>(
    null,
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleQueryParams = useCallback((g: string, n: string) => {
    setInitialGuildId(g);
    setInitialGuildName(n);
    if (g) {
      setTargetGuildId((cur) => cur || g);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [meRes, premRes] = await Promise.all([
          fetch("/api/auth/me", { cache: "no-store" }),
          fetch("/api/premium/me", { cache: "no-store" }),
        ]);
        if (!active) return;

        if (meRes.ok) {
          const meJson = (await meRes.json()) as {
            authenticated?: boolean;
            user?: SimpleUser;
            guilds?: SimpleGuild[];
          };
          if (meJson.authenticated && meJson.user) {
            setUser(meJson.user);
            if (Array.isArray(meJson.guilds)) {
              setGuilds(meJson.guilds);
              setTargetGuildId((cur) => cur || meJson.guilds?.[0]?.id || "");
            }
          }
        }

        if (premRes.ok) {
          const premJson = (await premRes.json()) as {
            fampayEnabled?: boolean;
            subscription?: PremiumSubscription | null;
          };
          setFampayEnabled(Boolean(premJson.fampayEnabled));
          if (premJson.subscription) {
            setSubscription(premJson.subscription);
          }
        }
      } catch {
        // Optional personalization.
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  // Poll active order every 3.5s for instant auto-activation when FamPay payment lands
  useEffect(() => {
    if (
      !activeOrder ||
      (activeOrder.status !== "pending" && activeOrder.status !== "verifying")
    ) {
      return;
    }

    let alive = true;
    const id = window.setInterval(async () => {
      try {
        const res = await fetch(
          `/api/premium/orders/${encodeURIComponent(activeOrder.orderId)}`,
          { cache: "no-store" },
        );
        if (!res.ok || !alive) return;
        const json = (await res.json()) as {
          order?: PremiumOrder;
          subscription?: PremiumSubscription | null;
        };
        if (!alive || !json.order) return;
        setActiveOrder(json.order);
        if (json.order.status === "paid" && json.subscription) {
          setSubscription(json.subscription);
        }
      } catch {
        // Continue polling cleanly.
      }
    }, 3500);

    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [activeOrder]);

  // Close modal with Escape
  useEffect(() => {
    if (!selectedPlan) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [selectedPlan]);

  const closeModal = () => {
    setSelectedPlan(null);
    setActiveOrder(null);
    setQrSvg(null);
    setOrderError(null);
    setUtrInput("");
    setUtrMsg(null);
  };

  const activeCycleMeta =
    BILLING_CYCLES.find((b) => b.id === cycle) ?? BILLING_CYCLES[0];

  const selectedGuildName = useMemo(() => {
    const found = guilds.find((g) => g.id === targetGuildId);
    if (found) return found.name;
    if (targetGuildId && targetGuildId === initialGuildId && initialGuildName) {
      return initialGuildName;
    }
    return "";
  }, [guilds, targetGuildId, initialGuildId, initialGuildName]);

  const copyText = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => {
        setCopiedKey((c) => (c === key ? null : c));
      }, 2200);
    } catch {
      // Ignore clipboard restriction.
    }
  };

  const orderSummary = useMemo(() => {
    if (!selectedPlan) return "";
    const price = selectedPlan.prices[cycle];
    return [
      `${site.name} Premium Order`,
      `Plan: ${selectedPlan.name} (${selectedPlan.badge})`,
      `Duration: ${activeCycleMeta.period}`,
      `Amount: ₹${price.toLocaleString("en-IN")}`,
      user
        ? `Account: @${user.username} (${user.id})`
        : "Account: (your Discord ID)",
      targetGuildId
        ? `Server: ${selectedGuildName ? `${selectedGuildName} ` : ""}(${targetGuildId})`
        : "Server: (assign anytime)",
    ].join("\n");
  }, [
    selectedPlan,
    cycle,
    activeCycleMeta,
    user,
    targetGuildId,
    selectedGuildName,
  ]);

  const handleStartFamPayOrder = async () => {
    if (!selectedPlan || creatingOrder) return;
    setCreatingOrder(true);
    setOrderError(null);
    setUtrMsg(null);
    try {
      const res = await fetch("/api/premium/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: selectedPlan.id,
          cycle,
          guildId: targetGuildId || undefined,
          guildName: selectedGuildName || undefined,
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        order?: PremiumOrder;
        qrSvg?: string;
        error?: string;
      };
      if (!res.ok || !json.ok || !json.order) {
        setOrderError(json.error || "Could not create FamPay UPI order.");
        return;
      }
      setActiveOrder(json.order);
      setQrSvg(json.qrSvg || null);
    } catch {
      setOrderError("Network error while creating your UPI order.");
    } finally {
      setCreatingOrder(false);
    }
  };

  const handleSubmitUtr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder || utrBusy) return;
    setUtrBusy(true);
    setUtrMsg(null);
    try {
      const res = await fetch(
        `/api/premium/orders/${encodeURIComponent(activeOrder.orderId)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ utr: utrInput }),
        },
      );
      const json = (await res.json()) as {
        ok?: boolean;
        order?: PremiumOrder;
        error?: string;
      };
      if (!res.ok || !json.ok || !json.order) {
        setUtrMsg({ ok: false, text: json.error || "Invalid UTR number." });
        return;
      }
      setActiveOrder(json.order);
      setUtrMsg({
        ok: true,
        text: "UTR locked to your order! Keep this window open — your account unlocks automatically once confirmed.",
      });
    } catch {
      setUtrMsg({ ok: false, text: "Network error submitting UTR." });
    } finally {
      setUtrBusy(false);
    }
  };

  const handleUpdateBoundGuild = async (nextGuildId: string) => {
    setSlotSaving(true);
    setSlotNotice(null);
    try {
      const res = await fetch("/api/premium/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guildId: nextGuildId || null }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        subscription?: PremiumSubscription;
        error?: string;
      };
      if (res.ok && json.subscription) {
        setSubscription(json.subscription);
        setSlotNotice(
          json.subscription.guildName
            ? `Active server switched to ${json.subscription.guildName}.`
            : "Cleared bound server slot.",
        );
      } else {
        setSlotNotice(json.error || "Could not update server slot.");
      }
    } finally {
      setSlotSaving(false);
    }
  };

  return (
    <div className="space-y-14 sm:space-y-16">
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
            className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200/15 bg-ink-900/70 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-300 transition-all hover:border-brand-400/45 hover:text-white"
          >
            <ChevronLeftIcon className="size-3 text-brand-400" />
            {initialGuildName
              ? `Back to ${initialGuildName}`
              : "Back to Dashboard"}
          </Link>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-brand-400/35 bg-brand-500/12 px-4 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.28em] text-brand-200">
          <CrownIcon className="size-3.5 text-brand-300" />
          {site.name} Premium
        </div>

        <h1 className="mt-5 font-display text-[34px] font-bold leading-[1.06] tracking-tight text-white sm:text-[52px]">
          Unleash Maximum{" "}
          <span className="text-gradient-brand">Server Protection</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-[14.5px] leading-relaxed text-zinc-400 sm:text-[15.5px]">
          Supercharge your community with {site.name}&apos;s Limit System,
          Anti-Token Spam, Anti-Betray Mode, Vanity Protection, No-Prefix
          access, and your own Custom Branded Bot — instant UPI checkout locked
          exclusively to your Discord account.
        </p>

        {initialGuildName && (
          <p className="mt-4 inline-flex items-center gap-2 rounded-xl border border-brand-400/30 bg-brand-950/50 px-4 py-2 font-mono text-[11px] text-brand-200">
            <ShieldIcon className="size-3.5 text-brand-400" />
            Selected server:{" "}
            <strong className="text-white">{initialGuildName}</strong>
          </p>
        )}

        {/* Billing Duration Switcher */}
        <div className="mt-8 inline-flex max-w-full flex-wrap items-center justify-center gap-1.5 rounded-2xl border border-cyan-200/12 bg-ink-900/90 p-1.5 shadow-panel">
          {BILLING_CYCLES.map((opt) => {
            const active = cycle === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setCycle(opt.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[12.5px] font-semibold transition-all duration-200 sm:text-[13px] ${
                  active
                    ? "bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-[0_6px_24px_-6px_rgba(34,211,238,0.85)]"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <span>{opt.label}</span>
                {opt.save && (
                  <span
                    className={`rounded-md px-1.5 py-0.5 font-mono text-[9px] uppercase ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-brand-500/15 text-brand-300"
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

      {/* Account-Locked Active Subscription Manager (visible only to the subscribed user) */}
      {subscription && user && (
        <div className="panel panel-inner mx-auto max-w-4xl rounded-3xl border-brand-400/45 p-5 shadow-glow sm:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/35 bg-emerald-500/15 px-3 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-emerald-300">
                  <CheckIcon className="size-3" />
                  Active Subscription
                </span>
                <span className="font-mono text-[10px] text-zinc-400">
                  Locked to @{user.username} ({user.id})
                </span>
              </div>
              <h2 className="mt-2 font-display text-[22px] font-bold text-white">
                {subscription.tierName}
              </h2>
              <p className="mt-1 font-mono text-[11px] text-zinc-400">
                Valid until{" "}
                <span className="text-brand-300">
                  {new Date(subscription.expiresAt).toLocaleDateString()}
                </span>{" "}
                · Order {subscription.orderId}
              </p>
            </div>

            {guilds.length > 0 && (
              <div className="w-full md:w-72">
                <span className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-zinc-400">
                  Assigned Premium Server
                </span>
                <div className="mt-1.5">
                  <CustomSelect
                    title="Assign Premium Server Slot"
                    disabled={slotSaving}
                    value={subscription.guildId || ""}
                    onChange={(val) => void handleUpdateBoundGuild(val)}
                    options={[
                      { value: "", label: "No server assigned" },
                      ...guilds.map((g) => ({
                        value: g.id,
                        label: g.name,
                        iconUrl: g.iconUrl,
                        description: `ID ${g.id}`,
                      })),
                    ]}
                  />
                </div>
                {slotNotice && (
                  <p className="mt-1.5 font-mono text-[10px] text-brand-300">
                    {slotNotice}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3 Pricing Cards */}
      <div className="grid items-stretch gap-5 sm:gap-6 lg:grid-cols-3">
        {PREMIUM_PLANS.map((plan) => {
          const price = plan.prices[cycle];
          const isFeatured = Boolean(plan.featured);
          const isCurrent = subscription?.tier === plan.id;
          return (
            <div
              key={plan.id}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border p-6 transition-all duration-300 ease-smooth sm:p-8 ${
                isFeatured
                  ? "border-brand-400/60 bg-gradient-to-b from-brand-950/75 via-ink-900 to-ink-950 shadow-glow-lg lg:-translate-y-2"
                  : plan.id === "ultra"
                    ? "border-sky-400/35 bg-gradient-to-b from-sky-950/45 via-ink-900/90 to-ink-950 shadow-panel hover:-translate-y-1 hover:border-brand-300/60"
                    : "border-cyan-200/12 bg-ink-900/80 shadow-panel hover:-translate-y-1 hover:border-brand-400/45"
              }`}
            >
              {/* Ambient top glow */}
              <div
                aria-hidden
                className={`pointer-events-none absolute -top-24 left-1/2 size-64 -translate-x-1/2 rounded-full blur-2xl ${
                  isFeatured
                    ? "bg-[radial-gradient(closest-side,rgba(34,211,238,0.28),transparent)]"
                    : plan.id === "ultra"
                      ? "bg-[radial-gradient(closest-side,rgba(56,189,248,0.24),transparent)]"
                      : "bg-[radial-gradient(closest-side,rgba(6,182,212,0.16),transparent)]"
                }`}
              />

              <div className="relative">
                {/* Plan Title + Badge */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`flex size-9 items-center justify-center rounded-xl border ${
                        plan.id === "ultra"
                          ? "border-cyan-300/40 bg-sky-500/15 text-cyan-200"
                          : "border-brand-400/35 bg-brand-500/15 text-brand-300"
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
                        ? "border-brand-300/50 bg-brand-500 text-ink-950 font-semibold shadow-[0_0_20px_-4px_#22d3ee]"
                        : plan.id === "ultra"
                          ? "border-cyan-300/40 bg-cyan-400/15 text-cyan-200"
                          : "border-cyan-200/15 bg-cyan-200/[0.06] text-zinc-200"
                    }`}
                  >
                    {isCurrent ? "Active" : plan.badge}
                  </span>
                </div>

                <p className="mt-3 text-[13px] leading-relaxed text-zinc-400">
                  {plan.tagline}
                </p>

                {/* Price */}
                <div className="mt-6 flex items-baseline gap-2 border-y border-cyan-200/[0.09] py-5">
                  <span className="font-display text-[42px] font-bold leading-none tracking-tight text-white sm:text-[46px]">
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
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-brand-300">
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
                  setOrderError(null);
                  setActiveOrder(null);
                  setQrSvg(null);
                  setSelectedPlan(plan);
                }}
                className={`group/btn relative mt-8 inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl text-[14px] font-semibold transition-all duration-200 ${
                  isFeatured
                    ? "btn-glow bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-400 text-white shadow-[0_12px_36px_-10px_rgba(34,211,238,0.85)] hover:brightness-110"
                    : plan.id === "ultra"
                      ? "btn-glow bg-gradient-to-r from-sky-600 via-brand-500 to-teal-400 text-white shadow-[0_12px_36px_-10px_rgba(56,189,248,0.65)] hover:brightness-110"
                      : "border border-brand-400/40 bg-brand-950/55 text-white hover:border-brand-400 hover:bg-brand-600"
                }`}
              >
                {isCurrent ? "Extend Plan" : "Buy Now"}
                <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-0.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Table */}
      <div className="panel panel-inner overflow-hidden rounded-3xl shadow-panel">
        <div className="border-b border-cyan-200/[0.08] px-5 py-5 sm:px-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-brand-400">
            Compare Tiers
          </p>
          <h2 className="mt-1 font-display text-[21px] font-semibold text-white sm:text-[23px]">
            Full Feature Breakdown
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[540px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-cyan-200/[0.08] font-mono text-[10.5px] uppercase tracking-[0.18em] text-zinc-400">
                <th className="px-5 py-4 sm:px-8">Capability</th>
                <th className="px-4 py-4 text-center">Plus (₹299)</th>
                <th className="px-4 py-4 text-center text-brand-300">
                  Pro (₹499)
                </th>
                <th className="px-4 py-4 text-center text-cyan-200">
                  Ultra Pro (₹749)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-200/[0.06]">
              {COMPARISON_ROWS.map((row) => (
                <tr
                  key={row.feature}
                  className="transition-colors hover:bg-cyan-300/[0.025]"
                >
                  <td className="px-5 py-3.5 text-zinc-200 sm:px-8">
                    {row.feature}
                  </td>
                  {(["plus", "pro", "ultra"] as const).map((tier) => (
                    <td key={tier} className="px-4 py-3.5 text-center">
                      {row[tier] ? (
                        <span className="inline-flex size-5 items-center justify-center rounded-full bg-brand-500/20 text-brand-300">
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
          <p className="eyebrow">Instant FamPay UPI &amp; Perks</p>
          <h2 className="mt-2 font-display text-[25px] font-semibold text-white sm:text-[28px]">
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

      {/* Responsive In-Website FamPay Checkout Modal (Sheet on Mobile, Centered on PC) */}
      {selectedPlan && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Purchase ${selectedPlan.name}`}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md sm:items-center sm:p-4"
          onClick={closeModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="pb-safe relative max-h-[92vh] w-full max-w-lg animate-sheet-up overflow-y-auto rounded-t-3xl border-t border-brand-400/45 bg-ink-900 p-5 shadow-glow-lg sm:animate-pop-in sm:rounded-3xl sm:border sm:p-7"
          >
            {/* Mobile drag handle */}
            <div className="mb-3 flex justify-center sm:hidden">
              <span className="h-1 w-11 rounded-full bg-cyan-200/20" />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-brand-300">
                  {selectedPlan.badge} · Account-Locked Checkout
                </span>
                <h3 className="mt-1 font-display text-[22px] font-bold text-white sm:text-[24px]">
                  {selectedPlan.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close modal"
                className="flex size-9 items-center justify-center rounded-full border border-cyan-200/15 bg-ink-950/70 text-lg text-zinc-400 hover:border-brand-400/40 hover:text-white"
              >
                ×
              </button>
            </div>

            {/* CASE A: Order PAID & Auto-Activated! */}
            {activeOrder?.status === "paid" ? (
              <div className="mt-6 space-y-5 text-center">
                <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-emerald-400/40 bg-emerald-500/15 text-emerald-300 shadow-[0_0_35px_rgba(16,185,129,0.35)]">
                  <CheckIcon className="size-8" />
                </div>
                <div>
                  <h4 className="font-display text-[22px] font-bold text-white">
                    Premium Activated!
                  </h4>
                  <p className="mt-1.5 text-[13.5px] text-zinc-300">
                    <strong>{activeOrder.tierName}</strong> is now unlocked
                    exclusively on{" "}
                    <span className="font-mono text-brand-300">
                      @{activeOrder.username}
                    </span>
                    .
                  </p>
                </div>
                <div className="rounded-2xl border border-cyan-200/10 bg-ink-950/80 p-4 text-left font-mono text-[11px] text-zinc-300">
                  <p>Order: {activeOrder.orderId}</p>
                  <p>Paid: ₹{activeOrder.exactAmount}</p>
                  <p>Account ID: {activeOrder.userId}</p>
                  {subscription?.expiresAt && (
                    <p>
                      Expires:{" "}
                      {new Date(subscription.expiresAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Link
                  href={
                    activeOrder.guildId
                      ? `/dashboard/${activeOrder.guildId}`
                      : "/dashboard"
                  }
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-[14px] font-semibold text-white"
                >
                  Open Your Dashboard
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            ) : activeOrder ? (
              /* CASE B: Live FamPay UPI Payment Screen (PC QR + Mobile Deep Link + Auto-Poll + UTR) */
              <div className="mt-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-brand-400/30 bg-brand-950/50 px-3.5 py-2.5">
                  <div>
                    <p className="font-mono text-[9.5px] uppercase tracking-wider text-brand-300">
                      Pay Exact Amount (Auto-Match)
                    </p>
                    <p className="font-display text-[24px] font-bold text-white">
                      ₹{activeOrder.exactAmount}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyText("amt", activeOrder.exactAmount)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-200/15 bg-ink-950/80 px-3 py-1.5 font-mono text-[10.5px] text-brand-200 hover:border-brand-400/50"
                  >
                    <CopyIcon className="size-3.5" />
                    {copiedKey === "amt" ? "Copied!" : "Copy ₹"}
                  </button>
                </div>

                {/* Self-contained In-Website SVG QR Code */}
                {qrSvg && (
                  <div className="flex flex-col items-center rounded-2xl border border-cyan-200/12 bg-ink-950/80 p-4">
                    <div
                      className="size-52 overflow-hidden rounded-2xl bg-white p-2.5 shadow-[0_0_35px_-8px_rgba(34,211,238,0.45)] sm:size-56 [&>svg]:size-full"
                      dangerouslySetInnerHTML={{ __html: qrSvg }}
                    />
                    <p className="mt-3 text-center text-[12px] text-zinc-300">
                      Scan with <strong>FamPay</strong>, GPay, PhonePe, or Paytm
                    </p>
                    <button
                      type="button"
                      onClick={() => copyText("upi", activeOrder.upiId)}
                      className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-cyan-200/12 bg-ink-900 px-3 py-1 font-mono text-[11px] text-brand-300 hover:border-brand-400/40"
                    >
                      <span>{activeOrder.upiId}</span>
                      <CopyIcon className="size-3" />
                      {copiedKey === "upi" && (
                        <span className="text-emerald-400">✓</span>
                      )}
                    </button>
                  </div>
                )}

                {/* One-Tap Mobile UPI Launch Button */}
                <a
                  href={activeOrder.upiUri}
                  className="btn-glow relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-400 text-[14px] font-semibold text-white shadow-[0_10px_30px_-8px_rgba(34,211,238,0.85)] sm:h-11"
                >
                  Open FamPay / UPI App — ₹{activeOrder.exactAmount}
                  <ArrowRight className="size-4" />
                </a>

                {/* Live Auto-Detect Indicator */}
                <div className="flex items-center justify-between gap-2 rounded-xl border border-cyan-200/10 bg-ink-950/60 px-3.5 py-2.5 font-mono text-[10.5px]">
                  <span className="flex items-center gap-2 text-brand-300">
                    <span className="size-2 animate-ticker rounded-full bg-brand-400" />
                    {activeOrder.status === "verifying"
                      ? "UTR received · verifying payment…"
                      : "Waiting for FamPay transfer…"}
                  </span>
                  <span className="text-zinc-500">{activeOrder.orderId}</span>
                </div>

                {/* Backup 12-Digit UTR Input */}
                <form
                  onSubmit={(e) => void handleSubmitUtr(e)}
                  className="rounded-xl border border-cyan-200/10 bg-ink-950/60 p-3.5"
                >
                  <label className="block font-mono text-[9.5px] uppercase tracking-[0.2em] text-zinc-400">
                    Paid already? Submit 12-digit UPI UTR / Ref No.
                  </label>
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={14}
                      value={utrInput}
                      onChange={(e) => setUtrInput(e.target.value)}
                      placeholder="e.g. 432198765432"
                      className="input-aqua flex-1 font-mono text-[12px]"
                    />
                    <button
                      type="submit"
                      disabled={utrBusy || utrInput.replace(/\D/g, "").length < 12}
                      className="h-10 shrink-0 rounded-xl bg-brand-600 px-4 text-[12.5px] font-semibold text-white hover:bg-brand-500 disabled:opacity-40"
                    >
                      {utrBusy ? "Sending…" : "Verify"}
                    </button>
                  </div>
                  {utrMsg && (
                    <p
                      className={`mt-2 font-mono text-[10.5px] ${
                        utrMsg.ok ? "text-emerald-400" : "text-amber-300"
                      }`}
                    >
                      {utrMsg.text}
                    </p>
                  )}
                </form>

                <p className="text-center font-mono text-[10px] text-zinc-500">
                  Locked solely to @{activeOrder.username} ({activeOrder.userId})
                </p>
              </div>
            ) : (
              /* CASE C: Configure Plan, Duration & Target Server */
              <div className="mt-5 space-y-4">
                {/* Account Lock Badge */}
                {user ? (
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-brand-400/25 bg-brand-950/40 px-3.5 py-2.5">
                    <span className="flex items-center gap-2 text-[12.5px] text-zinc-200">
                      <LockIcon className="size-3.5 text-brand-400" />
                      Locked to <strong className="text-white">@{user.username}</strong>
                    </span>
                    <span className="font-mono text-[10px] text-brand-300">
                      Only your account
                    </span>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-brand-400/30 bg-brand-950/40 p-4">
                    <p className="text-[13px] font-medium text-white">
                      Sign in with Discord first
                    </p>
                    <p className="mt-1 text-[12px] text-zinc-400">
                      We bind Premium directly to your verified Discord ID so
                      nobody else can ever claim your purchase.
                    </p>
                    <a
                      href="/api/auth/discord?next=/premium"
                      className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#5865F2] text-[13px] font-semibold text-white hover:bg-[#4752C4]"
                    >
                      <DiscordIcon className="size-4" />
                      Continue with Discord
                    </a>
                  </div>
                )}

                {/* Billing Duration */}
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                    Billing Duration
                  </span>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {BILLING_CYCLES.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setCycle(opt.id)}
                        className={`rounded-xl border px-2.5 py-2.5 text-center transition-all ${
                          cycle === opt.id
                            ? "border-brand-400 bg-brand-500/20 text-white shadow-[0_0_20px_-8px_#22d3ee]"
                            : "border-cyan-200/10 bg-ink-950/70 text-zinc-400 hover:text-white"
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

                {/* Custom In-Website Server Selector */}
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                    Server Slot to Activate
                  </span>
                  <div className="mt-1.5">
                    {guilds.length > 0 ? (
                      <CustomSelect
                        title="Select Server to Upgrade"
                        placeholder="Choose one of your servers…"
                        value={targetGuildId}
                        onChange={setTargetGuildId}
                        options={[
                          {
                            value: "",
                            label: "Assign later from Dashboard",
                          },
                          ...guilds.map((g) => ({
                            value: g.id,
                            label: g.name,
                            iconUrl: g.iconUrl,
                            description: `ID ${g.id}`,
                          })),
                        ]}
                      />
                    ) : (
                      <input
                        type="text"
                        value={targetGuildId}
                        onChange={(e) => setTargetGuildId(e.target.value)}
                        placeholder="Discord Server ID (optional — can assign later)"
                        className="input-aqua font-mono text-[12px]"
                      />
                    )}
                  </div>
                </div>

                {orderError && (
                  <p className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3.5 py-2.5 font-mono text-[11px] text-amber-200">
                    {orderError}
                  </p>
                )}

                {user?.isOwner && !fampayEnabled && (
                  <Link
                    href="/admin"
                    className="block rounded-xl border border-brand-400/35 bg-brand-950/50 px-3.5 py-2.5 text-center font-mono text-[11px] text-brand-200 hover:border-brand-400"
                  >
                    Owner Tip: Add your FamPay UPI ID (@fam) in Owner Panel →
                    enable live QR checkout →
                  </Link>
                )}

                {/* Primary Checkout CTA */}
                {user && fampayEnabled ? (
                  <button
                    type="button"
                    disabled={creatingOrder}
                    onClick={() => void handleStartFamPayOrder()}
                    className="btn-glow relative inline-flex h-12 w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-400 px-5 text-[14px] font-semibold text-white shadow-[0_12px_34px_-8px_rgba(34,211,238,0.85)] transition-all hover:brightness-110 disabled:opacity-60"
                  >
                    {creatingOrder
                      ? "Generating FamPay QR…"
                      : `Pay ₹${selectedPlan.prices[cycle].toLocaleString("en-IN")} via FamPay / UPI`}
                    <ArrowRight className="size-4" />
                  </button>
                ) : (
                  <>
                    <div className="rounded-xl border border-cyan-200/10 bg-ink-950/85 p-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-zinc-500">
                          Order Summary
                        </span>
                        <button
                          type="button"
                          onClick={() => copyText("sum", orderSummary)}
                          className="rounded-md border border-cyan-200/15 bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] text-brand-300 hover:border-brand-400/40 hover:text-white"
                        >
                          {copiedKey === "sum" ? "✓ Copied!" : "Copy Summary"}
                        </button>
                      </div>
                      <pre className="mt-2 whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-zinc-300">
                        {orderSummary}
                      </pre>
                    </div>

                    <a
                      href={customCheckoutUrl || site.discord}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => copyText("sum", orderSummary)}
                      className="btn-glow relative inline-flex h-12 w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-400 px-5 text-[14px] font-semibold text-white hover:brightness-110"
                    >
                      <DiscordIcon className="size-4" />
                      Purchase via Billing Desk — ₹
                      {selectedPlan.prices[cycle].toLocaleString("en-IN")}
                    </a>
                  </>
                )}

                <p className="text-center font-mono text-[10px] text-zinc-500">
                  Direct FamPay / UPI · 0% Gateway Fee · Account-Locked Instant
                  Unlock
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
