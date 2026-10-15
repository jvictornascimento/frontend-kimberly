package br.com.belyeve.backend.integrations.melhorenvio;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Clock;
import java.util.Base64;
import java.util.HexFormat;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class MelhorEnvioOAuthService {
    private final MelhorEnvioOAuthProperties properties;
    private final OAuthConnectionRepository repository;
    private final MelhorEnvioOAuthClient client;
    private final OAuthTokenCipher cipher;
    private final Clock clock;
    private final TransactionTemplate transactions;
    private final SecureRandom random=new SecureRandom();
    public MelhorEnvioOAuthService(MelhorEnvioOAuthProperties properties, OAuthConnectionRepository repository,
            MelhorEnvioOAuthClient client, OAuthTokenCipher cipher, Clock clock, PlatformTransactionManager manager) {
        this.properties=properties;this.repository=repository;this.client=client;this.cipher=cipher;this.clock=clock;
        transactions=new TransactionTemplate(manager);
        // Isolate provider credential transactions from order/shipping transactions.
        transactions.setPropagationBehavior(org.springframework.transaction.TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }
    public String authorize(String setupKey) {
        requireEnabled();
        if(setupKey == null || setupKey.length()>128 || !MessageDigest.isEqual(
                setupKey.getBytes(StandardCharsets.UTF_8),properties.setupKey().getBytes(StandardCharsets.UTF_8)))
            throw new OAuthFailure(401,"Credencial de configuração inválida.");
        byte[] bytes=new byte[32];random.nextBytes(bytes);
        String state=Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        transactions.executeWithoutResult(tx -> {
            OAuthConnection connection=locked();
            connection.stateHash=hash(state); connection.stateExpiresAt=clock.instant().plusSeconds(600);
            connection.generation++;
        });
        return UriComponentsBuilder.fromUriString(properties.baseUrl()+"/oauth/authorize")
                .queryParam("client_id",properties.clientId()).queryParam("redirect_uri",properties.redirectUri())
                .queryParam("response_type","code").queryParam("state",state).queryParam("scope","shipping-calculate")
                .build().encode().toUriString();
    }
    public void callback(String code,String state,String error) {
        requireEnabled();
        // Commit consumption before any external request: denied/failed/duplicate callbacks cannot reuse the state.
        Long generation=transactions.execute(tx -> {
            OAuthConnection connection=locked();
            if(connection.stateHash == null || connection.stateExpiresAt == null
                    || !clock.instant().isBefore(connection.stateExpiresAt)
                    || !MessageDigest.isEqual(hash(state).getBytes(StandardCharsets.US_ASCII),
                            connection.stateHash.getBytes(StandardCharsets.US_ASCII)))
                throw new OAuthFailure(400,"Autorização inválida ou expirada. Inicie uma nova autorização.");
            connection.stateHash=null;connection.stateExpiresAt=null;return connection.generation;
        });
        if(error != null) throw new OAuthFailure(400,"A autorização foi recusada no Melhor Envio.");
        var tokens=client.exchange(code);
        transactions.executeWithoutResult(tx -> {
            OAuthConnection connection=locked();
            if(connection.generation != generation) throw new OAuthFailure(409,"Existe uma autorização mais recente. Conclua a última solicitação.");
            saveTokens(connection,tokens);
        });
    }
    public String accessToken() {
        requireEnabled();
        return transactions.execute(tx -> {
            OAuthConnection connection=locked();
            if(connection.accessCiphertext == null) throw new OAuthFailure(503,"A conta Melhor Envio ainda não foi autorizada.");
            if(connection.accessExpiresAt == null || !clock.instant().plusSeconds(300).isBefore(connection.accessExpiresAt)) {
                if(connection.refreshExpiresAt == null || !clock.instant().isBefore(connection.refreshExpiresAt))
                    throw new OAuthFailure(503,"A conexão expirou. Autorize a conta Melhor Envio novamente.");
                String refresh=cipher.decrypt(connection.refreshCiphertext,context("refresh"));
                saveTokens(connection,client.refresh(refresh));
            }
            return cipher.decrypt(connection.accessCiphertext,context("access"));
        });
    }
    private void saveTokens(OAuthConnection connection,MelhorEnvioOAuthClient.Tokens tokens) {
        connection.accessCiphertext=cipher.encrypt(tokens.accessToken(),context("access"));
        connection.refreshCiphertext=cipher.encrypt(tokens.refreshToken(),context("refresh"));
        connection.accessExpiresAt=clock.instant().plusSeconds(tokens.expiresIn());
        connection.refreshExpiresAt=clock.instant().plusSeconds(45L*24*60*60);
    }
    private String context(String type) { return "melhor-envio:"+properties.environment()+":"+type; }
    private OAuthConnection locked() {
        return repository.lock(properties.environment()).orElseThrow(() -> new OAuthFailure(503,"Configuração da conexão indisponível."));
    }
    private void requireEnabled() {
        if(!properties.enabled() || !properties.isConfigured()) throw new OAuthFailure(503,"A autorização Melhor Envio ainda não foi configurada.");
    }
    private static String hash(String state) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(state.getBytes(StandardCharsets.UTF_8))); }
        catch(Exception e) { throw new IllegalStateException("SHA-256 unavailable"); }
    }
}
