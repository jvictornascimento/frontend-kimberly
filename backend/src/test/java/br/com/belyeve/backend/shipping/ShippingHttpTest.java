package br.com.belyeve.backend.shipping;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import java.net.URI;
import java.net.http.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {"ASAAS_SANDBOX_API_KEY=test-sandbox-key",
                "ASAAS_WEBHOOK_TOKEN=test-webhook-token-with-more-than-32-chars"})
@ActiveProfiles("test")
class ShippingHttpTest {
    @LocalServerPort int port;
    @MockitoBean PostalAddressClient addresses;
    @MockitoBean MelhorEnvioClient provider;
    @Autowired ShippingQuoteRepository repository;

    private HttpResponse<String> post(String body) throws Exception {
        try (var client = HttpClient.newHttpClient()) {
            return client.send(HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/shipping/quote"))
                    .header("Content-Type", "application/json").POST(HttpRequest.BodyPublishers.ofString(body)).build(),
                    HttpResponse.BodyHandlers.ofString());
        }
    }

    @Test void rejectsInvalidCoercedOversizedAndUnexpectedInputsBeforeProviders() throws Exception {
        String base = "{\"zipCode\":\"13925400\",\"city\":\"Pedreira\",\"state\":\"SP\",\"quantity\":%s}";
        for (String quantity : new String[]{"null", "0", "4", "1.2", "\"1\"", "true", "[]", "99999999999999999999"}) {
            assertThat(post(base.formatted(quantity)).statusCode()).isEqualTo(400);
        }
        assertThat(post(base.formatted("1").replace("13925400", "abc")).statusCode()).isEqualTo(400);
        assertThat(post(base.formatted("1").replace("Pedreira", "x".repeat(121))).statusCode()).isEqualTo(400);
        assertThat(post(base.formatted("1").replace("\"quantity\":1", "\"quantity\":1,\"priceCents\":0")).statusCode()).isEqualTo(400);
        verifyNoInteractions(addresses, provider);
    }

    @Test void persistsALocalQuoteAndNeverCallsTheCarrierProvider() throws Exception {
        when(addresses.verify("13925400", "Pedreira", "SP"))
                .thenReturn(new PostalAddressClient.Address("13925400", "Rua", "Centro", "Pedreira", "SP"));
        var result = post("{\"zipCode\":\"13925400\",\"city\":\"Pedreira\",\"state\":\"SP\",\"quantity\":2}");
        assertThat(result.statusCode()).isEqualTo(200);
        assertThat(result.body()).contains("\"local_delivery\"", "\"priceCents\":0", "\"expiresAt\"");
        assertThat(repository.count()).isGreaterThan(0);
        verifyNoInteractions(provider);
    }

    @Test void returnsSafeUnavailableErrorWithoutProviderDetails() throws Exception {
        when(addresses.verify(anyString(), anyString(), anyString())).thenThrow(new ShippingUnavailableException());
        var result = post("{\"zipCode\":\"01001000\",\"city\":\"São Paulo\",\"state\":\"SP\",\"quantity\":1}");
        assertThat(result.statusCode()).isEqualTo(503);
        assertThat(result.body()).doesNotContain("stackTrace", "Authorization", "sandbox-test-token");
    }
}
