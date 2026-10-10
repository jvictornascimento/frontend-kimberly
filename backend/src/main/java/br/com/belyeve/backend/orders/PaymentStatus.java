package br.com.belyeve.backend.orders;

public enum PaymentStatus {
    NOT_CREATED,
    AWAITING_PAYMENT,
    PAYMENT_PROCESSING,
    PAID,
    PAYMENT_FAILED,
    CANCELLED
}
