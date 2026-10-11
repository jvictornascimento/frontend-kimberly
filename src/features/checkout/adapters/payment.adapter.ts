import type { PaymentStatus, PixPayment } from "../types";

export interface PixPaymentApiResponse {
  paymentStatus: PaymentStatus;
  paymentId: string;
  qrCodeImageBase64?: string | null;
  copyPasteCode?: string | null;
  expiresAt?: string | null;
}

const PAYMENT_STATUSES: PaymentStatus[] = [
  "AWAITING_PAYMENT",
  "PAYMENT_PROCESSING",
  "PAID",
  "PAYMENT_FAILED",
  "CANCELLED",
];

export function fromPixPaymentResponse(response: PixPaymentApiResponse): PixPayment {
  if (!response.paymentId || !PAYMENT_STATUSES.includes(response.paymentStatus)) {
    throw new Error("Invalid PIX payment response");
  }

  const image = response.qrCodeImageBase64;
  return {
    method: "pix",
    paymentId: response.paymentId,
    status: response.paymentStatus,
    qrCodeImageUrl: image
      ? image.startsWith("data:")
        ? image
        : `data:image/png;base64,${image}`
      : null,
    copyPasteCode: response.copyPasteCode ?? "",
    expiresAt: response.expiresAt ?? "",
  };
}
