import { retryAfterSeconds, startCooldown } from "../security/cooldown";
import { API_BASE_URL } from "../config";

/**
 * Reference contract for the future BELYEVE backend.
 * Paths are a suggestion — adjust here only, never in components.
 */
export const ENDPOINTS = {
  orders: "/orders",
  order: (id: string) => `/orders/${encodeURIComponent(id)}`,
  shippingQuote: "/shipping/quote",
  payments: "/payments",
  paymentStatus: (id: string) => `/payments/${encodeURIComponent(id)}/status`,
  installments: "/payments/installments",
  address: (zipCode: string) => `/addresses/${encodeURIComponent(zipCode)}`,
} as const;

export class ApiError extends Error {
  readonly status: number;
  constructor(
    status: number,
    message: string,
    readonly retryAfter?: number,
  ) {
    super(message);
    this.status = status;
  }
}

export async function apiRequest<T>(
  path: string,
  init: { method?: "GET" | "POST"; body?: unknown; turnstileToken?: string | undefined } = {},
): Promise<T> {
  const request: RequestInit = {
    method: init.method ?? "GET",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
  };
  if (init.turnstileToken) {
    (request.headers as Record<string, string>)["X-Turnstile-Token"] = init.turnstileToken;
  }
  if (init.body !== undefined) request.body = JSON.stringify(init.body);
  const response = await fetch(`${API_BASE_URL}${path}`, request);
  if (!response.ok) {
    const retryAfter =
      response.status === 429 ? retryAfterSeconds(response.headers.get("Retry-After")) : undefined;
    if (retryAfter) startCooldown(retryAfter);
    throw new ApiError(
      response.status,
      `Request failed with status ${response.status}`,
      retryAfter,
    );
  }
  return (await response.json()) as T;
}
