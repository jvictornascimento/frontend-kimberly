package br.com.belyeve.backend.integrations.melhorenvio;

import jakarta.validation.constraints.AssertTrue;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;
import java.net.URI;
import java.util.Base64;

@Validated
@ConfigurationProperties(prefix = "app.melhor-envio-oauth")
public record MelhorEnvioOAuthProperties(boolean enabled, String environment,
        String sandboxClientId, String sandboxClientSecret, String productionClientId, String productionClientSecret,
        String redirectUri, String setupKey, String encryptionKey, String userAgent) {
    public String clientId() { return "production".equals(environment) ? productionClientId : sandboxClientId; }
    public String clientSecret() { return "production".equals(environment) ? productionClientSecret : sandboxClientSecret; }
    public String baseUrl() { return "production".equals(environment) ? "https://melhorenvio.com.br" : "https://sandbox.melhorenvio.com.br"; }
    @AssertTrue(message = "Enabled Melhor Envio OAuth requires matching environment credentials, HTTPS callback, setup/encryption keys and contact User-Agent")
    public boolean isConfigured() {
        if (!enabled) return true;
        try {
            URI callback = URI.create(redirectUri);
            return ("sandbox".equals(environment) || "production".equals(environment))
                    && clientId() != null && clientId().matches("[1-9][0-9]{0,9}")
                    && clientSecret() != null && clientSecret().matches("[!-~]{16,512}")
                    && "https".equals(callback.getScheme()) && callback.getHost() != null
                    && callback.getUserInfo() == null && callback.getQuery() == null && callback.getFragment() == null
                    && "/api/integrations/melhor-envio/callback".equals(callback.getPath())
                    && setupKey != null && setupKey.matches("[A-Za-z0-9_-]{43,128}")
                    && Base64.getDecoder().decode(encryptionKey).length == 32
                    && userAgent != null && userAgent.length() <= 200
                    && userAgent.matches("[^\\r\\n]+\\([^\\s()]+@[^\\s()]+\\)");
        } catch (RuntimeException e) { return false; }
    }
    @Override public String toString() { return "MelhorEnvioOAuthProperties[redacted]"; }
}
