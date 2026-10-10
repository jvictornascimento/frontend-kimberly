package br.com.belyeve.backend.asaas;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PaymentWebhookEventRepository extends JpaRepository<PaymentWebhookEventEntity, UUID> {
    boolean existsByAsaasEventId(String asaasEventId);
}
