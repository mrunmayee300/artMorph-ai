const memoryStore = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

function parseWindow(window: string): number {
  const match = window.match(/^(\d+)\s*(s|m|h)$/);
  if (!match) return 60_000;
  const value = parseInt(match[1], 10);
  const unit = match[2];
  if (unit === "s") return value * 1000;
  if (unit === "m") return value * 60_000;
  return value * 3_600_000;
}

export async function rateLimit(
  identifier: string,
  limit: number,
  window: string,
): Promise<RateLimitResult> {
  const windowMs = parseWindow(window);
  const now = Date.now();
  const key = `${identifier}:${window}`;
  const entry = memoryStore.get(key);

  if (!entry || entry.resetAt <= now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, reset: now + windowMs };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0, reset: entry.resetAt };
  }

  entry.count += 1;
  memoryStore.set(key, entry);
  return {
    success: true,
    remaining: limit - entry.count,
    reset: entry.resetAt,
  };
}
