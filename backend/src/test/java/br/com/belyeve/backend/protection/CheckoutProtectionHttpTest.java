package br.com.belyeve.backend.protection;

import br.com.belyeve.backend.asaas.PaymentService;
import br.com.belyeve.backend.orders.OrderService;
import java.net.URI;
import java.net.http.*;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringBootTest(webEnvironment=SpringBootTest.WebEnvironment.RANDOM_PORT,properties={
    "ASAAS_SANDBOX_API_KEY=test-sandbox-key", "ASAAS_WEBHOOK_TOKEN=test-webhook-token-with-more-than-32-chars",
    "TURNSTILE_ENABLED=true", "TURNSTILE_SECRET_KEY=fake-secret", "TURNSTILE_ALLOWED_HOSTNAMES=shop.example",
    "CHECKOUT_TRUSTED_PROXY_CIDRS=127.0.0.1/32,::1/128"})
@ActiveProfiles("test")
class CheckoutProtectionHttpTest {
    @LocalServerPort int port;
    @MockitoBean TurnstileClient turnstile;
    @MockitoBean OrderService orders;
    @MockitoBean PaymentService payments;
    private HttpResponse<String> request(String method,String path,String ip,String token,String body) throws Exception {
        var builder=HttpRequest.newBuilder(URI.create("http://localhost:"+port+path))
            .header("Content-Type","application/json").header("X-Forwarded-For",ip)
            .header("Origin","http://localhost:3000")
            .method(method,HttpRequest.BodyPublishers.ofString(body));
        if(token!=null)builder.header("X-Turnstile-Token",token);
        try(var client=HttpClient.newHttpClient()) {return client.send(builder.build(),HttpResponse.BodyHandlers.ofString());}
    }
    @Test void sharesQuotaAcrossAllCreationEndpointsAndStopsBeforeProviders() throws Exception {
        String ip="198.51.100.10";
        String[] paths={"/api/orders","/api/payments","/api/orders/00000000-0000-0000-0000-000000000001/payments/pix"};
        for(int i=0;i<5;i++) assertThat(request("POST",paths[i%3],ip,"bad-token","{}").statusCode()).isEqualTo(403);
        var blocked=request("POST","/api/payments",ip,"bad-token","{}");
        assertThat(blocked.statusCode()).isEqualTo(429);
        assertThat(Integer.parseInt(blocked.headers().firstValue("Retry-After").orElseThrow())).isBetween(115,120);
        assertThat(blocked.headers().firstValue("Access-Control-Expose-Headers").orElseThrow()).contains("Retry-After");
        verify(turnstile,times(5)).verify(anyString(),eq(ip),anyString());
        verifyNoInteractions(orders,payments);
        assertThat(request("GET","/actuator/health",ip,null,"").statusCode()).isNotEqualTo(429);
        assertThat(request("GET","/api/payments/pay_test/status",ip,null,"").statusCode()).isEqualTo(200);
        verify(payments).statusByPaymentId("pay_test");
        assertThat(request("POST","/api/webhooks/asaas",ip,null,"{}").statusCode()).isEqualTo(401);
        assertThat(request("POST","/api/orders","198.51.100.11","bad-token","{}").statusCode()).isEqualTo(403);
    }
    @Test void missingOversizedAndInvalidTokensAreCountedWithoutProviderCalls() throws Exception {
        String ip="198.51.100.12";
        for(String token:new String[]{null,"x".repeat(2049),"bad token",null,null})
            assertThat(request("POST","/api/orders",ip,token,"{broken").statusCode()).isEqualTo(400);
        assertThat(request("POST","/api/orders",ip,null,"{}").statusCode()).isEqualTo(429);
        verifyNoInteractions(turnstile,orders,payments);
    }
    @Test void providerUnavailableFailsClosedAndValidChallengeStillRequiresBodyValidation() throws Exception {
        when(turnstile.verify(eq("outage"),anyString(),anyString())).thenThrow(new IllegalStateException("private-secret"));
        var response=request("POST","/api/payments","198.51.100.13","outage","{}");
        assertThat(response.statusCode()).isEqualTo(503);
        assertThat(response.body()).doesNotContain("private-secret");
        when(turnstile.verify(eq("valid"),anyString(),eq("checkout_order"))).thenReturn(true);
        assertThat(request("POST","/api/orders","198.51.100.14","valid","{broken").statusCode()).isEqualTo(400);
        verifyNoInteractions(orders,payments);
    }
}
