/**
 * Central checkout configuration.
 * Set VITE_API_BASE_URL to the BELYEVE backend URL to leave mock mode.
 */
const rawBaseUrl: unknown = import.meta.env["VITE_API_BASE_URL"];

export const API_BASE_URL = typeof rawBaseUrl === "string" ? rawBaseUrl.replace(/\/+$/, "") : "";

/** While no backend URL is configured, every service answers with mocks. */
export const USE_MOCKS = API_BASE_URL === "";

export const MAX_INSTALLMENTS = 3;
export const PAYMENT_STATUS_POLL_MS = 5000;
export const CHECKOUT_STORAGE_KEY = "belyeve-checkout-v1";
