import { describe, it, expect } from "vitest";
import { rateLimit } from "../../src/lib/rate-limit";

describe("Rate Limiter", () => {
  it("allows requests under the limit", () => {
    const key = `test_key_${Date.now()}`;
    const res1 = rateLimit(key, { interval: 10000, maxRequests: 2 });
    expect(res1.success).toBe(true);
    expect(res1.remaining).toBe(1);

    const res2 = rateLimit(key, { interval: 10000, maxRequests: 2 });
    expect(res2.success).toBe(true);
    expect(res2.remaining).toBe(0);
  });

  it("blocks requests over the limit", () => {
    const key = `blocked_key_${Date.now()}`;
    rateLimit(key, { interval: 10000, maxRequests: 1 });
    const blocked = rateLimit(key, { interval: 10000, maxRequests: 1 });
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
  });
});
