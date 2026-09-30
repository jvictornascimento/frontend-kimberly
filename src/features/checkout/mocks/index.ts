/**
 * ALL development mocks for the checkout live here.
 * Nothing in this file is real: shipping prices, PIX codes and order ids are fake.
 * Scoop prices are NOT mocked — they come from src/data/scoops.ts (null = "Valor em breve").
 */
import type {
  AddressLookup,
  CardPayment,
  InstallmentOption,
  PaymentStatus,
  PixPayment,
  ShippingOption,
} from "../types";

export const MOCK_LATENCY_MS = 700;

export function mockDelay(ms = MOCK_LATENCY_MS) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

/** Mock address lookup. Any CEP starting with 13920 resolves to Pedreira/SP. */
export const MOCK_PEDREIRA_ZIP_PREFIX = "13920";
export const MOCK_ZIP_CODES: Record<string, AddressLookup> = {
  "01310100": {
    street: "Avenida Paulista",
    district: "Bela Vista",
    city: "São Paulo",
    state: "SP",
  },
  "20040002": {
    street: "Rua da Assembleia",
    district: "Centro",
    city: "Rio de Janeiro",
    state: "RJ",
  },
};
export const MOCK_PEDREIRA_ADDRESS: AddressLookup = {
  street: "",
  district: "",
  city: "Pedreira",
  state: "SP",
};

/** CEPs that simulate edge states in the shipping quote. */
export const MOCK_ZIP_SHIPPING_ERROR = "99999999";
export const MOCK_ZIP_NO_SHIPPING = "69999999";

export const MOCK_SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: "mock-correios-pac",
    kind: "carrier",
    carrier: "Correios",
    service: "PAC",
    estimatedDays: { min: 5, max: 8 },
    priceCents: 2490,
  },
  {
    id: "mock-jadlog-package",
    kind: "carrier",
    carrier: "Jadlog",
    service: ".Package",
    estimatedDays: { min: 4, max: 6 },
    priceCents: 2790,
  },
  {
    id: "mock-correios-sedex",
    kind: "carrier",
    carrier: "Correios",
    service: "SEDEX",
    estimatedDays: { min: 2, max: 3 },
    priceCents: 3990,
  },
];

/** Mock installments without fees — real values/fees will come from the payment backend. */
export function mockInstallmentOptions(
  totalCents: number | null,
  max: number,
): InstallmentOption[] {
  return Array.from({ length: max }, (_, i) => {
    const installments = i + 1;
    return {
      installments,
      installmentValueCents: totalCents == null ? null : Math.round(totalCents / installments),
      totalWithFeesCents: totalCents,
    };
  });
}

export function mockOrderId() {
  return `MOCK-${Date.now().toString(36).toUpperCase()}`;
}

export function mockPixPayment(orderId: string): PixPayment {
  return {
    method: "pix",
    paymentId: `mock-pix-${orderId}`,
    status: "AWAITING_PAYMENT",
    qrCodeImageUrl: null,
    copyPasteCode: "CODIGO-PIX-DE-TESTE-NAO-E-UM-PAGAMENTO-REAL",
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  };
}

export function mockCardPayment(orderId: string, installment: InstallmentOption): CardPayment {
  return {
    method: "credit_card",
    paymentId: `mock-card-${orderId}`,
    status: "PAYMENT_PROCESSING",
    installment,
  };
}

/** Mock payments never get confirmed — confirmation must come from the backend. */
export function mockPaymentStatus(paymentId: string): PaymentStatus {
  return paymentId.startsWith("mock-card-") ? "PAYMENT_PROCESSING" : "AWAITING_PAYMENT";
}
