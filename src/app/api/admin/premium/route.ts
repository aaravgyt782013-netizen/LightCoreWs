import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { requireOwner } from "@/lib/admin";
import {
  deletePremiumInvoice,
  deletePremiumRecord,
  extendPremiumRecord,
  getPremiumInvoice,
  grantPremiumRecord,
  revokePremiumRecord,
  updateInvoiceStatus,
  type CustomTimeUnit,
  type PremiumPerks,
  type PremiumTargetType,
  type PremiumTier,
} from "@/lib/premium-store";
import { appendLogs } from "@/lib/log-store";
import { sendDiscordLogEmbed } from "@/lib/discord-webhook";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = requireOwner(req);
  if (!auth.ok) return auth.response;

  let body: {
    action?: string;
    // Grant fields
    targetType?: PremiumTargetType;
    userId?: string;
    username?: string;
    globalName?: string;
    avatarUrl?: string;
    guildId?: string;
    guildName?: string;
    tier?: PremiumTier;
    customTierName?: string;
    durationPreset?: string;
    customAmount?: number;
    customUnit?: CustomTimeUnit;
    pricePaid?: number;
    currencyCode?: string;
    currencySymbol?: string;
    paymentMethod?: string;
    paymentReference?: string;
    invoiceId?: string;
    ticketId?: string;
    grantedBy?: string;
    maxServers?: number;
    perks?: Partial<PremiumPerks>;
    notes?: string;
    // Modify / Remove fields
    id?: string;
    addDays?: number;
    reason?: string;
  };

  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const ownerLabel =
    auth.session.user.globalName
      ? `${auth.session.user.globalName} (@${auth.session.user.username})`
      : `@${auth.session.user.username}`;

  // 1. Add User / Guild / Both to Premium
  if (body.action === "grant") {
    const targetType: PremiumTargetType = ["user", "guild", "both"].includes(
      body.targetType as string,
    )
      ? (body.targetType as PremiumTargetType)
      : "user";

    const tier: PremiumTier = ["plus", "pro", "ultra"].includes(
      body.tier as string,
    )
      ? (body.tier as PremiumTier)
      : "pro";

    const result = await grantPremiumRecord({
      targetType,
      userId: body.userId,
      username: body.username,
      globalName: body.globalName,
      avatarUrl: body.avatarUrl,
      guildId: body.guildId,
      guildName: body.guildName,
      tier,
      customTierName: body.customTierName,
      durationPreset: body.durationPreset || "30d",
      customAmount: body.customAmount,
      customUnit: body.customUnit,
      pricePaid: Number(body.pricePaid) || 0,
      currencyCode: body.currencyCode,
      currencySymbol: body.currencySymbol,
      paymentMethod: body.paymentMethod,
      paymentReference: body.paymentReference,
      invoiceId: body.invoiceId,
      ticketId: body.ticketId,
      grantedBy: (body.grantedBy || "").trim() || ownerLabel,
      grantedById: auth.session.user.id,
      maxServers: body.maxServers,
      perks: body.perks,
      notes: body.notes,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const r = result.record;
    const targetDesc =
      r.targetType === "both"
        ? `@${r.username} (${r.userId}) + ${r.guildName} (${r.guildId})`
        : r.targetType === "guild"
          ? `server ${r.guildName} (${r.guildId})`
          : `@${r.username} (${r.userId})`;

    await appendLogs([
      {
        id: crypto.randomUUID(),
        t: "PREMIUM",
        ok: true,
        msg: `granted ${r.tierName} (${r.durationLabel}) to ${targetDesc} by ${r.grantedBy}`,
        guildId: r.guildId ?? undefined,
        guild: r.guildName ?? undefined,
        ts: r.startedAt,
      },
    ]);

    await sendDiscordLogEmbed({
      title: `${site.name} · Premium Activated`,
      description: `Granted **${r.tierName}** to ${targetDesc}.`,
      color: 0x10b981,
      timestamp: r.startedAt,
      fields: [
        { name: "Record ID", value: `\`${r.id}\``, inline: true },
        { name: "Duration", value: r.durationLabel, inline: true },
        {
          name: "Price",
          value:
            r.currencyCode === "FREE" || r.pricePaid === 0
              ? "Free / Gifted"
              : `${r.currencySymbol}${r.pricePaid} ${r.currencyCode}`,
          inline: true,
        },
        { name: "Granted By", value: r.grantedBy, inline: true },
        { name: "Method", value: r.paymentMethod, inline: true },
        {
          name: "Expires",
          value: r.expiresAt
            ? new Date(r.expiresAt).toUTCString()
            : "Lifetime (Never)",
          inline: true,
        },
      ],
    });

    return NextResponse.json({ ok: true, record: r }, { status: 201 });
  }

  // 2. 1-Click Fulfill Invoice -> Grant Premium Automatically
  if (body.action === "fulfill_invoice") {
    const invoiceId = (body.invoiceId || "").trim();
    const inv = await getPremiumInvoice(invoiceId);
    if (!inv) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    }
    if (inv.status === "fulfilled") {
      return NextResponse.json(
        { error: "This invoice is already fulfilled." },
        { status: 400 },
      );
    }

    const durationPreset =
      inv.cycle === "3m" ? "90d" : inv.cycle === "1y" ? "365d" : "30d";

    const result = await grantPremiumRecord({
      targetType: inv.guildId ? "both" : "user",
      userId: inv.userId,
      username: inv.username,
      globalName: inv.globalName,
      avatarUrl: inv.avatarUrl,
      guildId: inv.guildId,
      guildName: inv.guildName,
      tier: inv.tier,
      durationPreset,
      pricePaid: inv.amount,
      currencyCode: inv.currencyCode,
      currencySymbol: inv.currencySymbol,
      paymentMethod: "Support Ticket QR",
      paymentReference: body.paymentReference || null,
      invoiceId: inv.invoiceId,
      ticketId: body.ticketId || null,
      grantedBy: (body.grantedBy || "").trim() || ownerLabel,
      grantedById: auth.session.user.id,
      notes:
        body.notes ||
        (inv.buyerNote ? `Buyer note: ${inv.buyerNote}` : `Fulfilled from ${inv.invoiceId}`),
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    await appendLogs([
      {
        id: crypto.randomUUID(),
        t: "PREMIUM",
        ok: true,
        msg: `invoice ${inv.invoiceId} fulfilled -> ${result.record.tierName} granted to @${inv.username} by ${result.record.grantedBy}`,
        ts: new Date().toISOString(),
      },
    ]);

    return NextResponse.json({ ok: true, record: result.record });
  }

  // 3. Extend Time on Existing Record
  if (body.action === "extend") {
    const id = (body.id || "").trim();
    const addDays = Number(body.addDays) || 30;
    const updated = await extendPremiumRecord({
      id,
      addDays,
      actor: ownerLabel,
    });
    if (!updated) {
      return NextResponse.json(
        { error: "Premium record not found." },
        { status: 404 },
      );
    }
    await appendLogs([
      {
        id: crypto.randomUUID(),
        t: "PREMIUM",
        ok: true,
        msg: `extended ${updated.id} by +${addDays}d (${ownerLabel})`,
        ts: new Date().toISOString(),
      },
    ]);
    return NextResponse.json({ ok: true, record: updated });
  }

  // 4. Revoke Premium (keeps audit record in table)
  if (body.action === "revoke") {
    const id = (body.id || "").trim();
    const updated = await revokePremiumRecord({
      id,
      actor: ownerLabel,
      reason: body.reason,
    });
    if (!updated) {
      return NextResponse.json(
        { error: "Premium record not found." },
        { status: 404 },
      );
    }
    await appendLogs([
      {
        id: crypto.randomUUID(),
        t: "PREMIUM",
        ok: false,
        msg: `revoked premium ${updated.id} (${updated.username ? `@${updated.username}` : updated.guildName}) by ${ownerLabel}`,
        ts: new Date().toISOString(),
      },
    ]);
    return NextResponse.json({ ok: true, record: updated });
  }

  // 5. Permanently Remove Premium Record
  if (body.action === "delete") {
    const id = (body.id || "").trim();
    const ok = await deletePremiumRecord(id);
    if (!ok) {
      return NextResponse.json(
        { error: "Premium record not found." },
        { status: 404 },
      );
    }
    await appendLogs([
      {
        id: crypto.randomUUID(),
        t: "PREMIUM",
        ok: false,
        msg: `removed premium record ${id} by ${ownerLabel}`,
        ts: new Date().toISOString(),
      },
    ]);
    return NextResponse.json({ ok: true });
  }

  // 6. Cancel or Delete Invoice
  if (body.action === "cancel_invoice") {
    const updated = await updateInvoiceStatus({
      invoiceId: (body.invoiceId || "").trim(),
      status: "cancelled",
      actor: ownerLabel,
    });
    if (!updated) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, invoice: updated });
  }

  if (body.action === "delete_invoice") {
    const ok = await deletePremiumInvoice((body.invoiceId || "").trim());
    if (!ok) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
}
