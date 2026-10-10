import { describe, expect, it } from "vitest";
import type { CheckoutState } from "../types";
import { LOCAL_DELIVERY_OPTION } from "../domain/shipping-rules";
import { toCreateOrderInput } from "./order.adapter";

const checkoutState = (overrides: Partial<CheckoutState> = {}): CheckoutState => ({
  selection: {
    quantity: 2,
    metal: "prata",
    wearsRings: false,
    ringSize: null,
    allowsMalePieces: true,
    maleMetal: "misto",
    allowsPiercing: true,
    piercingLocations: ["nariz"],
    avoidNote: "Não uso pulseiras.",
  },
  customer: {
    fullName: "  Kimberly Belyeve  ",
    whatsapp: "(19) 99999-9999",
    email: "  kimberly@example.com  ",
    cpf: "529.982.247-25",
  },
  address: {
    zipCode: "13920-000",
    street: "Rua das Flores",
    number: "123",
    complement: "Casa",
    district: "Centro",
    city: "Pedreira",
    state: "SP",
  },
  shipping: LOCAL_DELIVERY_OPTION,
  paymentMethod: "pix",
  installment: null,
  socialMediaConsent: false,
  step: "review",
  placedOrder: null,
  ...overrides,
});

describe("checkout order adapter", () => {
  it("requires shipping, payment method, and an explicit social consent answer", () => {
    expect(toCreateOrderInput(checkoutState({ shipping: null }))).toBeNull();
    expect(toCreateOrderInput(checkoutState({ paymentMethod: null }))).toBeNull();
    expect(toCreateOrderInput(checkoutState({ socialMediaConsent: null }))).toBeNull();
  });

  it("accepts false as a valid social media consent answer", () => {
    const input = toCreateOrderInput(checkoutState({ socialMediaConsent: false }));

    expect(input?.socialMediaConsent).toBe(false);
    expect(input).toMatchObject({
      item: {
        packageId: "scoop-2",
        quantity: 2,
        unitPriceCents: 15995,
        preferences: {
          metal: "prata",
          wearsRings: false,
          ringSize: null,
          allowsMalePieces: true,
          maleMetal: "misto",
          allowsPiercing: true,
          piercingLocations: ["nariz"],
          avoidNote: "Não uso pulseiras.",
        },
      },
      customer: {
        fullName: "Kimberly Belyeve",
        email: "kimberly@example.com",
        whatsapp: "19999999999",
        cpf: "52998224725",
      },
      address: {
        zipCode: "13920000",
      },
      shippingOptionId: "local-pedreira",
      paymentMethod: "pix",
      installments: null,
    });
  });

  it("maps credit card installments without exposing card data", () => {
    const input = toCreateOrderInput(
      checkoutState({
        paymentMethod: "credit_card",
        installment: {
          installments: 3,
          installmentValueCents: null,
          totalWithFeesCents: null,
        },
        socialMediaConsent: true,
      }),
    );

    expect(input?.paymentMethod).toBe("credit_card");
    expect(input?.installments).toBe(3);
    expect(input).not.toHaveProperty("card");
  });

  it("defaults credit card installments to one when no option is selected", () => {
    expect(
      toCreateOrderInput(
        checkoutState({
          paymentMethod: "credit_card",
          installment: null,
          socialMediaConsent: true,
        }),
      )?.installments,
    ).toBe(1);
  });
});
