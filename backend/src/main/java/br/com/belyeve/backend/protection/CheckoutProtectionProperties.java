package br.com.belyeve.backend.protection;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;
import java.util.List;

@Validated
@ConfigurationProperties(prefix = "app.checkout-protection")
public record CheckoutProtectionProperties(boolean turnstileEnabled, String secretKey,
        List<String> allowedHostnames, List<String> trustedProxyCidrs,
        @Min(1) @Max(30) int timeoutSeconds) {
    @AssertTrue(message = "Enabled Turnstile requires a secret key and exact allowed hostnames")
    public boolean isConfigured() {
        return !turnstileEnabled || (secretKey != null && !secretKey.isBlank()
                && allowedHostnames != null && !allowedHostnames.isEmpty()
                && allowedHostnames.stream().allMatch(h -> h != null && h.matches("[a-zA-Z0-9.-]{1,253}")));
    }
    @AssertTrue(message = "Trusted proxies must be literal IPs or restricted CIDRs")
    public boolean isTrustedProxyConfigurationValid() {
        if (trustedProxyCidrs == null) return true;
        if (trustedProxyCidrs.size() > 64) return false;
        try {
            for (String entry : trustedProxyCidrs) {
                if (entry.isBlank()) continue;
                String[] parts = entry.split("/", -1);
                String ip = ClientIpResolver.literal(parts[0]);
                if (parts.length > 2) return false;
                if (parts.length == 2) {
                    int bits = Integer.parseInt(parts[1]);
                    if (bits < 1 || bits > (ip.contains(":") ? 128 : 32)) return false;
                }
            }
            return true;
        } catch (RuntimeException e) { return false; }
    }

    @Override public String toString() { return "CheckoutProtectionProperties[redacted]"; }
}
