package br.com.belyeve.backend.integrations.melhorenvio;

import jakarta.validation.Validation;
import org.junit.jupiter.api.Test;
import org.springframework.http.*;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;
import static org.assertj.core.api.Assertions.*;

class MelhorEnvioOAuthClientTest {
    private static final String TOKENS="{\"access_token\":\"test-access\",\"refresh_token\":\"test-refresh\",\"token_type\":\"Bearer\",\"expires_in\":2592000}";
    @Test void exchangesCodeUsingStaticCallbackAndRefreshesWithoutSendingCode() {
        var builder=RestClient.builder().baseUrl("https://sandbox.melhorenvio.com.br");
        var server=MockRestServiceServer.bindTo(builder).build();
        server.expect(requestTo("https://sandbox.melhorenvio.com.br/oauth/token"))
                .andExpect(header("User-Agent","BELYEVE (technical@example.com)"))
                .andExpect(method(HttpMethod.POST)).andExpect(content().json("""
                {"grant_type":"authorization_code","client_id":"123","client_secret":"sandbox-client-secret-test",
                 "redirect_uri":"https://www.belyeve.com.br/api/integrations/melhor-envio/callback","code":"one-use-code"}
                """)).andRespond(withSuccess(TOKENS,MediaType.APPLICATION_JSON));
        server.expect(requestTo("https://sandbox.melhorenvio.com.br/oauth/token"))
                .andExpect(content().json("""
                {"grant_type":"refresh_token","client_id":"123","client_secret":"sandbox-client-secret-test","refresh_token":"test-refresh"}
                """)).andRespond(withSuccess(TOKENS,MediaType.APPLICATION_JSON));
        try(var validation=Validation.buildDefaultValidatorFactory()) {
            var client=new MelhorEnvioOAuthClient(builder.build(),OAuthFixtures.properties("sandbox"),validation.getValidator());
            assertThat(client.exchange("one-use-code").accessToken()).isEqualTo("test-access");
            assertThat(client.refresh("test-refresh").refreshToken()).isEqualTo("test-refresh");
        }
        server.verify();
    }
    @Test void rejectsMalformedAndUntrustedProviderResponsesWithoutLeakingBodies() {
        for(String body:new String[]{"null","{}",TOKENS.replace("2592000","\"2592000\""),
                TOKENS.replace("2592000","-1"),TOKENS.replace("Bearer","Basic"),
                TOKENS.replace("test-access",""),TOKENS.replace("test-refresh","x".repeat(16385))}) {
            var builder=RestClient.builder();var server=MockRestServiceServer.bindTo(builder).build();
            server.expect(anything()).andRespond(withSuccess(body,MediaType.APPLICATION_JSON));
            try(var validation=Validation.buildDefaultValidatorFactory()) {
                var client=new MelhorEnvioOAuthClient(builder.build(),OAuthFixtures.properties("sandbox"),validation.getValidator());
                assertThatThrownBy(() -> client.exchange("secret-code")).isInstanceOf(OAuthFailure.class)
                        .hasMessageNotContaining("secret-code").hasMessageNotContaining("test-refresh").hasNoCause();
            }
            server.verify();
        }
    }
    @Test void providerTimeoutAndErrorsAreSanitized() {
        for(boolean timeout:new boolean[]{false,true}) {
            var builder=RestClient.builder();var server=MockRestServiceServer.bindTo(builder).build();
            if(timeout) server.expect(anything()).andRespond(request -> {throw new java.net.SocketTimeoutException("private-secret");});
            else server.expect(anything()).andRespond(withStatus(HttpStatus.UNAUTHORIZED).body("private-secret"));
            try(var validation=Validation.buildDefaultValidatorFactory()) {
                var client=new MelhorEnvioOAuthClient(builder.build(),OAuthFixtures.properties("sandbox"),validation.getValidator());
                assertThatThrownBy(() -> client.exchange("code")).hasMessageNotContaining("private-secret").hasNoCause();
            }
            server.verify();
        }
    }
}
