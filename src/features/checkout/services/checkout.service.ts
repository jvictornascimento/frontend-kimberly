/**
 * Checkout service layer. Components/hooks call only these functions.
 * Each operation answers with mocks while USE_MOCKS is true.
 */
import { MAX_INSTALLMENTS, USE_MOCKS } from "../config";
import { computeTotals } from "../domain/pricing";
import { LOCAL_DELIVERY_OPTION, isPedreiraSP } from "../domain/shipping-rules";
import {
  MOCK_PEDREIRA_ADDRESS,
  MOCK_PEDREIRA_ZIP_PREFIX,
  MOCK_SHIPPING_OPTIONS,
  MOCK_ZIP_CODES,
  MOCK_ZIP_NO_SHIPPING,
  MOCK_ZIP_SHIPPING_ERROR,
  mockCardPayment,
  mockDelay,
  mockInstallmentOptions,
  mockOrderId,
  mockPaymentStatus,
  mockPixPayment,
} from "../mocks";
import type {
  AddressLookup,
  CreateOrderInput,
  CreatePaymentInput,
  InstallmentOption,
  Order,
  Payment,
  PaymentStatus,
  ShippingOption,
  ShippingQuoteInput,
} from "../types";
import { ENDPOINTS, apiRequest } from "./api-client";

export async function getAddressByZipCode(zipCode: string): Promise<AddressLookup | null> {
  if (!USE_MOCKS) {
    // TODO: Connect address lookup to BELYEVE API (backend proxies the CEP provider)
    return apiRequest<AddressLookup | null>(ENDPOINTS.address(zipCode));
  }
  await mockDelay(400);
  if (zipCode.startsWith(MOCK_PEDREIRA_ZIP_PREFIX)) return MOCK_PEDREIRA_ADDRESS;
  return MOCK_ZIP_CODES[zipCode] ?? null;
}

export async function calculateShipping(input: ShippingQuoteInput): Promise<ShippingOption[]> {
  if (!USE_MOCKS) {
    // TODO: Replace mock shipping service with BELYEVE API (backend quotes Melhor Envio + Pedreira rule)
    return apiRequest<ShippingOption[]>(ENDPOINTS.shippingQuote, { method: "POST", body: input });
  }
  await mockDelay();
  if (input.zipCode === MOCK_ZIP_SHIPPING_ERROR) throw new Error("Mock shipping failure");
  if (input.zipCode === MOCK_ZIP_NO_SHIPPING) return [];
  if (isPedreiraSP(input.city, input.state)) return [LOCAL_DELIVERY_OPTION];
  return MOCK_SHIPPING_OPTIONS;
}

export async function getInstallmentOptions(totalCents: number | null): Promise<InstallmentOption[]> {
  if (!USE_MOCKS) {
    // TODO: Retrieve installment values and fees from backend payment endpoint
    return apiRequest<InstallmentOption[]>(ENDPOINTS.installments, { method: "POST", body: { totalCents } });
  }
  await mockDelay(300);
  return mockInstallmentOptions(totalCents, MAX_INSTALLMENTS);
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  if (!USE_MOCKS) {
    // TODO: Connect order creation to backend
    return apiRequest<Order>(ENDPOINTS.orders, { method: "POST", body: input });
  }
  await mockDelay(900);
  const { shippingOptionId, ...rest } = input;
  const shipping =
    [LOCAL_DELIVERY_OPTION, ...MOCK_SHIPPING_OPTIONS].find((o) => o.id === shippingOptionId) ?? LOCAL_DELIVERY_OPTION;
  return {
    ...rest,
    id: mockOrderId(),
    status: "AWAITING_PAYMENT",
    shipping,
    totals: computeTotals(input.item.quantity, shipping),
    createdAt: new Date().toISOString(),
  };
}

export async function createPayment(input: CreatePaymentInput): Promise<Payment> {
  if (!USE_MOCKS) {
    // TODO: Replace payment mock with backend payment endpoint (card data must follow the gateway's secure flow)
    return apiRequest<Payment>(ENDPOINTS.payments, { method: "POST", body: input });
  }
  await mockDelay(900);
  if (input.method === "pix") return mockPixPayment(input.orderId);
  const options = mockInstallmentOptions(null, MAX_INSTALLMENTS);
  const installment = options.find((o) => o.installments === input.installments) ?? options[0]!;
  return mockCardPayment(input.orderId, installment);
}

export async function getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
  if (!USE_MOCKS) {
    // TODO: Retrieve payment status from backend (updated by Asaas webhooks)
    const result = await apiRequest<{ status: PaymentStatus }>(ENDPOINTS.paymentStatus(paymentId));
    return result.status;
  }
  await mockDelay(200);
  return mockPaymentStatus(paymentId);
}
