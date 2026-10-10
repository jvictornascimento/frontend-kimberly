package br.com.belyeve.backend.asaas;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "payment_webhook_events")
public class PaymentWebhookEventEntity {
    @Id
    private UUID id;

    private String asaasEventId;
    private String asaasPaymentId;
    private String eventType;

    @Column(columnDefinition = "TEXT")
    private String payload;

    private Instant receivedAt;

    protected PaymentWebhookEventEntity() {
    }

    public PaymentWebhookEventEntity(String asaasEventId, String asaasPaymentId, String eventType, String payload) {
        this.id = UUID.randomUUID();
        this.asaasEventId = asaasEventId;
        this.asaasPaymentId = asaasPaymentId;
        this.eventType = eventType;
        this.payload = payload;
        this.receivedAt = Instant.now();
    }
}
