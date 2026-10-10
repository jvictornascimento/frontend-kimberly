package br.com.belyeve.backend.config;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app")
public record AppProperties(
        @NotBlank String corsOrigin,
        @Valid Pricing pricing,
        @Valid Asaas asaas,
        @Valid PurchaseEmail purchaseEmail
) {
    public record Pricing(
            @Min(1) long scoopOnePriceCents,
            @Min(1) long scoopTwoPriceCents,
            @Min(1) long scoopThreePriceCents,
            @Min(0) long nonLocalShippingCents
    ) {
    }

    public record Asaas(
            @NotBlank String baseUrl,
            @NotBlank String apiKey,
            @NotBlank String webhookToken
    ) {
    }

    public record PurchaseEmail(
            boolean enabled,
            String from,
            String to,
            boolean customerEnabled
    ) {
    }
}
