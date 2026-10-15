import { afterEach, describe, expect, it, vi } from "vitest";
import { remainingCooldown, retryAfterSeconds, startCooldown } from "./cooldown";

afterEach(() => vi.useRealTimers());
describe("checkout retry cooldown", () => {
  it("parses Retry-After seconds and dates with safe fallbacks", () => {
    const now = Date.UTC(2026, 9, 15, 12);
    expect(retryAfterSeconds("120", now)).toBe(120);
    expect(retryAfterSeconds(new Date(now + 90000).toUTCString(), now)).toBe(90);
    expect(retryAfterSeconds("bad", now)).toBe(120);
    expect(retryAfterSeconds(null, now)).toBe(120);
    expect(retryAfterSeconds("999999", now)).toBe(3600);
  });
  it("shares a countdown without clearing a longer block on a shorter response", () => {
    vi.useFakeTimers();
    vi.setSystemTime(Date.UTC(2030, 0, 1));
    startCooldown(120);
    expect(remainingCooldown()).toBe(120);
    vi.advanceTimersByTime(30000);
    startCooldown(10);
    expect(remainingCooldown()).toBe(90);
    vi.advanceTimersByTime(90000);
    expect(remainingCooldown()).toBe(0);
  });
});
