import type { ShippingOption } from "../types";

/**
 * UX-only rule: Pedreira/SP gets free delivery by BELYEVE itself.
 * The backend must validate this — never trust the client for commercial rules.
 */
export const LOCAL_DELIVERY_OPTION: ShippingOption = {
  id: "local-pedreira",
  kind: "local_delivery",
  carrier: "BELYEVE",
  service: "Entrega grátis em Pedreira",
  estimatedDays: null,
  priceCents: 0,
};

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

export function isPedreiraSP(city: string, state: string) {
  return normalize(city) === "pedreira" && state.toUpperCase() === "SP";
}

export function formatDeliveryEstimate(option: ShippingOption) {
  if (!option.estimatedDays) return "Combinamos a entrega pelo WhatsApp";
  const { min, max } = option.estimatedDays;
  return min === max ? `${min} dias úteis` : `${min} a ${max} dias úteis`;
}
