type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function checkRateLimit(identity: string) {
  const now = Date.now();
  const limit = Math.max(5, Number(process.env.RATE_LIMIT_PER_MINUTE || 30));
  const current = buckets.get(identity);
  if (!current || current.resetAt <= now) {
    buckets.set(identity, { count: 1, resetAt: now + 60_000 });
    return { allowed: true, remaining: limit - 1, retryAfter: 0 };
  }
  if (current.count >= limit) {
    return { allowed: false, remaining: 0, retryAfter: Math.ceil((current.resetAt - now) / 1_000) };
  }
  current.count += 1;
  return { allowed: true, remaining: limit - current.count, retryAfter: 0 };
}
