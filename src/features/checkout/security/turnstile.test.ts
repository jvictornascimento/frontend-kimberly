import { afterEach, describe, expect, it, vi } from "vitest";
import { startChallenge, type Turnstile } from "./turnstile";

function provider() {
  const options: Record<string, unknown>[] = [];
  const api: Turnstile = {
    render: vi.fn((_container, config) => {
      options.push(config);
      return String(options.length);
    }),
    execute: vi.fn(),
    remove: vi.fn(),
  };
  const fire = (index: number, name: string, token?: string) =>
    (options[index]![name] as (value?: string) => void)(token);
  return { api, options, fire };
}
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("Turnstile operation challenges", () => {
  it("uses a fresh widget and action for order and payment without persisting response fields", async () => {
    const { api, options, fire } = provider();
    const container = {} as HTMLElement;
    const order = startChallenge(api, container, "test-sitekey", "checkout_order");
    fire(0, "callback", "order-token");
    expect(await order.token).toBe("order-token");
    order.dispose();
    order.dispose();
    const payment = startChallenge(api, container, "test-sitekey", "checkout_payment");
    fire(1, "callback", "payment-token");
    expect(await payment.token).toBe("payment-token");
    expect(options[0]).toMatchObject({
      action: "checkout_order",
      execution: "execute",
      appearance: "interaction-only",
      "response-field": false,
    });
    expect(options[1]).toMatchObject({ action: "checkout_payment" });
    expect(api.execute).toHaveBeenNthCalledWith(1, "1");
    expect(api.execute).toHaveBeenNthCalledWith(2, "2");
    expect(api.remove).toHaveBeenCalledTimes(1);
    payment.dispose();
  });
  it("can keep the pre-check widget visible while the customer verifies", async () => {
    const { api, options, fire } = provider();
    const challenge = startChallenge(
      api,
      {} as HTMLElement,
      "test-sitekey",
      "checkout_order",
      "always",
    );
    fire(0, "callback", "order-token");
    await expect(challenge.token).resolves.toBe("order-token");
    expect(options[0]).toMatchObject({ appearance: "always", action: "checkout_order" });
    challenge.dispose();
  });
  it("rejects failures, expiry, timeout and unmount cancellation and allows a new challenge", async () => {
    for (const event of ["error-callback", "expired-callback", "timeout-callback", "dispose"]) {
      const { api, fire } = provider();
      const challenge = startChallenge(api, {} as HTMLElement, "test", "checkout_order");
      const result = expect(challenge.token).rejects.toThrow("verificação");
      if (event === "dispose") challenge.dispose();
      else fire(0, event);
      await result;
      challenge.dispose();
      challenge.dispose();
      expect(api.remove).toHaveBeenCalledTimes(1);
      const next = startChallenge(api, {} as HTMLElement, "test", "checkout_order");
      fire(1, "callback", "new-token");
      expect(await next.token).toBe("new-token");
      next.dispose();
    }
  });
  it("expires without real sleeps and ignores late success callbacks", async () => {
    vi.useFakeTimers();
    const { api, fire } = provider();
    const challenge = startChallenge(api, {} as HTMLElement, "test", "checkout_order");
    const result = expect(challenge.token).rejects.toThrow("verificação");
    await vi.advanceTimersByTimeAsync(120000);
    await result;
    fire(0, "callback", "late-token");
    challenge.dispose();
  });
  it("sanitizes SDK failures and clears its timeout", async () => {
    vi.useFakeTimers();
    const { api } = provider();
    vi.mocked(api.render).mockImplementation(() => {
      throw new Error("private");
    });
    const challenge = startChallenge(api, {} as HTMLElement, "test", "checkout_order");
    await expect(challenge.token).rejects.toThrow("verificação");
    expect(vi.getTimerCount()).toBe(0);
    challenge.dispose();
  });
});

describe("Turnstile SDK loading", () => {
  it("shares a single script load and permits retries after network failure", async () => {
    vi.resetModules();
    const scripts: Array<Record<string, unknown>> = [];
    const browser: { turnstile?: Turnstile } = {};
    vi.stubGlobal("window", browser);
    vi.stubGlobal("document", {
      createElement: () => ({ remove: vi.fn() }),
      head: { appendChild: (script: Record<string, unknown>) => scripts.push(script) },
    });
    const { loadTurnstile } = await import("./turnstile");
    const first = loadTurnstile();
    expect(loadTurnstile()).toBe(first);
    const failed = expect(first).rejects.toThrow("carregar");
    (scripts[0]!["onerror"] as () => void)();
    await failed;
    const next = loadTurnstile();
    expect(scripts).toHaveLength(2);
    browser.turnstile = provider().api;
    (scripts[1]!["onload"] as () => void)();
    expect(await next).toBe(browser.turnstile);
    expect(await loadTurnstile()).toBe(browser.turnstile);
  });
});
