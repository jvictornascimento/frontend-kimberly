package br.com.belyeve.backend.shipping;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ShippingQuoteRepository extends JpaRepository<ShippingQuoteEntity, UUID> {}
