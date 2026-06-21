// Deliberately simple: a Map with expiry timestamps. This resets whenever
// the server restarts, which is fine for an MVP — Phase 2 swaps this for
// a Prisma-backed cache table so it survives restarts and works across
// multiple server instances.

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export function getCached<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value as T;
}

export function setCached<T>(key: string, value: T, ttlMs: number): void {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export const TTL = {
  PROFILE: 5 * 60 * 1000, // 5 min — profile data changes as soon as the user solves something
} as const;
