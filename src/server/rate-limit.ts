const buckets = new Map<string, { count: number; expiresAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const existing = buckets.get(key);
  if (existing && existing.expiresAt > now) {
    if (existing.count >= limit) {
      return false;
    }
    existing.count += 1;
    return true;
  }
  buckets.set(key, { count: 1, expiresAt: now + windowMs });
  return true;
}
