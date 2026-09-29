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
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function apiRequest<T>(
  path: string,
  init: { method?: "GET" | "POST"; body?: unknown } = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: init.method ?? "GET",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  if (!response.ok) throw new ApiError(response.status, `Request failed with status ${response.status}`);
  return (await response.json()) as T;
}
