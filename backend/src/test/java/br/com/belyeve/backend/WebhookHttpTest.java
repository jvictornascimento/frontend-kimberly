package br.com.belyeve.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class WebhookHttpTest {
    @LocalServerPort
    private int port;

    private int post(String token, String body) throws Exception {
        var request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/webhooks/asaas"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body));
        if (token != null) request.header("asaas-access-token", token);
        try (var client = HttpClient.newHttpClient()) {
            return client.send(request.build(), HttpResponse.BodyHandlers.discarding()).statusCode();
        }
    }

    @Test
    void rejectsMissingAndIncorrectTokens() throws Exception {
        assertThat(post(null, "{}")).isEqualTo(401);
        assertThat(post("incorrect", "{}")).isEqualTo(401);
    }

    @Test
    void rejectsMissingFieldsAndMalformedJson() throws Exception {
        String token = "test-webhook-token-with-more-than-32-chars";
        assertThat(post(token, "{}")).isEqualTo(400);
        assertThat(post(token, "{bad-json")).isEqualTo(400);
        assertThat(post(token, "null")).isEqualTo(400);
    }

    @Test
    void acceptsAnEventAndItsSequentialRetry() throws Exception {
        String body = "{\"id\":\"evt_http_test\",\"event\":\"PAYMENT_RECEIVED\",\"payment\":{\"id\":\"pay_http_test\"}}";
        String token = "test-webhook-token-with-more-than-32-chars";
        assertThat(post(token, body)).isEqualTo(204);
        assertThat(post(token, body)).isEqualTo(204);
    }
}
