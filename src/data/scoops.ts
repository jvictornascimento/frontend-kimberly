/**
 * Camada de dados/regras do Scoop.
 * Apresentação (componentes) não deve conter regra de negócio.
 * Preços, estoque e checkout virão de um backend próprio futuramente.
 */

export type MetalCategory = "dourado" | "prata" | "misto";
export type PiercingLocation = "nariz" | "helix";

export interface ScoopOption {
  /** Quantidade de Scoops do pacote */
  quantity: 1 | 2 | 3;
  id: string;
  label: string;
  /**
   * Preço cheio (anterior) em centavos. Nunca inventar valores —
   * null exibe "Valor em breve".
   */
  priceCents: number | null;
  /** Preço promocional em centavos (opcional). Quando presente, vira o preço principal. */
  promoPriceCents: number | null;
  /** Número máximo de parcelas sem juros (opcional). */
  installments: number | null;
  /** Badge configurável, ex.: "MAIS ESCOLHIDO". null = sem badge. */
  badge: string | null;
  /** Destaque visual do card. */
  highlighted?: boolean;
  note?: string;
}

/** Garantia mínima por Scoop — nunca alterar sem alinhamento com a marca. */
export const GUARANTEE_PER_SCOOP = {
  jewelry: 2,
  gifts: 3,
} as const;

/**
 * CONFIGURAÇÃO DE PREÇOS — edite apenas aqui.
 * Preço por Scoop, economia e parcela são calculados automaticamente.
 */
export const SCOOP_OPTIONS: ScoopOption[] = [
  {
    id: "scoop-1",
    quantity: 1,
    label: "1 Scoop",
    priceCents: null,
    promoPriceCents: null,
    installments: null,
    badge: null,
  },
  {
    id: "scoop-2",
    quantity: 2,
    label: "2 Scoops",
    priceCents: null,
    promoPriceCents: null,
    installments: null,
    badge: "MAIS ESCOLHIDO",
    highlighted: true,
  },
  {
    id: "scoop-3",
    quantity: 3,
    label: "3 Scoops",
    priceCents: null,
    promoPriceCents: null,
    installments: null,
    badge: "MELHOR VALOR",
  },
];

/** Resolve os números exibidos no card a partir da configuração. */
export function pricingFor(option: ScoopOption) {
  const total = option.promoPriceCents ?? option.priceCents;
  const previous =
    option.promoPriceCents != null &&
    option.priceCents != null &&
    option.priceCents > option.promoPriceCents
      ? option.priceCents
      : null;
  return {
    total,
    previous,
    savings: previous != null && total != null ? previous - total : null,
    perScoop: total != null ? Math.round(total / option.quantity) : null,
    installment:
      total != null && option.installments && option.installments > 1
        ? { count: option.installments, value: Math.round(total / option.installments) }
        : null,
  };
}

/**
 * Promoção de lançamento. Data final FIXA (não reinicia em refresh ou deploy).
 * 10 dias a partir do lançamento: termina em 08/10/2026 às 23:59 (horário de Brasília).
 * Para desativar, defina LAUNCH_PROMO_ENABLED = false.
 */
export const LAUNCH_PROMO_ENABLED = true;
export const LAUNCH_PROMO_END_DATE = "2026-10-08T23:59:59-03:00";

export const METAL_CATEGORIES: { value: MetalCategory; label: string; description: string }[] = [
  {
    value: "dourado",
    label: "Dourado",
    description: "Semijoias banhadas a ouro",
  },
  {
    value: "prata",
    label: "Prata/inox",
    description: "Semijoias banhadas a prata, Prata 925 e inox",
  },
  {
    value: "misto",
    label: "Misto",
    description: "Pode conter peças douradas e prata/inox",
  },
];

export const JEWELRY_CATEGORIES = [
  "Semijoias banhadas a ouro",
  "Semijoias banhadas a prata",
  "Prata 925",
  "Peças em inox",
];

export const GIFT_CATEGORIES = [
  "Skincare",
  "Maquiagem",
  "Cosméticos",
  "Cuidados para as unhas",
  "Chaveiros",
  "Outros mimos",
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
  allowsMalePieces: boolean | null;
  maleMetal: MetalCategory | null;
  allowsPiercing: boolean | null;
  piercingLocations: PiercingLocation[];
  /** Observação opcional: tipo de peça que a cliente não usa. */
  avoidNote: string;
}

export const EMPTY_ORDER: ScoopOrderDraft = {
  quantity: 1,
  metal: null,
  wearsRings: null,
  ringSize: null,
  allowsMalePieces: null,
  maleMetal: null,
  allowsPiercing: null,
  piercingLocations: [],
  avoidNote: "",
};

/**
 * Tamanhos de anel disponíveis — AINDA NÃO DEFINIDOS pela marca.
 * Enquanto a lista estiver vazia, a interface mostra um campo livre.
 * Ex. futuro: ["12", "14", "16", "18", "20"]
 */
export const RING_SIZES: string[] = [];
