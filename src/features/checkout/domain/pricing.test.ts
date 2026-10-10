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

  it("calculates the configured package total with free local delivery", () => {
    expect(computeTotals(2, LOCAL_DELIVERY_OPTION)).toEqual({
      subtotalCents: 31990,
      discountCents: null,
      itemsTotalCents: 31990,
      shippingCents: 0,
      totalCents: 31990,
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
      itemsTotalCents: 17990,
      shippingCents: 2490,
      totalCents: 20480,
    });
  });

  it("leaves the final total unknown until shipping is selected", () => {
    expect(computeTotals(3, null)).toEqual({
      subtotalCents: 48490,
      discountCents: null,
      itemsTotalCents: 48490,
      shippingCents: null,
      totalCents: null,
    });
  });
});
