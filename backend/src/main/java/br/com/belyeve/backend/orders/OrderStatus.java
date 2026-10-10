package br.com.belyeve.backend.orders;

public enum OrderStatus {
    DRAFT,
    AWAITING_PAYMENT,
    PAID,
    PAYMENT_FAILED,
    CANCELLED
}
