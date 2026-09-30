import { SCOOP_OPTIONS, pricingFor } from "@/data/scoops";
import type { OrderTotals, ScoopPackage, ScoopQuantity, ShippingOption } from "../types";

export function findPackage(quantity: ScoopQuantity): ScoopPackage {
  return SCOOP_OPTIONS.find((o) => o.quantity === quantity) ?? SCOOP_OPTIONS[0]!;
}

/** Display-only totals. The backend recalculates and is the source of truth. */
export function computeTotals(
  quantity: ScoopQuantity,
  shipping: ShippingOption | null,
): OrderTotals {
  const p = pricingFor(findPackage(quantity));
  const shippingCents = shipping?.priceCents ?? null;
  return {
    subtotalCents: p.previous ?? p.total,
    discountCents: p.savings != null && p.savings > 0 ? p.savings : null,
    itemsTotalCents: p.total,
    shippingCents,
    totalCents: p.total != null && shippingCents != null ? p.total + shippingCents : null,
  };
}
