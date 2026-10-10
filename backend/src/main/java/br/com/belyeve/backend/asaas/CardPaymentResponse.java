package br.com.belyeve.backend.asaas;

import br.com.belyeve.backend.orders.OrderEntity;
import br.com.belyeve.backend.orders.PaymentStatus;

public record CardPaymentResponse(
        String paymentId,
        PaymentStatus paymentStatus,
        int installments,
        long installmentValueCents,
        long totalWithFeesCents
) {
    public static CardPaymentResponse from(OrderEntity order, int installments) {
        long installmentValueCents = Math.round((double) order.getTotalCents() / installments);
        return new CardPaymentResponse(
                order.getAsaasPaymentId(),
                order.getPaymentStatus(),
                installments,
                installmentValueCents,
                order.getTotalCents()
        );
    }
}
