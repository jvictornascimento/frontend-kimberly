import { afterEach, expect, it, vi } from "vitest";
vi.mock("../config", () => ({ API_BASE_URL: "/api" }));
import { apiRequest, ApiError } from "./api-client";
afterEach(() => vi.unstubAllGlobals());
it("sends the challenge only as a header and exposes Retry-After without provider details", async () => {
  const request = vi.fn().mockResolvedValue(
    new Response('{"secret":"private-provider-error"}', {
      status: 429,
      headers: { "Retry-After": "95" },
    }),
  );
  vi.stubGlobal("fetch", request);
  const input = { orderId: "order", method: "pix" };
  try {
    await apiRequest("/payments", { method: "POST", body: input, turnstileToken: "one-use-token" });
    expect.fail("Expected rate limit error");
  } catch (error) {
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 429, retryAfter: 95 });
    expect((error as Error).message).not.toContain("private-provider-error");
  }
  expect(request).toHaveBeenCalledWith(
    "/api/payments",
    expect.objectContaining({
      headers: expect.objectContaining({ "X-Turnstile-Token": "one-use-token" }),
      body: JSON.stringify(input),
    }),
  );
});
