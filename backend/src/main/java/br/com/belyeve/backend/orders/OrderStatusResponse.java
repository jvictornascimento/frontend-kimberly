package br.com.belyeve.backend.orders;

import java.time.Instant;
import java.util.UUID;

public record OrderStatusResponse(
        UUID id,
        OrderStatus orderStatus,
        PaymentStatus paymentStatus,
        PaymentMethod paymentMethod,
        long totalCents,
        String pixPayload,
        String pixQrCodeBase64,
        Instant pixExpirationAt
) {
    public static OrderStatusResponse from(OrderEntity order) {
        return new OrderStatusResponse(
                order.getId(),
                order.getStatus(),
                order.getPaymentStatus(),
                order.getPaymentMethod(),
                order.getTotalCents(),
                order.getPixPayload(),
                order.getPixQrCodeBase64(),
                order.getPixExpirationAt()
        );
    }
}
