import { METAL_CATEGORIES, formatPrice } from "@/data/scoops";
import type { InstallmentOption, ScoopPreferences } from "@/features/checkout/types";

export const priceOr = (cents: number | null, fallback: string) => formatPrice(cents) ?? fallback;

export const metalLabel = (metal: ScoopPreferences["metal"]) =>
  METAL_CATEGORIES.find((c) => c.value === metal)?.label ?? "—";

export function ringsLabel(p: ScoopPreferences) {
  if (p.wearsRings === null) return "—";
  return p.wearsRings ? `Sim${p.ringSize ? ` · tamanho ${p.ringSize}` : ""}` : "Não uso anéis";
}

export function installmentLabel(option: InstallmentOption) {
  const value = formatPrice(option.installmentValueCents);
  return value ? `${option.installments}x de ${value}` : `${option.installments}x`;
}
