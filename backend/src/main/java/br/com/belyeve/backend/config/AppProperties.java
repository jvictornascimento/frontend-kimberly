package br.com.belyeve.backend.config;

import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.util.Locale;

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
            @Min(1) long scoopThreePriceCents
    ) {
    }

    public record Asaas(
            @NotBlank String environment,
            @NotBlank String sandboxBaseUrl,
            @NotBlank String productionBaseUrl,
            String sandboxApiKey,
            String productionApiKey,
            @NotBlank String webhookToken
    ) {
        public String baseUrl() {
            return switch (normalizedEnvironment()) {
                case "sandbox" -> sandboxBaseUrl;
                case "production" -> productionBaseUrl;
                default -> throw new IllegalStateException("Unsupported Asaas environment");
            };
        }

        public String apiKey() {
            String key = switch (normalizedEnvironment()) {
                case "sandbox" -> sandboxApiKey;
                case "production" -> productionApiKey;
                default -> throw new IllegalStateException("Unsupported Asaas environment");
            };
            if (key == null || key.isBlank()) {
                throw new IllegalStateException("Missing API key for configured Asaas environment");
            }
            return key;
        }

        @AssertTrue(message = "The selected Asaas environment must have a matching API key")
        public boolean isEnvironmentConfigured() {
            if (environment == null) return false;
            return switch (normalizedEnvironment()) {
                case "sandbox" -> sandboxApiKey != null && !sandboxApiKey.isBlank();
                case "production" -> productionApiKey != null && !productionApiKey.isBlank();
                default -> false;
            };
        }

        private String normalizedEnvironment() {
            return environment == null ? "" : environment.trim().toLowerCase(Locale.ROOT);
        }
    }

    public record PurchaseEmail(
            boolean enabled,
            String from,
            String to,
            boolean customerEnabled
    ) {
    }
}
