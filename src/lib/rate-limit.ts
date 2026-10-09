interface RateLimitOptions {
  interval: number; // in milliseconds
  maxRequests: number;
}

interface RateLimitTracker {
  count: number;
  resetAt: number;
}

const cache = new Map<string, RateLimitTracker>();

export function rateLimit(key: string, options: RateLimitOptions = { interval: 60000, maxRequests: 10 }) {
  const now = Date.now();
  const tracker = cache.get(key);

  if (!tracker || now > tracker.resetAt) {
    cache.set(key, {
      count: 1,
      resetAt: now + options.interval,
    });
    return {
      success: true,
      remaining: options.maxRequests - 1,
      resetAt: now + options.interval,
    };
  }

  if (tracker.count >= options.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetAt: tracker.resetAt,
    };
  }

  tracker.count += 1;
  return {
    success: true,
    remaining: options.maxRequests - tracker.count,
    resetAt: tracker.resetAt,
  };
}
