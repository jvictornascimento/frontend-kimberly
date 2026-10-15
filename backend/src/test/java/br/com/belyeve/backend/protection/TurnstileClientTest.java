package br.com.belyeve.backend.protection;

import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;
import static org.assertj.core.api.Assertions.*;

class TurnstileClientTest {
    private String response(String hostname,String action,String time) {
        return "{\"success\":true,\"hostname\":\""+hostname+"\",\"action\":\""+action+"\",\"challenge_ts\":\""+time+"\"}";
    }
    private boolean verify(String response) {
        var builder=RestClient.builder();var server=MockRestServiceServer.bindTo(builder).build();
        server.expect(requestTo("https://challenges.cloudflare.com/turnstile/v0/siteverify"))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("response=token")))
                .andRespond(withSuccess(response,MediaType.APPLICATION_JSON));
        var properties=new CheckoutProtectionProperties(true,"fake-secret",List.of("shop.example"),List.of(),5);
        boolean valid=new TurnstileClient(properties,builder.build()).verify("token","198.51.100.1","checkout_order");
        server.verify();return valid;
    }
    @Test void acceptsValidChallengeWithExactActionAndHostname() {
        assertThat(verify(response("shop.example","checkout_order",Instant.now().toString()))).isTrue();
    }
    @Test void rejectsWrongHostActionAndExpiredTimestamp() {
        assertThat(verify(response("evil.example","checkout_order",Instant.now().toString()))).isFalse();
        assertThat(verify(response("shop.example","checkout_payment",Instant.now().toString()))).isFalse();
        assertThat(verify(response("shop.example","checkout_order",Instant.now().minusSeconds(301).toString()))).isFalse();
        assertThat(verify(response("shop.example","checkout_order","invalid"))).isFalse();
    }
    @Test void rejectsMalformedOrReplayResponses() {
        for(String body:List.of("{}","null","{\"success\":\"true\"}","{\"success\":false,\"error-codes\":[\"timeout-or-duplicate\"]}"))
            assertThat(verify(body)).isFalse();
    }
}
