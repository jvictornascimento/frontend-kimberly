package br.com.belyeve.backend.shipping;

import br.com.belyeve.backend.orders.ShippingOptionResponse;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "shipping_quotes")
public class ShippingQuoteEntity {
    @Id UUID id;
    @Column(length = 8, nullable = false) String zipCode;
    @Column(length = 120, nullable = false) String city;
    @Column(length = 2, nullable = false) String state;
    int quantity;
    long subtotalCents;
    @Column(length = 20, nullable = false) String environment;
    @Column(length = 20, nullable = false) String kind;
    @Column(length = 120, nullable = false) String carrier;
    @Column(length = 120, nullable = false) String service;
    Integer providerServiceId;
    long priceCents;
    Integer minDays;
    Integer maxDays;
    @Column(nullable = false) Instant expiresAt;

    protected ShippingQuoteEntity() {}

    public ShippingOptionResponse response() {
        return new ShippingOptionResponse(id.toString(), kind, carrier, service,
                minDays == null ? null : new ShippingOptionResponse.EstimatedDays(minDays, maxDays),
                priceCents, expiresAt);
    }

    public Integer getProviderServiceId() { return providerServiceId; }
    public String getEnvironment() { return environment; }
}
