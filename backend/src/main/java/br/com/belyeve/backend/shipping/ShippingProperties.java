package br.com.belyeve.backend.shipping;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.math.BigDecimal;
import java.util.Map;

@Validated
@ConfigurationProperties(prefix = "app.shipping")
public record ShippingProperties(
        boolean enabled, String environment, String sandboxToken, String productionToken,
        String userAgent, String originZipCode, Map<Integer, Parcel> parcels,
        @Min(60) @Max(3600) int quoteTtlSeconds,
        @Min(1) @Max(30) int timeoutSeconds, String services
) {
    public String baseUrl() {
        return "production".equals(environment) ? "https://melhorenvio.com.br" : "https://sandbox.melhorenvio.com.br";
    }

    public String token() {
        return "production".equals(environment) ? productionToken : sandboxToken;
    }

    @AssertTrue(message = "Enabled shipping requires its environment token, origin CEP, contact user agent, services and all three parcels")
    public boolean isConfigured() {
        if (!enabled) return true;
        return ("sandbox".equals(environment) || "production".equals(environment))
                && token() != null && !token().isBlank()
                && originZipCode != null && originZipCode.matches("\\d{8}")
                && userAgent != null && userAgent.length() <= 200
                && userAgent.matches("[^\\r\\n]+\\([^\\s()]+@[^\\s()]+\\)")
                && services != null && services.matches("[1-9]\\d*(,[1-9]\\d*){0,19}")
                && parcels != null && parcels.size() == 3
                && java.util.stream.IntStream.rangeClosed(1, 3)
                    .allMatch(q -> parcels.get(q) != null && parcels.get(q).valid());
    }

    public record Parcel(BigDecimal width, BigDecimal height, BigDecimal length, BigDecimal weight) {
        boolean valid() {
            return inRange(width, "300") && inRange(height, "300")
                    && inRange(length, "300") && inRange(weight, "1000");
        }
        private static boolean inRange(BigDecimal value, String max) {
            return value != null && value.signum() > 0 && value.compareTo(new BigDecimal(max)) <= 0;
        }
    }
}
