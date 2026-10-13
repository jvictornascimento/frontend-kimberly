import { describe, expect, it } from "vitest";
import type { ShippingOption } from "../types";
import { LOCAL_DELIVERY_OPTION, formatDeliveryEstimate, isPedreiraSP } from "./shipping-rules";

describe("checkout shipping rules", () => {
  it("identifies the Pedreira/SP local delivery case for UX", () => {
    expect(isPedreiraSP("Pedreira", "SP")).toBe(true);
    expect(isPedreiraSP(" pedréira ", "sp")).toBe(true);
    expect(isPedreiraSP("Campinas", "SP")).toBe(false);
    expect(isPedreiraSP("Pedreira", "RJ")).toBe(false);
  });

  it("keeps local delivery free and arranged by WhatsApp", () => {
    expect(LOCAL_DELIVERY_OPTION).toMatchObject({
      id: "local-pedreira",
      kind: "local_delivery",
      carrier: "BELYEVE",
      service: "Entrega grátis em Pedreira",
      estimatedDays: null,
      priceCents: 0,
    });
    expect(formatDeliveryEstimate(LOCAL_DELIVERY_OPTION)).toBe(
      "Combinamos a entrega pelo WhatsApp",
    );
  });

  it("formats carrier delivery ranges for display", () => {
    const carrierOption: ShippingOption = {
      id: "carrier-standard",
      kind: "carrier",
      carrier: "Melhor Envio Mock",
      service: "Standard",
      estimatedDays: { min: 3, max: 5 },
      priceCents: 1590,
    };

    expect(formatDeliveryEstimate(carrierOption)).toBe(
      "3 a 5 dias úteis de transporte após o despacho",
    );
    expect(formatDeliveryEstimate({ ...carrierOption, estimatedDays: { min: 4, max: 4 } })).toBe(
      "4 dias úteis de transporte após o despacho",
    );
  });
});
