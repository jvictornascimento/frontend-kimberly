import { describe, expect, it } from "vitest";
import { SCOOP_OPTIONS } from "@/data/scoops";
import type { ShippingOption } from "../types";
import { LOCAL_DELIVERY_OPTION } from "./shipping-rules";
import { computeTotals, findPackage } from "./pricing";

describe("checkout display pricing", () => {
  it("finds the configured Scoop package for the selected quantity", () => {
    expect(findPackage(1)).toBe(SCOOP_OPTIONS[0]);
    expect(findPackage(2)).toBe(SCOOP_OPTIONS[1]);
    expect(findPackage(3)).toBe(SCOOP_OPTIONS[2]);
  });

  it("keeps totals empty while package prices are not configured", () => {
    expect(computeTotals(2, LOCAL_DELIVERY_OPTION)).toEqual({
      subtotalCents: null,
      discountCents: null,
      itemsTotalCents: null,
      shippingCents: 0,
      totalCents: null,
    });
  });

  it("keeps shipping separate from item totals for display", () => {
    const shipping: ShippingOption = {
      id: "mock-carrier",
      kind: "carrier",
      carrier: "Melhor Envio Mock",
      service: "PAC",
      estimatedDays: { min: 5, max: 7 },
      priceCents: 2490,
    };

    expect(computeTotals(1, shipping)).toMatchObject({
      itemsTotalCents: null,
      shippingCents: 2490,
      totalCents: null,
    });
  });

  it("does not treat browser totals as backend authority", () => {
    expect(computeTotals(3, null)).toEqual({
      subtotalCents: null,
      discountCents: null,
      itemsTotalCents: null,
      shippingCents: null,
      totalCents: null,
    });
  });
});
