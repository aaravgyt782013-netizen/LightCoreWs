import fs from "node:fs/promises";
import path from "node:path";
import { getStore } from "@netlify/blobs";

const STORE_NAME = "lightcore-data-v1";
const DATA_DIR =
  process.env.LIGHTCORE_DATA_DIR?.trim() ||
  path.join(process.cwd(), ".cache");
const LOCAL_FILE = path.join(DATA_DIR, "lightcore-kv.json");

type MemoryGlobal = typeof globalThis & {
  __lightcoreKvMem?: Map<string, string>;
  __lightcoreKvLoaded?: boolean;
  __lightcoreKvWriteChain?: Promise<void>;
};

function getMemMap(): Map<string, string> {
  const g = globalThis as MemoryGlobal;
  if (!g.__lightcoreKvMem) {
    g.__lightcoreKvMem = new Map();
  }
  return g.__lightcoreKvMem;
}

function getNetlifyBlobStore() {
  // @netlify/blobs auto-configures inside Netlify Functions / OpenNext runtime,
  // or when NETLIFY_BLOBS_CONTEXT / (NETLIFY_SITE_ID + NETLIFY_AUTH_TOKEN) are set.
  const hasAutoContext = Boolean(
    process.env.NETLIFY_BLOBS_CONTEXT ||
      process.env.NETLIFY ||
      (globalThis as Record<string, unknown>).netlifyBlobsContext,
  );
  const siteID = process.env.NETLIFY_SITE_ID?.trim();
  const token = process.env.NETLIFY_AUTH_TOKEN?.trim();

  if (!hasAutoContext && !(siteID && token)) {
    return null;
  }

  try {
    if (siteID && token && !hasAutoContext) {
      return getStore({
        name: STORE_NAME,
        siteID,
        token,
        consistency: "strong",
      });
    }
    return getStore({ name: STORE_NAME, consistency: "strong" });
  } catch {
    return null;
  }
}

let diskAvailable = true;

async function ensureLocalLoaded(): Promise<Map<string, string>> {
  const g = globalThis as MemoryGlobal;
  const mem = getMemMap();
  if (g.__lightcoreKvLoaded || !diskAvailable) return mem;

  try {
    const raw = await fs.readFile(LOCAL_FILE, "utf8");
    const parsed = JSON.parse(raw) as Record<string, string>;
    if (parsed && typeof parsed === "object") {
      for (const [k, v] of Object.entries(parsed)) {
        if (typeof v === "string" && !mem.has(k)) {
          mem.set(k, v);
        }
      }
    }
  } catch (err) {
    const code = (err as NodeJS.ErrnoException)?.code;
    if (code && code !== "ENOENT") {
      diskAvailable = false;
    }
  }
  g.__lightcoreKvLoaded = true;
  return mem;
}

async function flushLocalDisk(): Promise<void> {
  if (!diskAvailable) return;
  const g = globalThis as MemoryGlobal;
  const mem = getMemMap();

  const writeOp = async () => {
    try {
      const dir = path.dirname(LOCAL_FILE);
      await fs.mkdir(dir, { recursive: true });
      const obj: Record<string, string> = {};
      for (const [k, v] of mem.entries()) {
        obj[k] = v;
      }
      const tmp = `${LOCAL_FILE}.tmp`;
      await fs.writeFile(tmp, JSON.stringify(obj), "utf8");
      await fs.rename(tmp, LOCAL_FILE);
    } catch {
      diskAvailable = false;
    }
  };

  g.__lightcoreKvWriteChain = (g.__lightcoreKvWriteChain ?? Promise.resolve()).then(
    writeOp,
    writeOp,
  );
  await g.__lightcoreKvWriteChain;
}

export function getStorageEngineName(): "netlify-blobs" | "local-disk" | "memory" {
  if (getNetlifyBlobStore()) return "netlify-blobs";
  return diskAvailable ? "local-disk" : "memory";
}

export async function kvGet<T>(key: string): Promise<T | null> {
  const blobs = getNetlifyBlobStore();
  if (blobs) {
    try {
      const val = (await blobs.get(key, { type: "json" })) as T | null;
      return val ?? null;
    } catch {
      // Fall through to local store if blobs context isn't active in build/dev.
    }
  }

  const mem = await ensureLocalLoaded();
  const raw = mem.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function kvSet<T>(key: string, value: T): Promise<void> {
  const serialized = JSON.stringify(value);
  const blobs = getNetlifyBlobStore();
  if (blobs) {
    try {
      await blobs.set(key, serialized);
      return;
    } catch {
      // Fall through to local fallback.
    }
  }

  const mem = await ensureLocalLoaded();
  mem.set(key, serialized);
  await flushLocalDisk();
}

export async function kvDelete(key: string): Promise<void> {
  const blobs = getNetlifyBlobStore();
  if (blobs) {
    try {
      await blobs.delete(key);
      return;
    } catch {
      // Fall through to local fallback.
    }
  }

  const mem = await ensureLocalLoaded();
  if (mem.delete(key)) {
    await flushLocalDisk();
  }
}

export async function kvListValues<T>(prefix: string, maxItems = 500): Promise<T[]> {
  const blobs = getNetlifyBlobStore();
  if (blobs) {
    try {
      const listed = await blobs.list({ prefix });
      const keys = listed.blobs.slice(0, maxItems).map((b) => b.key);
      const values = await Promise.all(
        keys.map(async (k) => {
          try {
            return ((await blobs.get(k, { type: "json" })) as T | null) ?? null;
          } catch {
            return null;
          }
        }),
      );
      const out: T[] = [];
      for (const v of values) {
        if (v !== null && v !== undefined) out.push(v as T);
      }
      return out;
    } catch {
      // Fall through to local fallback.
    }
  }

  const mem = await ensureLocalLoaded();
  const results: T[] = [];
  for (const [k, raw] of mem.entries()) {
    if (!k.startsWith(prefix)) continue;
    try {
      results.push(JSON.parse(raw) as T);
      if (results.length >= maxItems) break;
    } catch {
      // Skip malformed value.
    }
  }
  return results;
}
