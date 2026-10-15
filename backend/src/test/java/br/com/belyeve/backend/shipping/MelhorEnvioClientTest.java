package br.com.belyeve.backend.shipping;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.json.JsonMapper;
import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class MelhorEnvioClientTest {
    private static final String RATE = """
        [{"id":1,"name":"PAC","price":"10.00","custom_price":"19.87",
          "delivery_time":2,"custom_delivery_time":5,"custom_delivery_range":{"min":4,"max":6},
          "company":{"name":"Correios"}}, {"id":2,"error":"Unavailable"}]
        """;

    @Test void sendsMeasuredVolumeAndServerInsuranceUsingSandboxToken() {
        var builder = RestClient.builder().baseUrl("https://sandbox.melhorenvio.com.br");
        var server = MockRestServiceServer.bindTo(builder).build();
        server.expect(requestTo("https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("Authorization", "Bearer sandbox-test-token"))
                .andExpect(header("User-Agent", "BELYEVE (technical@example.com)"))
                .andExpect(content().json("""
                   {"from":{"postal_code":"13920013"},"to":{"postal_code":"01001000"},
                    "volumes":[{"width":20,"height":10,"length":30,"weight":0.75,"insurance":190}],
                    "services":"1,2","options":{"receipt":false,"own_hand":false}}
                   """))
                .andRespond(withSuccess(RATE, MediaType.APPLICATION_JSON));
        var rates = new MelhorEnvioClient(builder.build(), ShippingFixtures.properties()).calculate("01001000", 2, 19000);
        assertThat(rates).containsExactly(new MelhorEnvioClient.Rate(1, "Correios", "PAC", 1987, 4, 6));
        server.verify();
    }

    @Test void usesRotatedOAuthTokensAndNeverFallsBackAfterCredentialFailure() {
        var valid = ShippingFixtures.properties();
        var oauth = new ShippingProperties(true, "sandbox", "", "", valid.userAgent(), valid.originZipCode(),
                valid.parcels(), 900, 10, "1,2", true);
        assertThat(oauth.isConfigured()).isTrue();
        var builder = RestClient.builder().baseUrl("https://sandbox.melhorenvio.com.br");
        var server = MockRestServiceServer.bindTo(builder).build();
        server.expect(anything()).andExpect(header("Authorization", "Bearer first-oauth-token"))
                .andRespond(withSuccess(RATE, MediaType.APPLICATION_JSON));
        server.expect(anything()).andExpect(header("Authorization", "Bearer rotated-oauth-token"))
                .andRespond(withSuccess(RATE, MediaType.APPLICATION_JSON));
        var token = new java.util.concurrent.atomic.AtomicReference<>("first-oauth-token");
        var client = new MelhorEnvioClient(builder.build(), oauth, () -> {
            if (token.get() == null) throw new IllegalStateException("private credential failure");
            return token.get();
        });
        assertThat(client.calculate("01001000", 1, 10000)).isNotEmpty();
        token.set("rotated-oauth-token");
        assertThat(client.calculate("01001000", 1, 10000)).isNotEmpty();
        token.set(null);
        assertThatThrownBy(() -> client.calculate("01001000", 1, 10000))
                .isInstanceOf(ShippingUnavailableException.class).hasMessageNotContaining("private");
        server.verify();
    }

    @Test void rejectsMalformedPricesTimesAndMissingCustomFields() {
        var mapper = JsonMapper.builder().build();
        for (String invalid : new String[]{"{}", "null", "[null]", RATE.replace("19.87", "19.871"),
                RATE.replace("19.87", "-1"), RATE.replace("19.87", "0"),
                RATE.replace("custom_price", "missing_price"), RATE.replace("custom_delivery_time", "missing_time"),
                RATE.replace("\"min\":4", "\"min\":9"), RATE.replace("\"id\":1", "\"id\":\"1\"")}) {
            assertThatThrownBy(() -> MelhorEnvioClient.parse(mapper.readTree(invalid)))
                    .isInstanceOf(ShippingUnavailableException.class);
        }
        assertThat(MelhorEnvioClient.parse(mapper.readTree("[{\"id\":1,\"error\":\"Unavailable\"}]"))).isEmpty();
    }

    @Test void doesNotExposeProviderErrorsOrInventFallbackPrices() {
        var builder = RestClient.builder().baseUrl("https://sandbox.melhorenvio.com.br");
        var server = MockRestServiceServer.bindTo(builder).build();
        server.expect(anything()).andRespond(withStatus(HttpStatus.UNAUTHORIZED).body("private provider diagnostics"));
        assertThatThrownBy(() -> new MelhorEnvioClient(builder.build(), ShippingFixtures.properties())
                .calculate("01001000", 1, 10000)).isInstanceOf(ShippingUnavailableException.class)
                .hasMessageNotContaining("private");
        server.verify();
    }

    @Test void handlesTimeoutsAndDisabledConfigurationWithoutFallback() {
        var builder = RestClient.builder().baseUrl("https://sandbox.melhorenvio.com.br");
        var server = MockRestServiceServer.bindTo(builder).build();
        server.expect(anything()).andRespond(request -> { throw new java.net.SocketTimeoutException("provider timeout"); });
        assertThatThrownBy(() -> new MelhorEnvioClient(builder.build(), ShippingFixtures.properties())
                .calculate("01001000", 1, 10000)).isInstanceOf(ShippingUnavailableException.class);
        server.verify();

        var disabled = new ShippingProperties(false, "sandbox", "", "", "", "", java.util.Map.of(), 900, 10, "1,2", false);
        var unusedBuilder = RestClient.builder();
        var unusedServer = MockRestServiceServer.bindTo(unusedBuilder).build();
        assertThatThrownBy(() -> new MelhorEnvioClient(unusedBuilder.build(), disabled)
                .calculate("01001000", 1, 10000)).isInstanceOf(ShippingUnavailableException.class);
        unusedServer.verify();
    }
}
