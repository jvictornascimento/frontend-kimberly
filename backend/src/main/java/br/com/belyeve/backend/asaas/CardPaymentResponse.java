package br.com.belyeve.backend.asaas;

import br.com.belyeve.backend.orders.PaymentStatus;

public record CardPaymentResponse(String paymentId, PaymentStatus paymentStatus, int installments) {
}
