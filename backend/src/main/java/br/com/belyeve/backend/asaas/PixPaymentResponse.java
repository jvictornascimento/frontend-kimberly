package br.com.belyeve.backend.asaas;

import br.com.belyeve.backend.orders.OrderEntity;
import br.com.belyeve.backend.orders.PaymentStatus;

import java.time.Instant;
import java.util.UUID;

public record PixPaymentResponse(
        UUID orderId,
        PaymentStatus paymentStatus,
        String paymentId,
        String qrCodeImageBase64,
        String copyPasteCode,
        Instant expiresAt
) {
    public static PixPaymentResponse from(OrderEntity order) {
        return new PixPaymentResponse(
                order.getId(),
                order.getPaymentStatus(),
                order.getAsaasPaymentId(),
                order.getPixQrCodeBase64(),
                order.getPixPayload(),
                order.getPixExpirationAt()
        );
    }
}
