import { findPackage } from "../domain/pricing";
import { onlyDigits } from "../domain/masks";
import { pricingFor } from "@/data/scoops";
import type { CheckoutState, CreateOrderInput } from "../types";

/** Builds the backend order payload from checkout state. Returns null if incomplete. */
export function toCreateOrderInput(state: CheckoutState): CreateOrderInput | null {
  const { selection, customer, address, shipping, paymentMethod, installment, socialMediaConsent } =
    state;
  if (!shipping || !paymentMethod || socialMediaConsent === null) return null;
  const pkg = findPackage(selection.quantity);
  const { quantity, ...preferences } = selection;
  return {
    item: { packageId: pkg.id, quantity, unitPriceCents: pricingFor(pkg).perScoop, preferences },
    customer: {
      fullName: customer.fullName.trim(),
      email: customer.email.trim(),
      whatsapp: onlyDigits(customer.whatsapp),
      cpf: onlyDigits(customer.cpf),
    },
    address: { ...address, zipCode: onlyDigits(address.zipCode) },
    shippingOptionId: shipping.id,
    paymentMethod,
    installments: paymentMethod === "credit_card" ? (installment?.installments ?? 1) : null,
    socialMediaConsent,
  };
}
