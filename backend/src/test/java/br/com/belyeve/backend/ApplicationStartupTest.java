package br.com.belyeve.backend;

import br.com.belyeve.backend.asaas.AsaasWebhookController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = {
        "ASAAS_SANDBOX_API_KEY=test-sandbox-key",
        "ASAAS_WEBHOOK_TOKEN=test-webhook-token-with-more-than-32-chars"
})
@ActiveProfiles("test")
class ApplicationStartupTest {
    @Autowired
    private AsaasWebhookController webhookController;

    @Test
    void startsWithWebhookDependencies() {
        assertThat(webhookController).isNotNull();
    }
}
