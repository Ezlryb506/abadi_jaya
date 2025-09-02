import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Simple in-memory fallback (for local dev or if Upstash env not set)
// Note: This is per-instance and not suitable for multi-instance production.
const memoryStore = new Map<string, { count: number; resetAt: number }>();

const hasUpstash = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

let ratelimit: Ratelimit | null = null;
if (hasUpstash) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '60 s'), // 5 requests per 60 seconds per key
    analytics: true,
    prefix: 'auth-guard',
  });
}

export type GuardResult = {
  ok: boolean;
  remaining: number;
  reset: number; // unix ms
};

export async function guardAllow(key: string): Promise<GuardResult> {
  const now = Date.now();
  if (ratelimit) {
    const res = await ratelimit.limit(key);
    return {
      ok: res.success,
      remaining: Math.max(0, res.remaining),
      reset: res.reset,
    };
  }

  // In-memory fallback: 5 per 60s
  const windowMs = 60_000;
  const max = 5;
  const entry = memoryStore.get(key);
  if (!entry || entry.resetAt <= now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: max - 1, reset: now + windowMs };
  }
  if (entry.count < max) {
    entry.count += 1;
    return { ok: true, remaining: max - entry.count, reset: entry.resetAt };
  }
  return { ok: false, remaining: 0, reset: entry.resetAt };
}
