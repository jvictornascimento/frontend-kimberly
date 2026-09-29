/**
 * Camada de dados/regras do Scoop.
 * Apresentação (componentes) não deve conter regra de negócio.
 * Preços, estoque e checkout virão de um backend próprio futuramente.
 */

export type MetalCategory = "dourado" | "prata";

export interface ScoopOption {
  /** Quantidade de Scoops do pacote */
  quantity: 1 | 2 | 3;
  id: string;
  label: string;
  /** Preenchido futuramente pelo backend. Nunca inventar valores. */
  priceCents: number | null;
  note?: string;
}

/** Garantia mínima por Scoop — nunca alterar sem alinhamento com a marca. */
export const GUARANTEE_PER_SCOOP = {
  jewelry: 2,
  gifts: 3,
} as const;

export const SCOOP_OPTIONS: ScoopOption[] = [
  { id: "scoop-1", quantity: 1, label: "1 Scoop" },
  { id: "scoop-2", quantity: 2, label: "2 Scoops" },
  { id: "scoop-3", quantity: 3, label: "3 Scoops" },
].map((o) => ({ ...o, priceCents: null })) as ScoopOption[];

export const METAL_CATEGORIES: { value: MetalCategory; label: string; description: string }[] = [
  {
    value: "dourado",
    label: "Dourado",
    description: "Semijoias banhadas a ouro e peças em tom dourado.",
  },
  {
    value: "prata",
    label: "Prata",
    description: "Semijoias banhadas a prata, Prata 925 e inox.",
  },
];

export const JEWELRY_CATEGORIES = [
  "Semijoias banhadas a ouro",
  "Semijoias banhadas a prata",
  "Prata 925",
  "Inox",
];

export const GIFT_CATEGORIES = [
  "Skincare",
  "Maquiagem",
  "Cosméticos",
  "Cuidados das unhas",
  "Chaveiros",
  "E muito mais",
];

export function guaranteeFor(quantity: number) {
  return {
    jewelry: GUARANTEE_PER_SCOOP.jewelry * quantity,
    gifts: GUARANTEE_PER_SCOOP.gifts * quantity,
  };
}

export function formatPrice(priceCents: number | null): string | null {
  if (priceCents == null) return null;
  return (priceCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Pedido montado na interface. Será enviado ao backend (Asaas / Melhor Envio)
 * em uma etapa posterior — nenhuma integração real acontece aqui.
 */
export interface ScoopOrderDraft {
  quantity: 1 | 2 | 3;
  metal: MetalCategory | null;
  wearsRings: boolean | null;
  ringSize: string | null;
}

export const EMPTY_ORDER: ScoopOrderDraft = {
  quantity: 1,
  metal: null,
  wearsRings: null,
  ringSize: null,
};
