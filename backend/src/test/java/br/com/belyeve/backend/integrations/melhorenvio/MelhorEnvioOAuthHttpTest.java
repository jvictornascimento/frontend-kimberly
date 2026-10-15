package br.com.belyeve.backend.integrations.melhorenvio;

import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.util.UriComponentsBuilder;
import tools.jackson.databind.json.JsonMapper;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringBootTest(properties={"ASAAS_SANDBOX_API_KEY=test-sandbox-key","ASAAS_WEBHOOK_TOKEN=test-webhook-token-with-more-than-32-chars",
        "MELHOR_ENVIO_OAUTH_ENABLED=true","MELHOR_ENVIO_ENVIRONMENT=sandbox","MELHOR_ENVIO_SANDBOX_CLIENT_ID=123",
        "MELHOR_ENVIO_SANDBOX_CLIENT_SECRET=sandbox-client-secret-test","MELHOR_ENVIO_USER_AGENT=BELYEVE (technical@example.com)",
        "MELHOR_ENVIO_SETUP_KEY="+OAuthFixtures.KEY,"MELHOR_ENVIO_TOKEN_ENCRYPTION_KEY=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="})
@ActiveProfiles("test") @AutoConfigureMockMvc @Import(MelhorEnvioOAuthHttpTest.TimeConfig.class)
class MelhorEnvioOAuthHttpTest {
    static final String BASE="/api/integrations/melhor-envio";
    @Autowired MockMvc mvc;
    @Autowired JsonMapper mapper;
    @Autowired OAuthConnectionRepository repository;
    @Autowired MelhorEnvioOAuthService service;
    @Autowired TestClock clock;
    @Autowired org.springframework.transaction.PlatformTransactionManager transactionManager;
    @MockitoBean MelhorEnvioOAuthClient client;
    static class TestClock extends Clock {
        volatile Instant time=Instant.parse("2026-10-15T12:00:00Z");
        public ZoneId getZone(){return ZoneOffset.UTC;}
        public Clock withZone(ZoneId zone){return this;}
        public Instant instant(){return time;}
    }
    @TestConfiguration static class TimeConfig {
        @Bean @Primary TestClock oauthClock(){return new TestClock();}
    }
    @BeforeEach void resetConnections(){
        repository.deleteAll();repository.saveAll(List.of(new OAuthConnection("sandbox"),new OAuthConnection("production")));
        clock.time=Instant.parse("2026-10-15T12:00:00Z");
        when(client.exchange(anyString())).thenReturn(OAuthFixtures.tokens("first"));
        when(client.refresh(anyString())).thenReturn(OAuthFixtures.tokens("renewed"));
    }
    private String state() throws Exception {
        String json=mvc.perform(post(BASE+"/authorize").header("X-Integration-Setup-Key",OAuthFixtures.KEY))
                .andExpect(status().isOk()).andExpect(header().string("Cache-Control","no-store")).andReturn().getResponse().getContentAsString();
        String url=mapper.readTree(json).path("authorizationUrl").asText();
        assertThat(url).startsWith("https://sandbox.melhorenvio.com.br/oauth/authorize?")
                .contains("scope=shipping-calculate").doesNotContain("shipping-generate","shipping-checkout","client_secret");
        return UriComponentsBuilder.fromUriString(url).build().getQueryParams().getFirst("state");
    }
    @Test void callbackConnectsWithoutExposingCredentialsAndRejectsReplays() throws Exception {
        String state=state();
        mvc.perform(get(BASE+"/callback").param("code","secret-code").param("state",state))
                .andExpect(status().isOk()).andExpect(header().string("Cache-Control","no-store"))
                .andExpect(header().string("Referrer-Policy","no-referrer"))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("conectada")));
        var saved=repository.findById("sandbox").orElseThrow();
        assertThat(saved.accessCiphertext).doesNotContain("access-first");
        assertThat(saved.refreshCiphertext).doesNotContain("refresh-first");
        assertThat(saved.stateHash).isNull();
        assertThat(repository.findById("production").orElseThrow().accessCiphertext).isNull();
        assertThat(service.accessToken()).isEqualTo("access-first");
        mvc.perform(get(BASE+"/callback").param("code","secret-code").param("state",state)).andExpect(status().isBadRequest());
        verify(client,times(1)).exchange("secret-code"); verify(client,never()).refresh(anyString());
    }
    @Test void invalidStateExpiredStateAndSupersededStateCannotExchangeCodes() throws Exception {
        String old=state();String current=state();
        for(String invalid:new String[]{"x".repeat(43),old})
            mvc.perform(get(BASE+"/callback").param("code","code").param("state",invalid)).andExpect(status().isBadRequest());
        clock.time=clock.time.plusSeconds(600);
        mvc.perform(get(BASE+"/callback").param("code","code").param("state",current)).andExpect(status().isBadRequest());
        verifyNoInteractions(client);
    }
    @Test void missingMalformedDuplicateAndUnexpectedParametersAreRejectedWithoutLeakingInput() throws Exception {
        String state=state();
        mvc.perform(get(BASE+"/callback")).andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("conectada"))));
        mvc.perform(post(BASE+"/authorize")).andExpect(status().isUnauthorized());
        mvc.perform(post(BASE+"/authorize").header("X-Integration-Setup-Key","incorrect")).andExpect(status().isUnauthorized());
        mvc.perform(get(BASE+"/callback").param("code","code")).andExpect(status().isBadRequest());
        mvc.perform(get(BASE+"/callback").param("code","private-"+"x".repeat(4097)).param("state",state))
                .andExpect(status().isBadRequest()).andExpect(content().string("Retorno de autorização inválido."));
        mvc.perform(get(BASE+"/callback").param("code","one","two").param("state",state)).andExpect(status().isBadRequest());
        mvc.perform(get(BASE+"/callback").param("code","one").param("state",state).param("redirect_uri","https://evil.example"))
                .andExpect(status().isBadRequest());
        mvc.perform(get(BASE+"/callback").param("code","one").param("error","access_denied").param("state",state))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(client);
    }
    @Test void deniedAndFailedAuthorizationsConsumeStateAndAllowFreshRetry() throws Exception {
        String denied=state();
        mvc.perform(get(BASE+"/callback").param("error","access_denied").param("error_description","private-detail").param("state",denied))
                .andExpect(status().isBadRequest()).andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("private-detail"))));
        mvc.perform(get(BASE+"/callback").param("code","code").param("state",denied)).andExpect(status().isBadRequest());
        String failed=state();when(client.exchange("fail")).thenThrow(new OAuthFailure(502,"Provider unavailable"));
        mvc.perform(get(BASE+"/callback").param("code","fail").param("state",failed)).andExpect(status().isBadGateway());
        mvc.perform(get(BASE+"/callback").param("code","code").param("state",failed)).andExpect(status().isBadRequest());
        mvc.perform(get(BASE+"/callback").param("code","code").param("state",state())).andExpect(status().isOk());
    }
    @Test void concurrentCallbacksExchangeOnlyOnce() throws Exception {
        String state=state();
        try(var executor=Executors.newVirtualThreadPerTaskExecutor()){
            var futures=new ArrayList<Future<Boolean>>();
            for(int i=0;i<10;i++)futures.add(executor.submit(() -> {
                try{service.callback("code",state,null);return true;}catch(OAuthFailure e){return false;}
            }));
            int successful=0;for(var future:futures)if(future.get())successful++;
            assertThat(successful).isEqualTo(1);
        }
        verify(client,times(1)).exchange("code");
    }
    @Test void refreshCommitSurvivesAnUnrelatedOuterRollback() throws Exception {
        service.callback("code",state(),null);
        clock.time=clock.time.plusSeconds(2592000-299);
        var transaction=new org.springframework.transaction.support.TransactionTemplate(transactionManager);
        transaction.executeWithoutResult(status -> {
            assertThat(service.accessToken()).isEqualTo("access-renewed");
            status.setRollbackOnly();
        });
        assertThat(service.accessToken()).isEqualTo("access-renewed");
        verify(client,times(1)).refresh("refresh-first");
    }
    @Test void oldCallbackCannotOverwriteANewerAuthorization() throws Exception {
        String old=state();var entered=new CountDownLatch(1);var release=new CountDownLatch(1);
        when(client.exchange("old-code")).thenAnswer(invocation -> {
            entered.countDown();if(!release.await(5,TimeUnit.SECONDS))throw new IllegalStateException("Test synchronization timed out");
            return OAuthFixtures.tokens("obsolete");
        });
        try(var executor=Executors.newVirtualThreadPerTaskExecutor()) {
            var oldResult=executor.submit(() -> {
                try{service.callback("old-code",old,null);return 200;}catch(OAuthFailure error){return error.status;}
            });
            assertThat(entered.await(5,TimeUnit.SECONDS)).isTrue();
            String current;
            try{current=state();}finally{release.countDown();}
            assertThat(oldResult.get()).isEqualTo(409);
            assertThat(repository.findById("sandbox").orElseThrow().accessCiphertext).isNull();
            service.callback("new-code",current,null);
            assertThat(service.accessToken()).isEqualTo("access-first");
        }
    }

    @Test void concurrentQuotesRefreshOnlyOnceAndRotationIsPersisted() throws Exception {
        service.callback("code",state(),null);
        clock.time=clock.time.plusSeconds(2592000-299);
        try(var executor=Executors.newVirtualThreadPerTaskExecutor()){
            var futures=new ArrayList<Future<String>>();
            for(int i=0;i<10;i++)futures.add(executor.submit(service::accessToken));
            for(var future:futures)assertThat(future.get()).isEqualTo("access-renewed");
        }
        verify(client,times(1)).refresh("refresh-first");
        assertThat(repository.findById("sandbox").orElseThrow().accessExpiresAt).isAfter(clock.instant());
        clock.time=clock.time.plusSeconds(46L*24*60*60);
        assertThatThrownBy(service::accessToken).isInstanceOf(OAuthFailure.class).hasMessageContaining("expirou");
        verify(client,times(1)).refresh(anyString());
    }
}
