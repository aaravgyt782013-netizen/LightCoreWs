import crypto from "node:crypto";
import { defaultLogs, type LogEntry } from "@/lib/site";

const MAX_LOGS = 100;

type GlobalStore = typeof globalThis & {
  __lightcoreLogs?: LogEntry[];
};

function getBuffer(): LogEntry[] {
  const g = globalThis as GlobalStore;
  if (!g.__lightcoreLogs) {
    g.__lightcoreLogs = [];
  }
  return g.__lightcoreLogs;
}

export function verifyBearerSecret(
  authHeader: string | null,
  expected: string | undefined,
): boolean {
  if (!expected || !authHeader) return false;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return false;
  const a = Buffer.from(match[1].trim(), "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function sanitizeLogInput(input: unknown): LogEntry | null {
  if (!input || typeof input !== "object") return null;
  const rec = input as Record<string, unknown>;
  const rawType = typeof rec.t === "string" ? rec.t : rec.type;
  const rawMsg = typeof rec.msg === "string" ? rec.msg : rec.message;
  if (typeof rawMsg !== "string" || !rawMsg.trim()) return null;

  const tag =
    typeof rawType === "string" && rawType.trim()
      ? rawType
          .trim()
          .toUpperCase()
          .replace(/[^A-Z0-9_-]/g, "")
          .slice(0, 10) || "LOG"
      : "LOG";

  const ok =
    typeof rec.ok === "boolean"
      ? rec.ok
      : !["WARN", "DENY", "BLOCK", "ERR", "ERROR", "ALERT"].includes(tag);

  const entry: LogEntry = {
    id: crypto.randomUUID(),
    t: tag,
    ok,
    msg: rawMsg.trim().slice(0, 240),
    ts: new Date().toISOString(),
  };

  if (typeof rec.guild === "string" && rec.guild.trim()) {
    entry.guild = rec.guild.trim().slice(0, 100);
  }
  if (typeof rec.guildId === "string" && /^\d{15,22}$/.test(rec.guildId.trim())) {
    entry.guildId = rec.guildId.trim();
  }

  return entry;
}

export function appendLogs(entries: LogEntry[]): void {
  const buf = getBuffer();
  buf.push(...entries);
  if (buf.length > MAX_LOGS) {
    buf.splice(0, buf.length - MAX_LOGS);
  }
}

export function clearLogs(): void {
  const buf = getBuffer();
  buf.length = 0;
}

export function getRawLogCount(): number {
  return getBuffer().length;
}

export async function getLogs(options?: {
  guildId?: string;
  includePrivate?: boolean;
  limit?: number;
}): Promise<{ live: boolean; logs: LogEntry[] }> {
  const limit = Math.min(Math.max(options?.limit ?? 25, 1), MAX_LOGS);
  const botApiUrl = process.env.BOT_API_URL?.replace(/\/+$/, "");

  if (botApiUrl) {
    try {
      const endpoint = new URL(`${botApiUrl}/logs`);
      endpoint.searchParams.set("limit", String(limit));
      if (options?.guildId) {
        endpoint.searchParams.set("guildId", options.guildId);
      }
      const headers: Record<string, string> = { Accept: "application/json" };
      if (process.env.BOT_API_KEY) {
        headers.Authorization = `Bearer ${process.env.BOT_API_KEY}`;
      }
      const res = await fetch(endpoint.toString(), {
        headers,
        cache: "no-store",
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        const data = (await res.json()) as unknown;
        const list = Array.isArray(data)
          ? data
          : data &&
              typeof data === "object" &&
              Array.isArray((data as { logs?: unknown[] }).logs)
            ? (data as { logs: unknown[] }).logs
            : [];
        const parsed = list
          .map(sanitizeLogInput)
          .filter((x): x is LogEntry => x !== null);
        if (parsed.length > 0) {
          return {
            live: true,
            logs: options?.includePrivate
              ? parsed.slice(-limit)
              : parsed.slice(-limit).map(stripPrivateFields),
          };
        }
      }
    } catch {
      // Fall back to in-memory buffer or default logs below.
    }
  }

  const buf = getBuffer();
  const filtered = options?.guildId
    ? buf.filter((l) => l.guildId === options.guildId)
    : options?.includePrivate
      ? buf
      : buf.filter((l) => !l.guildOnly);

  if (filtered.length > 0) {
    const slice = filtered.slice(-limit);
    return {
      live: true,
      logs: options?.includePrivate ? slice : slice.map(stripPrivateFields),
    };
  }

  if (options?.guildId) {
    return { live: false, logs: [] };
  }

  return { live: false, logs: defaultLogs };
}

function stripPrivateFields(entry: LogEntry): LogEntry {
  return {
    id: entry.id,
    t: entry.t,
    ok: entry.ok,
    msg: entry.msg,
    ts: entry.ts,
  };
}
