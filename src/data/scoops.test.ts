import { describe, expect, it } from "vitest";
import {
  GUARANTEE_PER_SCOOP,
  LAUNCH_PROMO_END_DATE,
  METAL_CATEGORIES,
  RING_SIZES,
  SCOOP_OPTIONS,
  formatPrice,
  guaranteeFor,
  pricingFor,
} from "./scoops";

describe("scoop rules", () => {
  it("keeps the minimum guarantee per Scoop", () => {
    expect(GUARANTEE_PER_SCOOP).toEqual({ jewelry: 2, gifts: 3 });
    expect(guaranteeFor(1)).toEqual({ jewelry: 2, gifts: 3 });
    expect(guaranteeFor(2)).toEqual({ jewelry: 4, gifts: 6 });
    expect(guaranteeFor(3)).toEqual({ jewelry: 6, gifts: 9 });
  });

  it("offers only the supported Scoop quantities", () => {
    expect(SCOOP_OPTIONS.map((option) => option.quantity)).toEqual([1, 2, 3]);
    expect(SCOOP_OPTIONS.map((option) => option.id)).toEqual(["scoop-1", "scoop-2", "scoop-3"]);
  });

  it("keeps the selectable metal categories", () => {
    expect(METAL_CATEGORIES).toEqual([
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
    ]);
  });

  it("keeps ring sizes as configuration data", () => {
    expect(RING_SIZES).toEqual([]);
  });

  it("uses an absolute launch promotion end date", () => {
    expect(LAUNCH_PROMO_END_DATE).toBe("2026-10-08T23:59:59-03:00");
    expect(Number.isNaN(new Date(LAUNCH_PROMO_END_DATE).getTime())).toBe(false);
  });

  it("derives display pricing from package configuration", () => {
    const noPrice = pricingFor(SCOOP_OPTIONS[0]!);
    expect(noPrice).toEqual({
      total: null,
      previous: null,
      savings: null,
      perScoop: null,
      installment: null,
    });

    expect(
      pricingFor({
        id: "test-scoop",
        quantity: 2,
        label: "2 Scoops",
        priceCents: 24000,
        promoPriceCents: 18000,
        installments: 3,
        badge: null,
      }),
    ).toEqual({
      total: 18000,
      previous: 24000,
      savings: 6000,
      perScoop: 9000,
      installment: { count: 3, value: 6000 },
    });
  });

  it("formats prices for Brazilian currency display", () => {
    expect(formatPrice(null)).toBeNull();
    expect(formatPrice(12345)).toBe("R$ 123,45");
  });
});
