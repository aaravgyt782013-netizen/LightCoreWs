"use client";

import { useEffect, useMemo, useState } from "react";
import type { PublicAuthorizedUser } from "@/lib/auth-store";
import {
  DURATION_PRESETS,
  computeLiveCountdown,
  defaultPerksForTier,
  type CustomTimeUnit,
  type PremiumInvoice,
  type PremiumPerks,
  type PremiumRecord,
  type PremiumTargetType,
  type PremiumTier,
} from "@/lib/premium-plans";
import type { SiteConfig } from "@/lib/site-config";
import { CustomSelect } from "@/components/ui/CustomSelect";
import {
  CheckIcon,
  ClockIcon,
  CopyIcon,
  CrownIcon,
  DownloadIcon,
  EyeIcon,
  InvoiceIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from "@/components/ui/Icons";
import {
  downloadInvoicePng,
  formatInvoiceDateTime,
} from "@/app/premium/InvoiceRenderer";

const CURRENCY_OPTIONS = [
  { value: "INR", symbol: "₹", label: "INR (₹ Rupee)" },
  { value: "USD", symbol: "$", label: "USD ($ Dollar)" },
  { value: "EUR", symbol: "€", label: "EUR (€ Euro)" },
  { value: "GBP", symbol: "£", label: "GBP (£ Pound)" },
  { value: "FREE", symbol: "", label: "Free / Gifted (0)" },
];

const PAYMENT_METHODS = [
  { value: "Support Ticket QR", label: "Support Ticket QR (Owner)" },
  { value: "UPI / QR Transfer", label: "UPI / QR Transfer" },
  { value: "Giveaway Winner", label: "Giveaway Winner" },
  { value: "Partner / Staff Perk", label: "Partner / Staff Perk" },
  { value: "Free Trial", label: "Free Trial" },
  { value: "Manual / Other", label: "Manual / Other" },
];

function formatExactDateTime(iso: string | null): string {
  if (!iso) return "Never (Lifetime)";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function formatElapsed(ms: number): string {
  const sec = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

export type PrefillInvoiceSeed = PremiumInvoice | null;

export function PremiumManagerTab({
  records,
  invoices,
  users,
  botGuilds,
  ownerDefaultGranter,
  siteConfig,
  prefillInvoice,
  onClearPrefill,
  onReload,
}: {
  records: PremiumRecord[];
  invoices: PremiumInvoice[];
  users: PublicAuthorizedUser[];
  botGuilds: { id: string; name: string; iconUrl: string | null }[];
  ownerDefaultGranter: string;
  siteConfig: SiteConfig;
  prefillInvoice: PrefillInvoiceSeed;
  onClearPrefill: () => void;
  onReload: () => Promise<void>;
}) {
  // Live 1-second tick driving every countdown timer & detail clock
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Form visibility & fields
  const [showAddForm, setShowAddForm] = useState(false);
  const [targetType, setTargetType] = useState<PremiumTargetType>("both");
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [globalName, setGlobalName] = useState("");
  const [guildId, setGuildId] = useState("");
  const [guildName, setGuildName] = useState("");
  const [tier, setTier] = useState<PremiumTier>("pro");
  const [customTierName, setCustomTierName] = useState("");
  const [durationPreset, setDurationPreset] = useState("30d");
  const [customAmount, setCustomAmount] = useState("30");
  const [customUnit, setCustomUnit] = useState<CustomTimeUnit>("days");
  const [pricePaid, setPricePaid] = useState<string>(() =>
    String(siteConfig.pricing.pro["1m"]),
  );
  const [currencyCode, setCurrencyCode] = useState(
    siteConfig.currencyCode || "INR",
  );
  const [paymentMethod, setPaymentMethod] = useState("Support Ticket QR");
  const [paymentReference, setPaymentReference] = useState("");
  const [grantedBy, setGrantedBy] = useState(ownerDefaultGranter);
  const [invoiceId, setInvoiceId] = useState("");
  const [ticketId, setTicketId] = useState("");
  const [maxServers, setMaxServers] = useState("1");
  const [perks, setPerks] = useState<PremiumPerks>(() =>
    defaultPerksForTier("pro"),
  );
  const [notes, setNotes] = useState("");

  // Filters for tabular directory
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterState, setFilterState] = useState("all");
  const [filterTier, setFilterTier] = useState("all");

  // Selected row modal + busy/feedback state
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(
    null,
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Hydrate form automatically when Owner clicks "Customize & Grant" on an Invoice
  useEffect(() => {
    if (!prefillInvoice) return;
    setShowAddForm(true);
    setTargetType(prefillInvoice.guildId ? "both" : "user");
    setUserId(prefillInvoice.userId);
    setUsername(prefillInvoice.username);
    setGlobalName(prefillInvoice.globalName || "");
    setGuildId(prefillInvoice.guildId || "");
    setGuildName(prefillInvoice.guildName || "");
    setTier(prefillInvoice.tier);
    setPerks(defaultPerksForTier(prefillInvoice.tier));
    setDurationPreset(
      prefillInvoice.cycle === "3m"
        ? "90d"
        : prefillInvoice.cycle === "1y"
          ? "365d"
          : "30d",
    );
    setPricePaid(String(prefillInvoice.amount));
    setCurrencyCode(prefillInvoice.currencyCode || "INR");
    setPaymentMethod("Support Ticket QR");
    setInvoiceId(prefillInvoice.invoiceId);
    setNotes(
      prefillInvoice.buyerNote ? `Buyer note: ${prefillInvoice.buyerNote}` : "",
    );
    onClearPrefill();
  }, [prefillInvoice, onClearPrefill]);

  const selectedRecord = useMemo(
    () => records.find((r) => r.id === selectedRecordId) ?? null,
    [records, selectedRecordId],
  );

  // Close inspector modal on Escape
  useEffect(() => {
    if (!selectedRecord) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedRecordId(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selectedRecord]);

  const copyVal = async (key: string, val: string) => {
    try {
      await navigator.clipboard.writeText(val);
      setCopiedKey(key);
      window.setTimeout(
        () => setCopiedKey((c) => (c === key ? null : c)),
        1800,
      );
    } catch {
      // Ignore clipboard failure.
    }
  };

  const handleTierChange = (nextTier: PremiumTier) => {
    setTier(nextTier);
    setPerks(defaultPerksForTier(nextTier));
    if (currencyCode !== "FREE") {
      const p = siteConfig.pricing[nextTier];
      if (p) {
        const nextPrice =
          durationPreset === "90d"
            ? p["3m"]
            : durationPreset === "365d"
              ? p["1y"]
              : p["1m"];
        setPricePaid(String(nextPrice));
      }
    }
  };

  const callApi = async (
    key: string,
    payload: Record<string, unknown>,
    successMsg: string,
  ): Promise<boolean> => {
    setBusyKey(key);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/premium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setFeedback({ ok: false, text: json.error || "Action failed." });
        return false;
      }
      setFeedback({ ok: true, text: successMsg });
      await onReload();
      return true;
    } catch {
      setFeedback({ ok: false, text: "Network error while updating Premium." });
      return false;
    } finally {
      setBusyKey(null);
    }
  };

  const handleGrantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const curOpt = CURRENCY_OPTIONS.find((c) => c.value === currencyCode);
    const ok = await callApi(
      "grant",
      {
        action: "grant",
        targetType,
        userId: targetType !== "guild" ? userId : undefined,
        username: targetType !== "guild" ? username : undefined,
        globalName: targetType !== "guild" ? globalName : undefined,
        guildId: targetType !== "user" ? guildId : undefined,
        guildName: targetType !== "user" ? guildName : undefined,
        tier,
        customTierName: customTierName.trim() || undefined,
        durationPreset,
        customAmount: Number(customAmount) || 30,
        customUnit,
        pricePaid: currencyCode === "FREE" ? 0 : Number(pricePaid) || 0,
        currencyCode,
        currencySymbol: curOpt ? curOpt.symbol : siteConfig.currencySymbol,
        paymentMethod,
        paymentReference,
        grantedBy,
        invoiceId,
        ticketId,
        maxServers: Number(maxServers) || 1,
        perks,
        notes,
      },
      "Premium granted and live countdown started!",
    );
    if (ok) {
      setUserId("");
      setUsername("");
      setGlobalName("");
      setGuildId("");
      setGuildName("");
      setCustomTierName("");
      setPaymentReference("");
      setInvoiceId("");
      setTicketId("");
      setNotes("");
      setShowAddForm(false);
    }
  };

  const pendingInvoices = useMemo(
    () => invoices.filter((i) => i.status === "pending_ticket"),
    [invoices],
  );

  const filteredRecords = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter((r) => {
      if (filterType !== "all" && r.targetType !== filterType) return false;
      if (filterTier !== "all" && r.tier !== filterTier) return false;
      if (filterState !== "all") {
        const cd = computeLiveCountdown(r, nowMs);
        if (filterState === "active_any") {
          if (
            cd.state !== "active" &&
            cd.state !== "expiring" &&
            cd.state !== "lifetime"
          ) {
            return false;
          }
        } else if (cd.state !== filterState) {
          return false;
        }
      }
      if (!q) return true;
      return (
        r.id.toLowerCase().includes(q) ||
        (r.username && r.username.toLowerCase().includes(q)) ||
        (r.globalName && r.globalName.toLowerCase().includes(q)) ||
        (r.userId && r.userId.includes(q)) ||
        (r.guildName && r.guildName.toLowerCase().includes(q)) ||
        (r.guildId && r.guildId.includes(q)) ||
        r.grantedBy.toLowerCase().includes(q) ||
        r.tierName.toLowerCase().includes(q) ||
        (r.invoiceId && r.invoiceId.toLowerCase().includes(q)) ||
        (r.ticketId && r.ticketId.toLowerCase().includes(q))
      );
    });
  }, [records, search, filterType, filterTier, filterState, nowMs]);

  const selectedCountdown = selectedRecord
    ? computeLiveCountdown(selectedRecord, nowMs)
    : null;

  return (
    <div className="space-y-5">
      {/* Feedback banner */}
      {feedback && (
        <div
          className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 font-mono text-[11.5px] ${
            feedback.ok
              ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-300"
              : "border-amber-400/35 bg-amber-500/10 text-amber-200"
          }`}
        >
          <span>{feedback.text}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-zinc-400 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="panel panel-inner flex flex-wrap items-center justify-between gap-4 rounded-2xl p-4 sm:p-5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-brand-400">
            Premium Users &amp; Guilds Registry
          </p>
          <p className="mt-1 text-[13px] text-zinc-400">
            Add or remove any Discord User or Guild, record who granted it,
            duration, price &amp; ticket info, and click any row for full
            details with a live countdown timer.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm((v) => !v)}
          className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-[13px] font-semibold transition-all ${
            showAddForm
              ? "border border-brand-200/20 bg-ink-950 text-zinc-200 hover:text-white"
              : "btn-primary hover:brightness-105"
          }`}
        >
          <PlusIcon
            className={`size-4 transition-transform ${showAddForm ? "rotate-45" : ""}`}
          />
          {showAddForm ? "Close Form" : "Add Premium User / Guild"}
        </button>
      </div>

      {/* Add Premium User / Guild Rich Form */}
      {showAddForm && (
        <form
          onSubmit={(e) => void handleGrantSubmit(e)}
          className="panel panel-inner animate-pop-in space-y-5 rounded-2xl border-brand-400/35 p-5 shadow-glow sm:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-200/[0.08] pb-3.5">
            <div>
              <h3 className="font-display text-[18px] font-semibold text-white">
                Grant Premium Access
              </h3>
              <p className="text-[12px] text-zinc-400">
                Fill in the recipient, who gave Premium, exact duration, price,
                and optional ticket/invoice info.
              </p>
            </div>
            {pendingInvoices.length > 0 && (
              <div className="w-full sm:w-64">
                <CustomSelect
                  title="Autofill from Pending Invoice"
                  placeholder="Autofill from invoice…"
                  value={invoiceId}
                  onChange={(id) => {
                    const inv = pendingInvoices.find((x) => x.invoiceId === id);
                    if (!inv) {
                      setInvoiceId("");
                      return;
                    }
                    setInvoiceId(inv.invoiceId);
                    setTargetType(inv.guildId ? "both" : "user");
                    setUserId(inv.userId);
                    setUsername(inv.username);
                    setGlobalName(inv.globalName || "");
                    setGuildId(inv.guildId || "");
                    setGuildName(inv.guildName || "");
                    setTier(inv.tier);
                    setPerks(defaultPerksForTier(inv.tier));
                    setDurationPreset(
                      inv.cycle === "3m"
                        ? "90d"
                        : inv.cycle === "1y"
                          ? "365d"
                          : "30d",
                    );
                    setPricePaid(String(inv.amount));
                    setCurrencyCode(inv.currencyCode || "INR");
                  }}
                  options={[
                    { value: "", label: "Manual entry (no invoice)" },
                    ...pendingInvoices.map((inv) => ({
                      value: inv.invoiceId,
                      label: `${inv.invoiceId} · @${inv.username}`,
                      description: `${inv.tierName} (${inv.durationLabel}) · ${inv.currencySymbol}${inv.amount}`,
                    })),
                  ]}
                />
              </div>
            )}
          </div>

          {/* Row 1: Target Type + Plan + Granted By */}
          <div className="grid gap-3.5 sm:grid-cols-3">
            <div>
              <FieldLabel>Target Type</FieldLabel>
              <CustomSelect
                title="Select Premium Target Type"
                value={targetType}
                onChange={(v) => setTargetType(v as PremiumTargetType)}
                options={[
                  {
                    value: "both",
                    label: "User + Guild (Server)",
                    description: "Activates both user account & server",
                  },
                  {
                    value: "user",
                    label: "User Only",
                    description: "Grants Premium to a Discord user",
                  },
                  {
                    value: "guild",
                    label: "Guild (Server) Only",
                    description: "Grants Premium directly to a server",
                  },
                ]}
              />
            </div>

            <div>
              <FieldLabel>Premium Plan</FieldLabel>
              <CustomSelect
                title="Select Premium Plan"
                value={tier}
                onChange={(v) => handleTierChange(v as PremiumTier)}
                options={[
                  {
                    value: "plus",
                    label: siteConfig.pricing.plus.name,
                    description: `${siteConfig.currencySymbol}${siteConfig.pricing.plus["1m"]}/mo · ${siteConfig.pricing.plus.badge}`,
                  },
                  {
                    value: "pro",
                    label: siteConfig.pricing.pro.name,
                    description: `${siteConfig.currencySymbol}${siteConfig.pricing.pro["1m"]}/mo · ${siteConfig.pricing.pro.badge}`,
                  },
                  {
                    value: "ultra",
                    label: siteConfig.pricing.ultra.name,
                    description: `${siteConfig.currencySymbol}${siteConfig.pricing.ultra["1m"]}/mo · ${siteConfig.pricing.ultra.badge}`,
                  },
                ]}
              />
            </div>

            <div>
              <FieldLabel>Granted By (Who Gave Premium)</FieldLabel>
              <input
                type="text"
                required
                value={grantedBy}
                onChange={(e) => setGrantedBy(e.target.value)}
                placeholder="e.g. Owner (@username)"
                className="input-aqua"
              />
            </div>
          </div>

          {/* Row 2: User Details (when target is user or both) */}
          {(targetType === "user" || targetType === "both") && (
            <div className="rounded-xl border border-brand-200/10 bg-ink-950/55 p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-300">
                  Discord User Details
                </span>
                {users.length > 0 && (
                  <div className="w-full sm:w-64">
                    <CustomSelect
                      title="Quick-Pick Logged-In User"
                      placeholder="Quick-pick logged-in user…"
                      value={users.some((u) => u.id === userId) ? userId : ""}
                      onChange={(id) => {
                        const u = users.find((x) => x.id === id);
                        if (!u) return;
                        setUserId(u.id);
                        setUsername(u.username);
                        setGlobalName(u.globalName || "");
                      }}
                      options={users.map((u) => ({
                        value: u.id,
                        label: `@${u.username}`,
                        iconUrl: u.avatarUrl,
                        description: `${u.globalName || u.username} · ID ${u.id}`,
                      }))}
                    />
                  </div>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <FieldLabel>Discord User ID *</FieldLabel>
                  <input
                    type="text"
                    required
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="e.g. 123456789012345678"
                    className="input-aqua font-mono text-[12px]"
                  />
                </div>
                <div>
                  <FieldLabel>Username</FieldLabel>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. nightfall"
                    className="input-aqua"
                  />
                </div>
                <div>
                  <FieldLabel>Display Name (Optional)</FieldLabel>
                  <input
                    type="text"
                    value={globalName}
                    onChange={(e) => setGlobalName(e.target.value)}
                    placeholder="e.g. Nightfall"
                    className="input-aqua"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Row 3: Guild Details (when target is guild or both) */}
          {(targetType === "guild" || targetType === "both") && (
            <div className="rounded-xl border border-brand-200/10 bg-ink-950/55 p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-300">
                  Discord Guild (Server) Details
                </span>
                {botGuilds.length > 0 && (
                  <div className="w-full sm:w-64">
                    <CustomSelect
                      title="Quick-Pick Bot Server"
                      placeholder="Quick-pick bot server…"
                      value={
                        botGuilds.some((g) => g.id === guildId) ? guildId : ""
                      }
                      onChange={(id) => {
                        const g = botGuilds.find((x) => x.id === id);
                        if (!g) return;
                        setGuildId(g.id);
                        setGuildName(g.name);
                      }}
                      options={botGuilds.map((g) => ({
                        value: g.id,
                        label: g.name,
                        iconUrl: g.iconUrl,
                        description: `ID ${g.id}`,
                      }))}
                    />
                  </div>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <FieldLabel>Discord Guild / Server ID *</FieldLabel>
                  <input
                    type="text"
                    required
                    value={guildId}
                    onChange={(e) => setGuildId(e.target.value)}
                    placeholder="e.g. 987654321098765432"
                    className="input-aqua font-mono text-[12px]"
                  />
                </div>
                <div>
                  <FieldLabel>Server Name</FieldLabel>
                  <input
                    type="text"
                    value={guildName}
                    onChange={(e) => setGuildName(e.target.value)}
                    placeholder="e.g. LightCore Empire"
                    className="input-aqua"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Row 4: Duration + Price + Currency + Payment Method */}
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <FieldLabel>Duration (How Much Time)</FieldLabel>
              <CustomSelect
                title="Select Premium Duration"
                value={durationPreset}
                onChange={setDurationPreset}
                options={DURATION_PRESETS.map((d) => ({
                  value: d.id,
                  label: d.label,
                }))}
              />
            </div>

            {durationPreset === "custom" && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <FieldLabel>Amount</FieldLabel>
                  <input
                    type="number"
                    min={1}
                    max={10000}
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="input-aqua font-mono"
                  />
                </div>
                <div>
                  <FieldLabel>Unit</FieldLabel>
                  <CustomSelect
                    title="Select Time Unit"
                    value={customUnit}
                    onChange={(v) => setCustomUnit(v as CustomTimeUnit)}
                    options={[
                      { value: "minutes", label: "Minutes" },
                      { value: "hours", label: "Hours" },
                      { value: "days", label: "Days" },
                      { value: "months", label: "Months" },
                      { value: "years", label: "Years" },
                    ]}
                  />
                </div>
              </div>
            )}

            <div>
              <FieldLabel>Currency</FieldLabel>
              <CustomSelect
                title="Select Currency"
                value={currencyCode}
                onChange={(v) => {
                  setCurrencyCode(v);
                  if (v === "FREE") setPricePaid("0");
                }}
                options={CURRENCY_OPTIONS.map((c) => ({
                  value: c.value,
                  label: c.label,
                }))}
              />
            </div>

            <div>
              <FieldLabel>Price Paid</FieldLabel>
              <input
                type="number"
                min={0}
                step="1"
                disabled={currencyCode === "FREE"}
                value={pricePaid}
                onChange={(e) => setPricePaid(e.target.value)}
                placeholder="499"
                className="input-aqua font-mono disabled:opacity-50"
              />
            </div>

            <div>
              <FieldLabel>Source / Method</FieldLabel>
              <CustomSelect
                title="Select Payment / Grant Source"
                value={paymentMethod}
                onChange={setPaymentMethod}
                options={PAYMENT_METHODS}
              />
            </div>
          </div>

          {/* Row 5: Ticket, Invoice, Payment Ref, Server Slots, Custom Title */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <FieldLabel>Support Ticket ID / Channel</FieldLabel>
              <input
                type="text"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                placeholder="e.g. #ticket-0148"
                className="input-aqua font-mono text-[12px]"
              />
            </div>
            <div>
              <FieldLabel>Invoice ID (Optional)</FieldLabel>
              <input
                type="text"
                value={invoiceId}
                onChange={(e) => setInvoiceId(e.target.value)}
                placeholder="LC-INV-..."
                className="input-aqua font-mono text-[12px]"
              />
            </div>
            <div>
              <FieldLabel>Payment Ref / TXN Note</FieldLabel>
              <input
                type="text"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="Optional QR ref or proof note"
                className="input-aqua font-mono text-[12px]"
              />
            </div>
            <div>
              <FieldLabel>Max Server Slots</FieldLabel>
              <input
                type="number"
                min={1}
                max={50}
                value={maxServers}
                onChange={(e) => setMaxServers(e.target.value)}
                className="input-aqua font-mono"
              />
            </div>
          </div>

          {/* Row 6: Perks + Notes */}
          <div className="grid gap-3.5 lg:grid-cols-[1fr_1fr]">
            <div>
              <FieldLabel>Enabled Perks</FieldLabel>
              <div className="flex flex-wrap gap-2 pt-0.5">
                {(
                  [
                    ["noPrefix", "No-Prefix"],
                    ["vanityGuard", "Vanity Guard"],
                    ["antiBetray", "Anti-Betray"],
                    ["customBot", "Custom Bot"],
                    ["prioritySupport", "24/7 Priority"],
                  ] as const
                ).map(([k, lbl]) => {
                  const on = perks[k];
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() =>
                        setPerks((prev) => ({ ...prev, [k]: !prev[k] }))
                      }
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-[10.5px] transition-all ${
                        on
                          ? "border-brand-400/50 bg-brand-500/20 text-brand-200"
                          : "border-brand-200/10 bg-ink-950/70 text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {on && <CheckIcon className="size-3 text-brand-300" />}
                      {lbl}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <FieldLabel>Admin Notes / Extra Details</FieldLabel>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Reason, special terms, custom tier note, contact info…"
                className="input-aqua"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-brand-200/[0.08] pt-4">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="h-10 rounded-xl border border-brand-200/15 px-4 text-[12.5px] text-zinc-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busyKey !== null}
              className="btn-primary inline-flex h-10 items-center gap-2 rounded-full px-6 text-[13px] font-semibold disabled:opacity-50"
            >
              <CrownIcon className="size-4" />
              {busyKey === "grant" ? "Activating…" : "Activate Premium Now"}
            </button>
          </div>
        </form>
      )}

      {/* Search & Custom Filter Bar */}
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-brand-400/75" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search user, guild, ID, granter, invoice, ticket…"
            className="input-aqua pl-10"
          />
        </div>
        <CustomSelect
          title="Filter by Target Type"
          value={filterType}
          onChange={setFilterType}
          options={[
            { value: "all", label: "All Targets (Users & Guilds)" },
            { value: "user", label: "Users Only" },
            { value: "guild", label: "Guilds Only" },
            { value: "both", label: "User + Guild" },
          ]}
        />
        <CustomSelect
          title="Filter by Status"
          value={filterState}
          onChange={setFilterState}
          options={[
            { value: "all", label: "All Statuses" },
            { value: "active_any", label: "All Currently Active" },
            { value: "lifetime", label: "Lifetime" },
            { value: "expiring", label: "Expiring Soon (<3d)" },
            { value: "expired", label: "Expired" },
            { value: "revoked", label: "Revoked" },
          ]}
        />
        <CustomSelect
          title="Filter by Plan"
          value={filterTier}
          onChange={setFilterTier}
          options={[
            { value: "all", label: "All Plans" },
            { value: "plus", label: siteConfig.pricing.plus.name },
            { value: "pro", label: siteConfig.pricing.pro.name },
            { value: "ultra", label: siteConfig.pricing.ultra.name },
          ]}
        />
      </div>

      {/* Tabular Premium Users & Guilds View with Live Countdown Timers */}
      <div className="panel panel-inner overflow-hidden rounded-2xl shadow-panel">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-200/[0.08] px-4 py-3 sm:px-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">
            Showing {filteredRecords.length} of {records.length} Premium
            Record(s) · Click any row for full info
          </span>
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-brand-300">
            <span className="size-1.5 animate-ticker rounded-full bg-brand-400" />
            live countdown active
          </span>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <CrownIcon className="mx-auto size-8 text-brand-400/50" />
            <p className="mt-3 text-[14px] font-medium text-zinc-200">
              No Premium users or guilds match this view
            </p>
            <p className="mt-1 text-[12.5px] text-zinc-500">
              Click &ldquo;Add Premium User / Guild&rdquo; above to grant a new
              subscription with a live countdown timer.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-[12.5px]">
              <thead>
                <tr className="border-b border-brand-200/[0.08] bg-ink-950/60 font-mono text-[9.5px] uppercase tracking-[0.18em] text-zinc-400">
                  <th className="px-4 py-3.5">Type</th>
                  <th className="px-4 py-3.5">User / Guild</th>
                  <th className="px-4 py-3.5">Plan</th>
                  <th className="px-4 py-3.5">Price</th>
                  <th className="px-4 py-3.5">Granted By</th>
                  <th className="px-4 py-3.5">Duration</th>
                  <th className="px-4 py-3.5">Live Countdown</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-200/[0.06]">
                {filteredRecords.map((rec) => {
                  const cd = computeLiveCountdown(rec, nowMs);
                  return (
                    <tr
                      key={rec.id}
                      onClick={() => {
                        setRevokeReason("");
                        setSelectedRecordId(rec.id);
                      }}
                      className="cursor-pointer transition-colors hover:bg-brand-400/[0.055]"
                    >
                      <td className="px-4 py-3.5">
                        <span className="rounded-md border border-brand-200/15 bg-ink-950/80 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-brand-300">
                          {rec.targetType === "both"
                            ? "User+Guild"
                            : rec.targetType}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        {rec.userId && (
                          <div>
                            <p className="font-semibold text-white">
                              {rec.globalName || `@${rec.username}`}{" "}
                              {rec.globalName && (
                                <span className="font-mono text-[11px] font-normal text-zinc-400">
                                  @{rec.username}
                                </span>
                              )}
                            </p>
                            <p className="font-mono text-[10px] text-zinc-500">
                              UID: {rec.userId}
                            </p>
                          </div>
                        )}
                        {rec.guildId && (
                          <div className={rec.userId ? "mt-1" : ""}>
                            <p className="font-medium text-brand-200">
                              {rec.guildName}
                            </p>
                            <p className="font-mono text-[10px] text-zinc-500">
                              GID: {rec.guildId}
                            </p>
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-white">
                          {rec.tierName}
                        </span>
                        <p className="font-mono text-[10px] text-zinc-500">
                          {rec.maxServers} slot{rec.maxServers > 1 ? "s" : ""}
                          {rec.perks.noPrefix ? " · No-Prefix" : ""}
                        </p>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-mono font-semibold text-zinc-100">
                          {rec.currencyCode === "FREE" || rec.pricePaid === 0
                            ? "Free"
                            : `${rec.currencySymbol}${rec.pricePaid.toLocaleString("en-IN")}`}
                        </span>
                        <p className="truncate font-mono text-[9.5px] text-zinc-500">
                          {rec.paymentMethod}
                        </p>
                      </td>

                      <td className="px-4 py-3.5">
                        <p className="font-medium text-zinc-200">
                          {rec.grantedBy}
                        </p>
                        <p className="font-mono text-[9.5px] text-zinc-500">
                          {new Date(rec.startedAt).toLocaleDateString("en-GB")}
                        </p>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-[11px] text-zinc-300">
                        {rec.durationLabel}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="min-w-[148px]">
                          <p
                            className={`font-mono text-[11.5px] font-semibold tabular-nums ${
                              cd.state === "lifetime"
                                ? "text-brand-300"
                                : cd.state === "active"
                                  ? "text-emerald-300"
                                  : cd.state === "expiring"
                                    ? "text-amber-300"
                                    : "text-zinc-500"
                            }`}
                          >
                            {cd.compact}
                          </p>
                          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-ink-950">
                            <div
                              style={{ width: `${cd.progressPct}%` }}
                              className={`h-full rounded-full transition-all duration-500 ${
                                cd.state === "lifetime"
                                  ? "bg-brand-400"
                                  : cd.state === "active"
                                    ? "bg-emerald-400"
                                    : cd.state === "expiring"
                                      ? "bg-amber-400"
                                      : "bg-zinc-700"
                              }`}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <StatusPill state={cd.state} />
                      </td>

                      <td
                        className="px-4 py-3.5 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            title="View Full Info"
                            onClick={() => {
                              setRevokeReason("");
                              setSelectedRecordId(rec.id);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-brand-400/30 bg-brand-500/10 px-2.5 py-1.5 font-mono text-[10px] text-brand-200 hover:border-brand-400 hover:text-white"
                          >
                            <EyeIcon className="size-3.5" />
                            Details
                          </button>
                          <button
                            type="button"
                            title="Remove from Premium"
                            disabled={busyKey !== null}
                            onClick={() =>
                              void callApi(
                                `del-${rec.id}`,
                                { action: "delete", id: rec.id },
                                `Removed ${rec.username ? `@${rec.username}` : rec.guildName} from Premium.`,
                              )
                            }
                            className="rounded-lg border border-brand-200/12 bg-ink-950/70 p-1.5 text-zinc-400 hover:border-amber-400/50 hover:text-amber-300 disabled:opacity-40"
                          >
                            <TrashIcon className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Full Record Detail Inspector Modal (opens when clicking any table row) */}
      {selectedRecord && selectedCountdown && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Premium Record Details"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/82 backdrop-blur-md sm:items-center sm:p-4"
          onClick={() => setSelectedRecordId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="pb-safe relative max-h-[92vh] w-full max-w-2xl animate-sheet-up overflow-y-auto rounded-t-3xl border-t border-brand-400/45 bg-ink-900 p-5 shadow-glow-lg sm:animate-pop-in sm:rounded-3xl sm:border sm:p-7"
          >
            <div className="mb-3 flex justify-center sm:hidden">
              <span className="h-1 w-11 rounded-full bg-brand-200/20" />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-brand-400">
                    {selectedRecord.id}
                  </span>
                  <StatusPill state={selectedCountdown.state} />
                </div>
                <h3 className="mt-1 font-display text-[22px] font-bold text-white">
                  {selectedRecord.tierName} ·{" "}
                  <span className="text-brand-300">
                    {selectedRecord.targetType === "guild"
                      ? selectedRecord.guildName
                      : `@${selectedRecord.username}`}
                  </span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecordId(null)}
                aria-label="Close details"
                className="flex size-9 items-center justify-center rounded-full border border-brand-200/15 bg-ink-950/80 text-lg text-zinc-400 hover:text-white"
              >
                ×
              </button>
            </div>

            {/* Large Live Ticking Countdown Banner */}
            <div className="mt-4 rounded-2xl border border-brand-400/35 bg-ink-950/90 p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-400">
                <ClockIcon className="size-3.5 text-brand-400" />
                Live Remaining Time
              </div>
              <p
                className={`mt-1.5 font-mono text-[26px] font-bold tracking-wider tabular-nums sm:text-[32px] ${
                  selectedCountdown.state === "lifetime"
                    ? "text-brand-300"
                    : selectedCountdown.state === "active"
                      ? "text-emerald-300"
                      : selectedCountdown.state === "expiring"
                        ? "text-amber-300"
                        : "text-zinc-500"
                }`}
              >
                {selectedCountdown.digital}
              </p>
              <div className="mx-auto mt-3 h-2 max-w-md overflow-hidden rounded-full bg-ink-850">
                <div
                  style={{ width: `${selectedCountdown.progressPct}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-brand-600 via-brand-400 to-emerald-400 transition-all duration-500"
                />
              </div>
              <p className="mt-2 font-mono text-[10.5px] text-zinc-400">
                Active for {formatElapsed(selectedCountdown.elapsedMs)} ·{" "}
                {selectedRecord.isLifetime
                  ? "Never expires"
                  : `${selectedCountdown.progressPct.toFixed(1)}% remaining`}
              </p>
            </div>

            {/* Complete Structured Details Table */}
            <div className="mt-4 overflow-hidden rounded-2xl border border-brand-200/10 bg-ink-950/70">
              <div className="divide-y divide-brand-200/[0.07] text-[12.5px]">
                <DetailRow
                  label="Target Scope"
                  value={
                    selectedRecord.targetType === "both"
                      ? "User Account + Discord Server (Guild)"
                      : selectedRecord.targetType === "guild"
                        ? "Discord Server (Guild) Only"
                        : "Discord User Account Only"
                  }
                />
                {selectedRecord.userId && (
                  <DetailRow
                    label="Discord User"
                    value={`${selectedRecord.globalName ? `${selectedRecord.globalName} ` : ""}(@${selectedRecord.username}) · ID: ${selectedRecord.userId}`}
                    copyValue={selectedRecord.userId}
                    copied={copiedKey === "uid"}
                    onCopy={() => void copyVal("uid", selectedRecord.userId!)}
                  />
                )}
                {selectedRecord.guildId && (
                  <DetailRow
                    label="Discord Server (Guild)"
                    value={`${selectedRecord.guildName} · ID: ${selectedRecord.guildId}`}
                    copyValue={selectedRecord.guildId}
                    copied={copiedKey === "gid"}
                    onCopy={() => void copyVal("gid", selectedRecord.guildId!)}
                  />
                )}
                <DetailRow
                  label="Plan & Tier"
                  value={`${selectedRecord.tierName} (${selectedRecord.tier.toUpperCase()}) · ${selectedRecord.maxServers} server slot(s)`}
                />
                <DetailRow
                  label="Granted By (Who Gave)"
                  value={`${selectedRecord.grantedBy} (ID: ${selectedRecord.grantedById})`}
                />
                <DetailRow
                  label="Price & Currency"
                  value={
                    selectedRecord.currencyCode === "FREE" ||
                    selectedRecord.pricePaid === 0
                      ? "Free / Gifted (0)"
                      : `${selectedRecord.currencySymbol}${selectedRecord.pricePaid.toLocaleString("en-IN")} ${selectedRecord.currencyCode}`
                  }
                />
                <DetailRow
                  label="Payment / Grant Source"
                  value={
                    selectedRecord.paymentReference
                      ? `${selectedRecord.paymentMethod} · Ref: ${selectedRecord.paymentReference}`
                      : selectedRecord.paymentMethod
                  }
                />
                <DetailRow
                  label="Total Duration"
                  value={selectedRecord.durationLabel}
                />
                <DetailRow
                  label="Activated At"
                  value={formatExactDateTime(selectedRecord.startedAt)}
                />
                <DetailRow
                  label="Expires At"
                  value={formatExactDateTime(selectedRecord.expiresAt)}
                />
                {selectedRecord.invoiceId && (
                  <DetailRow
                    label="Linked Invoice"
                    value={selectedRecord.invoiceId}
                    copyValue={selectedRecord.invoiceId}
                    copied={copiedKey === "inv"}
                    onCopy={() =>
                      void copyVal("inv", selectedRecord.invoiceId!)
                    }
                  />
                )}
                {selectedRecord.ticketId && (
                  <DetailRow
                    label="Support Ticket"
                    value={selectedRecord.ticketId}
                  />
                )}
                <DetailRow
                  label="Enabled Perks"
                  value={
                    [
                      selectedRecord.perks.noPrefix && "No-Prefix",
                      selectedRecord.perks.vanityGuard && "Vanity Guard",
                      selectedRecord.perks.antiBetray && "Anti-Betray",
                      selectedRecord.perks.customBot && "Custom Branded Bot",
                      selectedRecord.perks.prioritySupport && "24/7 Support",
                    ]
                      .filter(Boolean)
                      .join(" · ") || "Standard Protection"
                  }
                />
                {selectedRecord.notes && (
                  <DetailRow label="Admin Notes" value={selectedRecord.notes} />
                )}
                {selectedRecord.status === "revoked" && (
                  <DetailRow
                    label="Revoked Info"
                    value={`By ${selectedRecord.revokedBy || "Owner"} on ${formatExactDateTime(selectedRecord.revokedAt)}${selectedRecord.revokeReason ? ` — Reason: ${selectedRecord.revokeReason}` : ""}`}
                  />
                )}
                <DetailRow
                  label="Last Updated"
                  value={formatExactDateTime(selectedRecord.updatedAt)}
                />
              </div>
            </div>

            {/* Quick Extend Time Buttons */}
            <div className="mt-4 rounded-xl border border-brand-200/10 bg-ink-950/60 p-3.5">
              <p className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-zinc-400">
                Quick Extend / Add Time
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {[7, 30, 90, 365].map((days) => (
                  <button
                    key={days}
                    type="button"
                    disabled={busyKey !== null}
                    onClick={() =>
                      void callApi(
                        `ext-${days}`,
                        { action: "extend", id: selectedRecord.id, addDays: days },
                        `Extended ${selectedRecord.id} by +${days} days!`,
                      )
                    }
                    className="rounded-lg border border-brand-400/35 bg-brand-500/12 px-3 py-1.5 font-mono text-[11px] font-medium text-brand-200 hover:bg-brand-500/25 hover:text-white disabled:opacity-40"
                  >
                    +{days} Days
                  </button>
                ))}
              </div>
            </div>

            {/* Revoke & Permanently Delete Controls */}
            <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
              {selectedRecord.status === "active" && (
                <div className="flex flex-1 gap-2">
                  <input
                    type="text"
                    value={revokeReason}
                    onChange={(e) => setRevokeReason(e.target.value)}
                    placeholder="Optional revoke reason…"
                    className="input-aqua flex-1 text-[12px]"
                  />
                  <button
                    type="button"
                    disabled={busyKey !== null}
                    onClick={() =>
                      void callApi(
                        "revoke",
                        {
                          action: "revoke",
                          id: selectedRecord.id,
                          reason: revokeReason,
                        },
                        `Revoked Premium access on ${selectedRecord.id}.`,
                      )
                    }
                    className="h-10 shrink-0 rounded-xl border border-amber-400/40 bg-amber-500/15 px-3.5 text-[12px] font-semibold text-amber-200 hover:bg-amber-500/25 disabled:opacity-40"
                  >
                    Revoke
                  </button>
                </div>
              )}

              <button
                type="button"
                disabled={busyKey !== null}
                onClick={async () => {
                  const id = selectedRecord.id;
                  const ok = await callApi(
                    `delm-${id}`,
                    { action: "delete", id },
                    `Permanently deleted record ${id}.`,
                  );
                  if (ok) setSelectedRecordId(null);
                }}
                className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-brand-200/15 bg-ink-950 px-4 text-[12px] font-medium text-zinc-300 hover:border-amber-400/50 hover:text-amber-200 disabled:opacity-40"
              >
                <TrashIcon className="size-3.5" />
                Remove Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Separated Invoices Tab — View, Verify, Download & 1-Click Activate Customer Invoices */
export function InvoicesAdminTab({
  invoices,
  siteConfig,
  onCustomizeGrant,
  onReload,
}: {
  invoices: PremiumInvoice[];
  siteConfig: SiteConfig;
  onCustomizeGrant: (inv: PremiumInvoice) => void;
  onReload: () => Promise<void>;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInv, setSelectedInv] = useState<PremiumInvoice | null>(null);
  const [ticketInput, setTicketInput] = useState("");
  const [refInput, setRefInput] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return invoices.filter((i) => {
      if (statusFilter !== "all" && i.status !== statusFilter) return false;
      if (!q) return true;
      return (
        i.invoiceId.toLowerCase().includes(q) ||
        i.verificationCode.toLowerCase().includes(q) ||
        i.username.toLowerCase().includes(q) ||
        i.userId.includes(q) ||
        (i.guildName && i.guildName.toLowerCase().includes(q)) ||
        (i.guildId && i.guildId.includes(q))
      );
    });
  }, [invoices, search, statusFilter]);

  const runAction = async (
    key: string,
    payload: Record<string, unknown>,
    okText: string,
  ) => {
    setBusy(key);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/premium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setMsg({ ok: false, text: json.error || "Action failed." });
        return false;
      }
      setMsg({ ok: true, text: okText });
      await onReload();
      return true;
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      {msg && (
        <div
          className={`rounded-xl border px-4 py-3 font-mono text-[11.5px] ${
            msg.ok
              ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-300"
              : "border-amber-400/35 bg-amber-500/10 text-amber-200"
          }`}
        >
          {msg.text}
        </div>
      )}

      <div className="grid gap-2.5 sm:grid-cols-[1fr_240px]">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-brand-400/75" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Verify by Invoice ID, Verify Code (VRF-...), username, or User ID…"
            className="input-aqua pl-10"
          />
        </div>
        <CustomSelect
          title="Filter Invoices"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "all", label: "All Invoices" },
            { value: "pending_ticket", label: "Pending Ticket Payment" },
            { value: "fulfilled", label: "Fulfilled & Activated" },
            { value: "cancelled", label: "Cancelled" },
          ]}
        />
      </div>

      <div className="panel panel-inner overflow-hidden rounded-2xl shadow-panel">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-[13px] text-zinc-400">
            <InvoiceIcon className="mx-auto size-7 text-brand-400/50" />
            <p className="mt-2.5">
              No invoices found. Whenever a buyer selects a plan on{" "}
              <code className="text-brand-300">/premium</code>, their verified
              invoice logs here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-[12.5px]">
              <thead>
                <tr className="border-b border-brand-200/[0.08] bg-ink-950/60 font-mono text-[9.5px] uppercase tracking-[0.18em] text-zinc-400">
                  <th className="px-4 py-3.5">Invoice &amp; Verify</th>
                  <th className="px-4 py-3.5">Date &amp; Time</th>
                  <th className="px-4 py-3.5">User &amp; Server</th>
                  <th className="px-4 py-3.5">Plan</th>
                  <th className="px-4 py-3.5">Amount</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-200/[0.06]">
                {filtered.map((inv) => {
                  const dt = formatInvoiceDateTime(inv.createdAt);
                  return (
                    <tr
                      key={inv.invoiceId}
                      onClick={() => {
                        setTicketInput("");
                        setRefInput("");
                        setSelectedInv(inv);
                      }}
                      className="cursor-pointer transition-colors hover:bg-brand-400/[0.05]"
                    >
                      <td className="px-4 py-3.5 font-mono">
                        <p className="text-[11.5px] font-semibold text-white">
                          {inv.invoiceId}
                        </p>
                        <p className="text-[10px] text-brand-300">
                          {inv.verificationCode}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[11px]">
                        <p className="text-zinc-200">{dt.dateStr}</p>
                        <p className="text-[10px] text-zinc-500">{dt.timeStr}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-white">
                          @{inv.username}{" "}
                          <span className="font-mono text-[10px] font-normal text-zinc-500">
                            ({inv.userId})
                          </span>
                        </p>
                        <p className="font-mono text-[10px] text-zinc-400">
                          {inv.guildName
                            ? `Server: ${inv.guildName}`
                            : "Server: Assign in ticket"}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-brand-200">
                          {inv.tierName}
                        </p>
                        <p className="font-mono text-[10px] text-zinc-500">
                          {inv.durationLabel}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 font-mono font-semibold text-white">
                        {inv.currencySymbol}
                        {inv.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 font-mono text-[9px] uppercase ${
                            inv.status === "fulfilled"
                              ? "bg-emerald-500/15 text-emerald-300"
                              : inv.status === "cancelled"
                                ? "bg-zinc-500/20 text-zinc-400"
                                : "bg-brand-500/20 text-brand-200"
                          }`}
                        >
                          {inv.status === "pending_ticket"
                            ? "Pending Ticket"
                            : inv.status}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3.5 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center gap-1.5">
                          {inv.status === "pending_ticket" && (
                            <button
                              type="button"
                              disabled={busy !== null}
                              onClick={() =>
                                void runAction(
                                  inv.invoiceId,
                                  {
                                    action: "fulfill_invoice",
                                    invoiceId: inv.invoiceId,
                                  },
                                  `Activated ${inv.tierName} for @${inv.username} from ${inv.invoiceId}!`,
                                )
                              }
                              className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-500 disabled:opacity-40"
                            >
                              Activate
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              void downloadInvoicePng(inv, siteConfig)
                            }
                            title="Download PNG"
                            className="rounded-lg border border-brand-200/15 p-1.5 text-brand-300 hover:border-brand-400 hover:text-white"
                          >
                            <DownloadIcon className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Detail Modal */}
      {selectedInv && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md sm:items-center sm:p-4"
          onClick={() => setSelectedInv(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="pb-safe max-h-[90vh] w-full max-w-lg animate-sheet-up overflow-y-auto rounded-t-3xl border-t border-brand-400/45 bg-ink-900 p-5 shadow-glow-lg sm:animate-pop-in sm:rounded-3xl sm:border sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-brand-300">
                  {selectedInv.verificationCode}
                </p>
                <h3 className="mt-0.5 font-display text-[20px] font-bold text-white">
                  {selectedInv.invoiceId}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInv(null)}
                className="flex size-8 items-center justify-center rounded-full border border-brand-200/15 text-zinc-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="mt-4 divide-y divide-brand-200/[0.07] overflow-hidden rounded-xl border border-brand-200/10 bg-ink-950/75 text-[12px]">
              <DetailRow
                label="Created"
                value={formatExactDateTime(selectedInv.createdAt)}
              />
              <DetailRow
                label="Customer"
                value={`${selectedInv.globalName || selectedInv.username} (@${selectedInv.username}) · ${selectedInv.userId}`}
              />
              {selectedInv.email && (
                <DetailRow label="Email" value={selectedInv.email} />
              )}
              <DetailRow
                label="Target Server"
                value={
                  selectedInv.guildId
                    ? `${selectedInv.guildName || "Server"} (${selectedInv.guildId})`
                    : "Not specified (ask in ticket)"
                }
              />
              <DetailRow
                label="Plan & Duration"
                value={`${selectedInv.tierName} · ${selectedInv.durationLabel}`}
              />
              <DetailRow
                label="Total Payable"
                value={`${selectedInv.currencySymbol}${selectedInv.amount.toLocaleString("en-IN")} ${selectedInv.currencyCode}`}
              />
              {selectedInv.buyerNote && (
                <DetailRow label="Buyer Note" value={selectedInv.buyerNote} />
              )}
              {selectedInv.fulfilledBy && (
                <DetailRow
                  label="Processed By"
                  value={`${selectedInv.fulfilledBy}${selectedInv.fulfilledAt ? ` · ${formatExactDateTime(selectedInv.fulfilledAt)}` : ""}`}
                />
              )}
            </div>

            {selectedInv.status === "pending_ticket" && (
              <div className="mt-4 space-y-2.5">
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    type="text"
                    value={ticketInput}
                    onChange={(e) => setTicketInput(e.target.value)}
                    placeholder="Ticket ID (e.g. #ticket-092)"
                    className="input-aqua font-mono text-[12px]"
                  />
                  <input
                    type="text"
                    value={refInput}
                    onChange={(e) => setRefInput(e.target.value)}
                    placeholder="Payment ref / note (optional)"
                    className="input-aqua font-mono text-[12px]"
                  />
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={async () => {
                      const ok = await runAction(
                        "fulfill-m",
                        {
                          action: "fulfill_invoice",
                          invoiceId: selectedInv.invoiceId,
                          ticketId: ticketInput,
                          paymentReference: refInput,
                        },
                        `Premium granted to @${selectedInv.username}!`,
                      );
                      if (ok) setSelectedInv(null);
                    }}
                    className="h-10 rounded-xl bg-emerald-600 text-[12.5px] font-semibold text-white hover:bg-emerald-500 disabled:opacity-40"
                  >
                    Payment Done · Activate
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const inv = selectedInv;
                      setSelectedInv(null);
                      onCustomizeGrant(inv);
                    }}
                    className="h-10 rounded-xl border border-brand-400/40 bg-brand-500/15 text-[12.5px] font-medium text-brand-200 hover:text-white"
                  >
                    Customize Before Granting
                  </button>
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-brand-200/10 pt-3.5">
              <button
                type="button"
                onClick={() => void downloadInvoicePng(selectedInv, siteConfig)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200/15 px-3 py-1.5 font-mono text-[10.5px] text-brand-300 hover:text-white"
              >
                <DownloadIcon className="size-3.5" />
                Download Invoice PNG
              </button>
              <div className="flex gap-2">
                {selectedInv.status === "pending_ticket" && (
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={async () => {
                      const ok = await runAction(
                        "cancel-m",
                        {
                          action: "cancel_invoice",
                          invoiceId: selectedInv.invoiceId,
                        },
                        `Cancelled ${selectedInv.invoiceId}.`,
                      );
                      if (ok) setSelectedInv(null);
                    }}
                    className="rounded-lg border border-brand-200/15 px-3 py-1.5 font-mono text-[10.5px] text-zinc-400 hover:text-white"
                  >
                    Cancel Invoice
                  </button>
                )}
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={async () => {
                    const ok = await runAction(
                      "del-inv",
                      {
                        action: "delete_invoice",
                        invoiceId: selectedInv.invoiceId,
                      },
                      `Deleted invoice ${selectedInv.invoiceId}.`,
                    );
                    if (ok) setSelectedInv(null);
                  }}
                  className="rounded-lg border border-brand-200/15 p-1.5 text-zinc-400 hover:text-amber-300"
                >
                  <TrashIcon className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1.5 block font-mono text-[9.5px] uppercase tracking-[0.2em] text-zinc-400">
      {children}
    </span>
  );
}

function StatusPill({
  state,
}: {
  state: "lifetime" | "active" | "expiring" | "expired" | "revoked";
}) {
  const styles =
    state === "lifetime"
      ? "border-brand-400/45 bg-brand-500/20 text-brand-200"
      : state === "active"
        ? "border-emerald-400/35 bg-emerald-500/15 text-emerald-300"
        : state === "expiring"
          ? "border-amber-400/40 bg-amber-500/15 text-amber-200"
          : "border-zinc-600/40 bg-zinc-800/70 text-zinc-400";

  const label =
    state === "expiring"
      ? "Expiring"
      : state.charAt(0).toUpperCase() + state.slice(1);

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider ${styles}`}
    >
      {label}
    </span>
  );
}

function DetailRow({
  label,
  value,
  copyValue,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  copyValue?: string;
  copied?: boolean;
  onCopy?: () => void;
}) {
  return (
    <div className="flex flex-col justify-between gap-1 px-4 py-2.5 sm:flex-row sm:items-center sm:gap-4">
      <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </span>
      <div className="flex min-w-0 items-center gap-2 sm:text-right">
        <span className="break-all text-zinc-100">{value}</span>
        {copyValue && onCopy && (
          <button
            type="button"
            onClick={onCopy}
            className="shrink-0 rounded border border-brand-200/15 px-1.5 py-0.5 font-mono text-[9.5px] text-brand-300 hover:text-white"
          >
            {copied ? "✓" : <CopyIcon className="size-3" />}
          </button>
        )}
      </div>
    </div>
  );
}
