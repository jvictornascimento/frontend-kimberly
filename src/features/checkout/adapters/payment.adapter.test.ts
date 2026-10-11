import { describe, expect, it } from "vitest";
import { fromPixPaymentResponse } from "./payment.adapter";

describe("fromPixPaymentResponse", () => {
  it("maps the backend PIX response to the checkout model", () => {
    expect(
      fromPixPaymentResponse({
        paymentStatus: "AWAITING_PAYMENT",
        paymentId: "pay_123",
        qrCodeImageBase64: "aW1hZ2U=",
        copyPasteCode: "pix-code",
        expiresAt: "2027-10-13T02:59:59Z",
      }),
    ).toEqual({
      method: "pix",
      paymentId: "pay_123",
      status: "AWAITING_PAYMENT",
      qrCodeImageUrl: "data:image/png;base64,aW1hZ2U=",
      copyPasteCode: "pix-code",
      expiresAt: "2027-10-13T02:59:59Z",
    });
  });

  it("accepts a data URL and a missing expiration date", () => {
    expect(
      fromPixPaymentResponse({
        paymentStatus: "AWAITING_PAYMENT",
        paymentId: "pay_123",
        qrCodeImageBase64: "data:image/png;base64,aW1hZ2U=",
        copyPasteCode: "pix-code",
        expiresAt: null,
      }).qrCodeImageUrl,
    ).toBe("data:image/png;base64,aW1hZ2U=");
  });
});
