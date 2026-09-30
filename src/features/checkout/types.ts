/**
 * Domain contracts for the BELYEVE checkout.
 * The UI only knows these types — never raw Asaas / Melhor Envio payloads.
 * The BELYEVE backend is responsible for translating gateway responses into them.
 */
import type { MetalCategory, ScoopOption, ScoopOrderDraft } from "@/data/scoops";

export type { MetalCategory };
export type ScoopPackage = ScoopOption;
export type ScoopSelection = ScoopOrderDraft;
export type ScoopQuantity = ScoopOrderDraft["quantity"];
export type ScoopPreferences = Omit<ScoopOrderDraft, "quantity">;

export interface Customer {
  fullName: string;
  whatsapp: string;
  email: string;
  cpf: string;
}

export interface Address {
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
}

export type AddressLookup = Pick<Address, "street" | "district" | "city" | "state">;

export type ShippingKind = "local_delivery" | "carrier";

export interface ShippingOption {
  id: string;
  kind: ShippingKind;
  carrier: string;
  service: string;
  /** Business days. null when delivery is arranged directly (e.g. Pedreira). */
  estimatedDays: { min: number; max: number } | null;
  priceCents: number;
}

export interface ShippingQuoteInput {
  zipCode: string;
  city: string;
  state: string;
  quantity: ScoopQuantity;
}

export interface OrderItem {
  packageId: string;
  quantity: ScoopQuantity;
  unitPriceCents: number | null;
  preferences: ScoopPreferences;
}

export interface OrderTotals {
  /** Full price before discount. */
  subtotalCents: number | null;
  discountCents: number | null;
  /** Scoops price after discount. */
  itemsTotalCents: number | null;
  shippingCents: number | null;
  totalCents: number | null;
}

export type PaymentMethod = "pix" | "credit_card";

export type PaymentStatus =
  "AWAITING_PAYMENT" | "PAYMENT_PROCESSING" | "PAID" | "PAYMENT_FAILED" | "CANCELLED";

export type OrderStatus = "DRAFT" | "CREATING_ORDER" | PaymentStatus;

/** Values come from the payment backend — the frontend never computes fees. */
export interface InstallmentOption {
  installments: number;
  installmentValueCents: number | null;
  totalWithFeesCents: number | null;
}

export interface PixPayment {
  method: "pix";
  paymentId: string;
  status: PaymentStatus;
  qrCodeImageUrl: string | null;
  copyPasteCode: string;
  expiresAt: string;
}

export interface CardPayment {
  method: "credit_card";
  paymentId: string;
  status: PaymentStatus;
  installment: InstallmentOption;
}

export type Payment = PixPayment | CardPayment;

/** Sensitive. Lives only in component state — never persisted or logged. */
export interface CardFormData {
  number: string;
  holderName: string;
  expiry: string;
  cvv: string;
}

export interface CreateOrderInput {
  item: OrderItem;
  customer: Customer;
  address: Address;
  shippingOptionId: string;
  paymentMethod: PaymentMethod;
  installments: number | null;
  socialMediaConsent: boolean;
}

export interface Order extends Omit<CreateOrderInput, "shippingOptionId"> {
  id: string;
  status: OrderStatus;
  shipping: ShippingOption;
  totals: OrderTotals;
  createdAt: string;
}

export type CreatePaymentInput =
  | { orderId: string; method: "pix" }
  | { orderId: string; method: "credit_card"; installments: number; card: CardFormData };

export interface PlacedOrder {
  order: Order;
  payment: Payment | null;
}

export type CheckoutStep = "scoop" | "customer" | "delivery" | "payment" | "review";

export interface CheckoutState {
  selection: ScoopSelection;
  customer: Customer;
  address: Address;
  shipping: ShippingOption | null;
  paymentMethod: PaymentMethod | null;
  installment: InstallmentOption | null;
  socialMediaConsent: boolean | null;
  step: CheckoutStep;
  placedOrder: PlacedOrder | null;
}

export type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "empty" }
  | { status: "error"; message: string };
