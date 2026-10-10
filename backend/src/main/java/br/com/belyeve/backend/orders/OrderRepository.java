package br.com.belyeve.backend.orders;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<OrderEntity, UUID> {
    Optional<OrderEntity> findByAsaasPaymentId(String asaasPaymentId);
}
