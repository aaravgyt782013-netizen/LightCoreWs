"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { normalizeSupportUrl, site } from "@/lib/site";
import {
  BILLING_CYCLES,
  PREMIUM_PLANS,
  computeLiveCountdown,
  type BillingCycle,
  type PremiumInvoice,
  type PremiumPlanSpec,
  type PremiumSubscription,
} from "@/lib/premium-plans";
import { useSiteConfig } from "@/components/site/SiteConfigProvider";
import { Logo } from "@/components/ui/Logo";
import { CustomSelect } from "@/components/ui/CustomSelect";
import {
  ArrowRight,
  BoltIcon,
  CheckIcon,
  ChevronLeftIcon,
  ClockIcon,
  CopyIcon,
  CrownIcon,
  DiscordIcon,
  DownloadIcon,
  InvoiceIcon,
  LockIcon,
  ShieldIcon,
} from "@/components/ui/Icons";
import {
  buildInvoicePlainText,
  downloadInvoicePng,
  downloadInvoiceText,
  formatInvoiceDateTime,
} from "./InvoiceRenderer";

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

type SimpleGuild = { id: string; name: string; iconUrl?: string | null };
type SimpleUser = {
  id: string;
  username: string;
  globalName: string | null;
  isOwner?: boolean;
};

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
  const { config: siteCfg } = useSiteConfig();

  const [initialGuildId, setInitialGuildId] = useState("");
  const [initialGuildName, setInitialGuildName] = useState("");

  const [cycle, setCycle] = useState<BillingCycle>("1m");
  const [selectedPlan, setSelectedPlan] = useState<PremiumPlanSpec | null>(
    null,
  );
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [guilds, setGuilds] = useState<SimpleGuild[]>([]);
  const [targetGuildId, setTargetGuildId] = useState("");
  const [buyerNote, setBuyerNote] = useState("");

  // Active subscription + live ticking timer
  const [subscription, setSubscription] = useState<PremiumSubscription | null>(
    null,
  );
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [slotSaving, setSlotSaving] = useState(false);
  const [slotNotice, setSlotNotice] = useState<string | null>(null);

  // Invoice generation + preview + download state (NO website payment gateway)
  const [recentInvoices, setRecentInvoices] = useState<PremiumInvoice[]>([]);
  const [activeInvoice, setActiveInvoice] = useState<PremiumInvoice | null>(
    null,
  );
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadedOnce, setDownloadedOnce] = useState(false);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleQueryParams = useCallback((g: string, n: string) => {
    setInitialGuildId(g);
    setInitialGuildName(n);
    if (g) {
      setTargetGuildId((cur) => cur || g);
    }
  }, []);

  // Live 1s countdown ticker when user holds an active timed subscription
  useEffect(() => {
    if (!subscription || subscription.isLifetime) return;
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [subscription]);

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
            subscription?: PremiumSubscription | null;
            invoices?: PremiumInvoice[];
          };
          if (premJson.subscription) {
            setSubscription(premJson.subscription);
          }
          if (Array.isArray(premJson.invoices)) {
            setRecentInvoices(premJson.invoices);
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

  const isModalOpen = Boolean(selectedPlan || activeInvoice);

  const closeModal = useCallback(() => {
    setSelectedPlan(null);
    setActiveInvoice(null);
    setInvoiceError(null);
    setDownloadedOnce(false);
    setBuyerNote("");
  }, []);

  useEffect(() => {
    if (!isModalOpen) return;
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
  }, [isModalOpen, closeModal]);

  const activeCycleMeta =
    BILLING_CYCLES.find((b) => b.id === cycle) ?? BILLING_CYCLES[0];

  // Resolve live customizable plan names, badges & prices from Owner Panel
  const livePlans = useMemo(() => {
    return PREMIUM_PLANS.map((p) => {
      const override = siteCfg.pricing[p.id];
      return {
        ...p,
        name: override?.name || p.name,
        badge: override?.badge || p.badge,
        prices: {
          "1m": override ? override["1m"] : p.prices["1m"],
          "3m": override ? override["3m"] : p.prices["3m"],
          "1y": override ? override["1y"] : p.prices["1y"],
        },
      };
    });
  }, [siteCfg.pricing]);

  const curSym = siteCfg.currencySymbol || "₹";
  const supportUrl = normalizeSupportUrl(siteCfg.supportUrl || site.discord);

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

  const handleGenerateInvoice = async () => {
    if (!selectedPlan || generating) return;
    setGenerating(true);
    setInvoiceError(null);
    setDownloadedOnce(false);
    try {
      const res = await fetch("/api/premium/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: selectedPlan.id,
          cycle,
          guildId: targetGuildId || undefined,
          guildName: selectedGuildName || undefined,
          buyerNote: buyerNote.trim() || undefined,
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        invoice?: PremiumInvoice;
        error?: string;
      };
      if (!res.ok || !json.ok || !json.invoice) {
        setInvoiceError(
          json.error || "Could not generate your invoice. Please try again.",
        );
        return;
      }
      setActiveInvoice(json.invoice);
      setRecentInvoices((prev) => [json.invoice!, ...prev.slice(0, 11)]);
    } catch {
      setInvoiceError("Network error while generating invoice.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPng = async (inv: PremiumInvoice) => {
    if (downloading) return;
    setDownloading(true);
    try {
      await downloadInvoicePng(inv, siteCfg);
      setDownloadedOnce(true);
    } finally {
      setDownloading(false);
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

  const activeSubCountdown = useMemo(() => {
    if (!subscription) return null;
    return computeLiveCountdown(
      {
        status: "active",
        isLifetime: subscription.isLifetime,
        startedAt: subscription.activatedAt,
        expiresAt: subscription.expiresAt,
        durationMs: null,
      },
      nowMs,
    );
  }, [subscription, nowMs]);

  const premiumFaqs = [
    {
      q: "How do I buy and activate Premium?",
      a: "Choose a plan to create an order summary. Review the plan and amount, then contact our Support Server for payment instructions. Do not send passwords or one-time codes.",
    },
    {
      q: "How fast will I receive Premium after paying?",
      a: "The owner will confirm activation in the Support Server after payment is verified. Ask the support team for the expected timing before paying.",
    },
    {
      q: "Do I enter any card, bank, or payment details on this website?",
      a: "No. This website does not collect payment details. The order summary is not a tax invoice or proof of payment. Confirm the seller and amount in the official Support Server, and never share passwords or one-time codes.",
    },
    {
      q: "Can I switch which Discord server uses my Premium slot?",
      a: "Yes! Once activated, your active Premium card appears right at the top of this page with a live countdown timer and a 1-click server selector.",
    },
  ];

  const invoiceDt = activeInvoice
    ? formatInvoiceDateTime(activeInvoice.createdAt)
    : null;

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
            className="inline-flex items-center gap-1.5 rounded-full border border-brand-200/15 bg-ink-900/70 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-300 transition-all hover:border-brand-400/45 hover:text-white"
          >
            <ChevronLeftIcon className="size-3 text-brand-400" />
            {initialGuildName
              ? `Back to ${initialGuildName}`
              : "Back to Dashboard"}
          </Link>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-brand-400/35 bg-brand-500/12 px-4 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.28em] text-brand-200">
          <CrownIcon className="size-3.5 text-brand-300" />
          {siteCfg.brandName} Premium
        </div>

        <h1 className="mt-5 font-display text-[34px] font-bold leading-[1.06] tracking-tight text-white sm:text-[52px]">
          Unleash Maximum{" "}
          <span className="text-gradient-brand">Server Protection</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-[14.5px] leading-relaxed text-zinc-400 sm:text-[15.5px]">
          Choose a plan to create an order summary. Review the plan and amount,
          then contact our Support Server for payment instructions. Premium is
          activated after the owner confirms payment.
        </p>

        <p className="mx-auto mt-4 max-w-2xl text-[12px] leading-relaxed text-zinc-500">
          This document is an order summary, not a tax invoice or proof of payment. No payment
          is taken here. Confirm the seller and amount in the official Support Server before
          paying. Never share your Discord password or one-time codes.
        </p>

        {/* 3-Step How Purchase Works Strip */}
        <div className="mx-auto mt-6 grid max-w-2xl gap-2 text-left sm:grid-cols-3">
          {[
            { step: "01", title: "Create Order Summary", sub: "Review & download" },
            { step: "02", title: "Send in Ticket", sub: "Owner shares payment QR" },
            { step: "03", title: "Activation", sub: "After payment confirmation" },
          ].map((s) => (
            <div
              key={s.step}
              className="flex items-center gap-3 rounded-xl border border-brand-200/10 bg-ink-900/65 px-3.5 py-2.5"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-500/15 font-mono text-[10.5px] font-semibold text-brand-300">
                {s.step}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[12px] font-semibold text-white">
                  {s.title}
                </p>
                <p className="truncate font-mono text-[9.5px] text-zinc-400">
                  {s.sub}
                </p>
              </div>
            </div>
          ))}
        </div>

        {initialGuildName && (
          <p className="mt-4 inline-flex items-center gap-2 rounded-xl border border-brand-400/30 bg-brand-950/50 px-4 py-2 font-mono text-[11px] text-brand-200">
            <ShieldIcon className="size-3.5 text-brand-400" />
            Selected server:{" "}
            <strong className="text-white">{initialGuildName}</strong>
          </p>
        )}

        {/* Billing Duration Switcher */}
        <div className="mt-8 inline-flex max-w-full flex-wrap items-center justify-center gap-1.5 rounded-2xl border border-brand-200/12 bg-ink-900/90 p-1.5 shadow-panel">
          {BILLING_CYCLES.map((opt) => {
            const active = cycle === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setCycle(opt.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[12.5px] font-semibold transition-all duration-200 sm:text-[13px] ${
                  active
                    ? "bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-[0_6px_24px_-6px_rgb(var(--brand-400)/0.85)]"
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

      {/* Active Subscription Banner with Live Countdown */}
      {subscription && user && activeSubCountdown && (
        <div className="panel panel-inner mx-auto max-w-4xl rounded-3xl border-brand-400/45 p-5 shadow-glow sm:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/35 bg-emerald-500/15 px-3 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-emerald-300">
                  <CheckIcon className="size-3" />
                  Active Premium
                </span>
                <span className="font-mono text-[10px] text-zinc-400">
                  @{user.username} · Granted by {subscription.grantedBy}
                </span>
              </div>
              <h2 className="font-display text-[22px] font-bold text-white">
                {subscription.tierName}
              </h2>
              <div className="inline-flex items-center gap-2 rounded-lg border border-brand-400/25 bg-ink-950/75 px-3 py-1.5 font-mono text-[12px] text-brand-300">
                <ClockIcon className="size-3.5 text-brand-400" />
                <span>{activeSubCountdown.digital}</span>
              </div>
              {subscription.expiresAt && (
                <p className="font-mono text-[10.5px] text-zinc-400">
                  Expires{" "}
                  {new Date(subscription.expiresAt).toLocaleString()}
                </p>
              )}
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
        {livePlans.map((plan) => {
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
                    ? "border-brand-300/35 bg-gradient-to-b from-brand-950/45 via-ink-900/90 to-ink-950 shadow-panel hover:-translate-y-1 hover:border-brand-300/60"
                    : "border-brand-200/12 bg-ink-900/80 shadow-panel hover:-translate-y-1 hover:border-brand-400/45"
              }`}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -top-24 left-1/2 size-64 -translate-x-1/2 rounded-full blur-2xl"
                style={{
                  background: isFeatured
                    ? "radial-gradient(closest-side, rgb(var(--brand-400) / 0.28), transparent)"
                    : "radial-gradient(closest-side, rgb(var(--brand-500) / 0.18), transparent)",
                }}
              />

              <div className="relative">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-9 items-center justify-center rounded-xl border border-brand-400/35 bg-brand-500/15 text-brand-300">
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
                    className={`rounded-full border px-3 py-1 font-mono text-[9.5px] font-semibold uppercase tracking-[0.18em] ${
                      isFeatured
                        ? "border-brand-300/50 bg-brand-500 text-ink-950 shadow-[0_0_20px_-4px_rgb(var(--brand-400))]"
                        : plan.id === "ultra"
                          ? "border-brand-300/40 bg-brand-400/15 text-brand-200"
                          : "border-brand-200/15 bg-brand-200/[0.06] text-zinc-200"
                    }`}
                  >
                    {isCurrent ? "Active" : plan.badge}
                  </span>
                </div>

                <p className="mt-3 text-[13px] leading-relaxed text-zinc-400">
                  {plan.tagline}
                </p>

                <div className="mt-6 flex items-baseline gap-2 border-y border-brand-200/[0.09] py-5">
                  <span className="font-display text-[42px] font-bold leading-none tracking-tight text-white sm:text-[46px]">
                    {curSym}
                    {price.toLocaleString("en-IN")}
                  </span>
                  <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-zinc-400">
                    / {activeCycleMeta.period}
                  </span>
                </div>

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

              <button
                type="button"
                onClick={() => {
                  setInvoiceError(null);
                  setActiveInvoice(null);
                  setDownloadedOnce(false);
                  setSelectedPlan(plan);
                }}
                className={`group/btn relative mt-8 inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl text-[14px] font-semibold transition-all duration-200 ${
                  isFeatured
                    ? "btn-glow bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 text-white shadow-[0_12px_36px_-10px_rgb(var(--brand-400)/0.85)] hover:brightness-110"
                    : plan.id === "ultra"
                      ? "btn-glow bg-gradient-to-r from-brand-700 via-brand-500 to-brand-400 text-white shadow-[0_12px_36px_-10px_rgb(var(--brand-400)/0.65)] hover:brightness-110"
                      : "border border-brand-400/40 bg-brand-950/55 text-white hover:border-brand-400 hover:bg-brand-600"
                }`}
              >
                <InvoiceIcon className="size-4" />
                {isCurrent ? "Renew · Order Summary" : "Create Order Summary"}
                <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-0.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* User's Recent Invoices (click any to preview & re-download) */}
      {recentInvoices.length > 0 && (
        <div className="panel panel-inner mx-auto max-w-4xl rounded-3xl p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-brand-400">
                Your Order Summaries
              </p>
              <h2 className="mt-0.5 font-display text-[19px] font-semibold text-white">
                View &amp; Re-Download Order Summaries
              </h2>
            </div>
            <a
              href={supportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-brand-400/35 bg-brand-500/15 px-3.5 py-1.5 text-[12px] font-medium text-brand-200 hover:text-white"
            >
              <DiscordIcon className="size-3.5" />
              Open Support Ticket
            </a>
          </div>

          <div className="mt-4 divide-y divide-brand-200/[0.07]">
            {recentInvoices.slice(0, 5).map((inv) => {
              const dt = formatInvoiceDateTime(inv.createdAt);
              return (
                <div
                  key={inv.invoiceId}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[12px] font-semibold text-white">
                        {inv.invoiceId}
                      </span>
                      <span className="text-[12.5px] text-brand-200">
                        {inv.tierName} · {inv.durationLabel} ·{" "}
                        {inv.currencySymbol}
                        {inv.amount.toLocaleString("en-IN")}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 font-mono text-[9px] uppercase ${
                          inv.status === "fulfilled"
                            ? "bg-emerald-500/15 text-emerald-300"
                            : inv.status === "cancelled"
                              ? "bg-zinc-500/20 text-zinc-400"
                              : "bg-brand-500/20 text-brand-200"
                        }`}
                      >
                        {inv.status === "fulfilled"
                          ? "Activated"
                          : inv.status === "cancelled"
                            ? "Cancelled"
                            : "Send in Ticket"}
                      </span>
                    </div>
                    <p className="mt-0.5 font-mono text-[10.5px] text-zinc-400">
                      {dt.dateStr} at {dt.timeStr}
                      {inv.guildName ? ` · Server: ${inv.guildName}` : ""}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlan(null);
                      setDownloadedOnce(false);
                      setActiveInvoice(inv);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-brand-400/35 bg-ink-950/80 px-3.5 py-2 text-[12px] font-medium text-brand-200 transition-colors hover:border-brand-400 hover:text-white"
                  >
                    <InvoiceIcon className="size-3.5" />
                    Preview &amp; Download
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Feature Comparison Table */}
      <div className="panel panel-inner overflow-hidden rounded-3xl shadow-panel">
        <div className="border-b border-brand-200/[0.08] px-5 py-5 sm:px-8">
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
              <tr className="border-b border-brand-200/[0.08] font-mono text-[10.5px] uppercase tracking-[0.18em] text-zinc-400">
                <th className="px-5 py-4 sm:px-8">Capability</th>
                <th className="px-4 py-4 text-center">
                  {livePlans[0].name} ({curSym}
                  {livePlans[0].prices[cycle]})
                </th>
                <th className="px-4 py-4 text-center text-brand-300">
                  {livePlans[1].name} ({curSym}
                  {livePlans[1].prices[cycle]})
                </th>
                <th className="px-4 py-4 text-center text-brand-200">
                  {livePlans[2].name} ({curSym}
                  {livePlans[2].prices[cycle]})
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-200/[0.06]">
              {COMPARISON_ROWS.map((row) => (
                <tr
                  key={row.feature}
                  className="transition-colors hover:bg-brand-300/[0.025]"
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
          <p className="eyebrow">Order &amp; Support Process</p>
          <h2 className="mt-2 font-display text-[25px] font-semibold text-white sm:text-[28px]">
            Premium FAQ
          </h2>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {premiumFaqs.map((item) => (
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

      {/* In-Website Order Summary Generator & Live Preview Modal (Mobile Sheet + PC Modal) */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Premium Order Summary"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/82 backdrop-blur-md sm:items-center sm:p-4"
          onClick={closeModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="pb-safe relative max-h-[92vh] w-full max-w-xl animate-sheet-up overflow-y-auto rounded-t-3xl border-t border-brand-400/45 bg-ink-900 p-5 shadow-glow-lg sm:animate-pop-in sm:rounded-3xl sm:border sm:p-7"
          >
            {/* Mobile drag bar */}
            <div className="mb-3 flex justify-center sm:hidden">
              <span className="h-1 w-11 rounded-full bg-brand-200/20" />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-brand-300">
                  {activeInvoice
                    ? "Order Summary Preview"
                    : `${selectedPlan?.badge} · Create Order Summary`}
                </span>
                <h3 className="mt-1 font-display text-[21px] font-bold text-white sm:text-[24px]">
                  {activeInvoice
                    ? activeInvoice.invoiceId
                    : selectedPlan?.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close modal"
                className="flex size-9 shrink-0 items-center justify-center rounded-full border border-brand-200/15 bg-ink-950/70 text-lg text-zinc-400 hover:border-brand-400/40 hover:text-white"
              >
                ×
              </button>
            </div>

            {/* VIEW A: Generated Order Summary Preview + Download + Open Support Ticket */}
            {activeInvoice && invoiceDt ? (
              <div className="mt-5 space-y-4">
                {/* Visual Order Summary Preview Card */}
                <div className="relative overflow-hidden rounded-2xl border border-brand-400/35 bg-ink-950/95 shadow-panel">
                  <div className="h-1.5 w-full bg-gradient-to-r from-brand-600 via-brand-400 to-brand-300" />

                  <div className="space-y-4 p-4 sm:p-5">
                    {/* Brand + Status row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-200/10 pb-3.5">
                      <div className="flex items-center gap-2.5">
                        <Logo size={34} />
                        <div>
                          <p className="font-display text-[14.5px] font-bold tracking-wider text-white">
                            {activeInvoice.brandName.toUpperCase()}
                          </p>
                          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-400">
                            Premium Order Summary
                          </p>
                        </div>
                      </div>
                      <span
                        className={`rounded-full border px-2.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-wider ${
                          activeInvoice.status === "fulfilled"
                            ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-300"
                            : "border-brand-400/40 bg-brand-500/15 text-brand-200"
                        }`}
                      >
                        {activeInvoice.status === "fulfilled"
                          ? "Paid & Activated"
                          : "Send in Ticket"}
                      </span>
                    </div>

                    {/* Date, Time, Order Reference, Verify Code grid */}
                    <div className="grid grid-cols-2 gap-2.5 rounded-xl border border-brand-200/[0.08] bg-ink-900/70 p-3 font-mono text-[11px] sm:grid-cols-4">
                      <div>
                        <p className="text-[9px] uppercase text-zinc-500">
                          Date
                        </p>
                        <p className="mt-0.5 font-semibold text-white">
                          {invoiceDt.dateStr}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase text-zinc-500">
                          Time
                        </p>
                        <p className="mt-0.5 font-semibold text-white">
                          {invoiceDt.timeStr}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase text-zinc-500">
                          Order Reference
                        </p>
                        <p className="mt-0.5 truncate font-semibold text-brand-300">
                          {activeInvoice.invoiceId}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase text-zinc-500">
                          Verify Code
                        </p>
                        <p className="mt-0.5 font-semibold text-brand-300">
                          {activeInvoice.verificationCode}
                        </p>
                      </div>
                    </div>

                    {/* User & Server Details */}
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      <div className="rounded-xl border border-brand-200/[0.08] bg-ink-900/50 p-3">
                        <p className="font-mono text-[9px] uppercase tracking-wider text-brand-400">
                          Customer (Discord User)
                        </p>
                        <p className="mt-1 text-[13.5px] font-semibold text-white">
                          {activeInvoice.globalName || activeInvoice.username}
                        </p>
                        <p className="font-mono text-[11px] text-zinc-300">
                          @{activeInvoice.username}
                        </p>
                        <p className="mt-0.5 font-mono text-[10px] text-zinc-400">
                          ID: {activeInvoice.userId}
                        </p>
                      </div>

                      <div className="rounded-xl border border-brand-200/[0.08] bg-ink-900/50 p-3">
                        <p className="font-mono text-[9px] uppercase tracking-wider text-brand-400">
                          Server &amp; Activation
                        </p>
                        <p className="mt-1 truncate text-[13.5px] font-semibold text-white">
                          {activeInvoice.guildName ||
                            "Assign in Support Ticket"}
                        </p>
                        <p className="font-mono text-[10.5px] text-zinc-400">
                          {activeInvoice.guildId
                            ? `Guild ID: ${activeInvoice.guildId}`
                            : "Share server ID in ticket"}
                        </p>
                        <p className="mt-1 font-mono text-[10px] text-emerald-300">
                          ✓ Activation after payment confirmation
                        </p>
                      </div>
                    </div>

                    {/* Plan & Total Breakdown */}
                    <div className="rounded-xl border border-brand-400/25 bg-brand-950/30 p-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-[14.5px] font-bold text-white">
                            {activeInvoice.tierName}{" "}
                            <span className="font-mono text-[10px] font-normal text-brand-300">
                              ({activeInvoice.tierBadge})
                            </span>
                          </p>
                          <p className="font-mono text-[11px] text-zinc-300">
                            Duration: {activeInvoice.durationLabel}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-[9px] uppercase text-zinc-400">
                            Total Payable
                          </p>
                          <p className="font-display text-[24px] font-bold text-brand-300">
                            {activeInvoice.currencySymbol}
                            {activeInvoice.amount.toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-brand-200/10 pt-2.5">
                        {activeInvoice.features.map((f) => (
                          <span
                            key={f}
                            className="rounded-md border border-brand-200/10 bg-ink-950/75 px-2 py-0.5 text-[10.5px] text-zinc-300"
                          >
                            ✓ {f}
                          </span>
                        ))}
                      </div>

                      {activeInvoice.buyerNote && (
                        <p className="mt-2.5 border-t border-brand-200/10 pt-2 font-mono text-[10.5px] text-zinc-300">
                          Note: {activeInvoice.buyerNote}
                        </p>
                      )}
                    </div>

                    <p className="font-mono text-[9.5px] text-zinc-500">
                      UTC Timestamp: {invoiceDt.utcStr} · No payment is collected on this website
                    </p>
                  </div>
                </div>

                {/* Clear Ticket & Owner QR Instructions */}
                <div className="rounded-2xl border border-brand-400/35 bg-brand-950/45 p-4">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-300">
                    Next Steps · How to Get Your Premium
                  </p>
                  <ol className="mt-2 space-y-1.5 text-[12.5px] leading-relaxed text-zinc-200">
                    <li>
                      <strong className="text-white">1.</strong> Tap{" "}
                      <strong className="text-brand-300">
                        Download Order Summary (PNG)
                      </strong>{" "}
                      below to save your order summary.
                    </li>
                    <li>
                      <strong className="text-white">2.</strong>{" "}
                      <strong className="text-white">Open a ticket</strong> in
                      our Support Server and{" "}
                      <strong className="text-white">send the order summary</strong>.
                    </li>
                    <li>
                      <strong className="text-white">3.</strong> The{" "}
                      <strong className="text-brand-200">
                        Support team will explain the available payment method
                      </strong>{" "}
                      inside your ticket.
                    </li>
                    <li>
                      <strong className="text-white">4.</strong> Once payment is
                      done, you will receive{" "}
                      <strong className="text-emerald-300">
                        Premium after the owner confirms payment
                      </strong>
                      !
                    </li>
                  </ol>
                </div>

                {/* Download + Copy Buttons */}
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled={downloading}
                    onClick={() => void handleDownloadPng(activeInvoice)}
                    className="btn-glow relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 px-4 text-[13.5px] font-semibold text-white shadow-[0_10px_30px_-8px_rgb(var(--brand-400)/0.85)] transition-all hover:brightness-110 disabled:opacity-60"
                  >
                    <DownloadIcon className="size-4" />
                    {downloading
                      ? "Preparing Order Summary…"
                      : downloadedOnce
                        ? "Downloaded! Save Again"
                        : "Download Order Summary (PNG)"}
                  </button>

                  <a
                    href={normalizeSupportUrl(
                      activeInvoice.supportUrl || supportUrl,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary btn-glow relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-xl px-5 text-[13.5px] font-semibold text-white transition-all duration-300 ease-smooth hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    <DiscordIcon className="size-4" />
                    Open Ticket in Support Server
                  </a>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => downloadInvoiceText(activeInvoice, siteCfg)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200/15 bg-ink-950/70 px-3 py-1.5 font-mono text-[10.5px] text-zinc-300 hover:border-brand-400/40 hover:text-white"
                  >
                    <DownloadIcon className="size-3.5 text-brand-400" />
                    Download as .TXT
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void copyText(
                        "invtxt",
                        buildInvoicePlainText(activeInvoice, siteCfg),
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200/15 bg-ink-950/70 px-3 py-1.5 font-mono text-[10.5px] text-brand-300 hover:border-brand-400/40 hover:text-white"
                  >
                    <CopyIcon className="size-3.5" />
                    {copiedKey === "invtxt"
                      ? "✓ Order Summary Copied!"
                      : "Copy Order Summary Text"}
                  </button>
                </div>
              </div>
            ) : selectedPlan ? (
              /* VIEW B: Configure Plan, Duration, Server & Note -> Create Order Summary */
              <div className="mt-5 space-y-4">
                {user ? (
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-brand-400/25 bg-brand-950/40 px-3.5 py-2.5">
                    <span className="flex items-center gap-2 text-[12.5px] text-zinc-200">
                      <LockIcon className="size-3.5 text-brand-400" />
                      Order summary for{" "}
                      <strong className="text-white">@{user.username}</strong>
                    </span>
                    <span className="font-mono text-[10px] text-brand-300">
                      ID {user.id}
                    </span>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-brand-400/30 bg-brand-950/40 p-4">
                    <p className="text-[13.5px] font-semibold text-white">
                      Sign in with Discord to Create an Order Summary
                    </p>
                    <p className="mt-1 text-[12px] leading-relaxed text-zinc-400">
                      We attach your verified Discord username, User ID,
                      selected server, and exact timestamp directly onto your
                      downloadable invoice for fast ticket activation.
                    </p>
                    <a
                      href="/api/auth/discord?next=/premium"
                      className="btn-primary btn-glow relative mt-3 inline-flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-xl text-[13.5px] font-semibold text-white transition-all duration-300 ease-smooth hover:-translate-y-0.5 active:scale-[0.98]"
                    >
                      <DiscordIcon className="size-4" />
                      Continue with Discord
                    </a>
                  </div>
                )}

                {/* Billing Duration */}
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                    Select Duration
                  </span>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {BILLING_CYCLES.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setCycle(opt.id)}
                        className={`rounded-xl border px-2.5 py-2.5 text-center transition-all ${
                          cycle === opt.id
                            ? "border-brand-400 bg-brand-500/20 text-white shadow-[0_0_20px_-8px_rgb(var(--brand-400))]"
                            : "border-brand-200/10 bg-ink-950/70 text-zinc-400 hover:text-white"
                        }`}
                      >
                        <p className="text-[12px] font-semibold">{opt.label}</p>
                        <p className="mt-0.5 font-mono text-[11px] text-brand-300">
                          {curSym}
                          {selectedPlan.prices[opt.id].toLocaleString("en-IN")}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom In-Website Server Selector */}
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                    Target Discord Server (Optional)
                  </span>
                  <div className="mt-1.5">
                    {guilds.length > 0 ? (
                      <CustomSelect
                        title="Select Server for Order Summary"
                        placeholder="Choose one of your servers…"
                        value={targetGuildId}
                        onChange={setTargetGuildId}
                        options={[
                          {
                            value: "",
                            label: "Decide in Support Ticket",
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
                        placeholder="Discord Server ID (optional)"
                        className="input-aqua font-mono text-[12px]"
                      />
                    )}
                  </div>
                </div>

                {/* Optional Note on Order Summary */}
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                    Additional Note for Owner (Optional)
                  </span>
                  <input
                    type="text"
                    maxLength={200}
                    value={buyerNote}
                    onChange={(e) => setBuyerNote(e.target.value)}
                    placeholder="e.g. Custom bot name, referral, or extra info…"
                    className="input-aqua mt-1.5"
                  />
                </div>

                {/* How It Works Notice */}
                <div className="rounded-xl border border-brand-200/10 bg-ink-950/75 px-3.5 py-3 text-[12px] leading-relaxed text-zinc-300">
                  {siteCfg.ticketInstructions}
                  {" "}
                  No payment is collected on this website. This document is not a tax invoice or proof of payment. Confirm the seller and amount before paying. Never share passwords or one-time codes.
                </div>

                {invoiceError && (
                  <p className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3.5 py-2.5 font-mono text-[11px] text-amber-200">
                    {invoiceError}
                  </p>
                )}

                {user && (
                  <button
                    type="button"
                    disabled={generating}
                    onClick={() => void handleGenerateInvoice()}
                    className="btn-glow relative inline-flex h-12 w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 px-5 text-[14px] font-semibold text-white shadow-[0_12px_34px_-8px_rgb(var(--brand-400)/0.85)] transition-all hover:brightness-110 disabled:opacity-60"
                  >
                    <InvoiceIcon className="size-4" />
                    {generating
                      ? "Creating Order Summary…"
                      : `Create Order Summary — ${curSym}${selectedPlan.prices[cycle].toLocaleString("en-IN")}`}
                  </button>
                )}

                <p className="text-center font-mono text-[10px] text-zinc-500">
                  No payment collected here · Confirm seller details before paying
                </p>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
