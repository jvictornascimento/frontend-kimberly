package br.com.belyeve.backend.integrations.melhorenvio;

import jakarta.validation.Validator;
import jakarta.validation.constraints.*;
import java.net.http.HttpClient;
import java.time.Duration;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.JsonNode;

@Component
public class MelhorEnvioOAuthClient {
    private final RestClient client;
    private final MelhorEnvioOAuthProperties properties;
    private final Validator validator;
    @Autowired
    public MelhorEnvioOAuthClient(RestClient.Builder builder, MelhorEnvioOAuthProperties properties, Validator validator) {
        this(configure(builder,properties), properties, validator);
    }
    MelhorEnvioOAuthClient(RestClient client, MelhorEnvioOAuthProperties properties, Validator validator) {
        this.client=client; this.properties=properties; this.validator=validator;
    }
    private static RestClient configure(RestClient.Builder builder, MelhorEnvioOAuthProperties properties) {
        Duration timeout=Duration.ofSeconds(10);
        var factory=new JdkClientHttpRequestFactory(HttpClient.newBuilder().connectTimeout(timeout).build());
        factory.setReadTimeout(timeout);
        return builder.clone().baseUrl(properties.baseUrl()).requestFactory(factory).build();
    }
    public Tokens exchange(String code) {
        return request(Map.of("grant_type","authorization_code","client_id",properties.clientId(),
                "client_secret",properties.clientSecret(),"redirect_uri",properties.redirectUri(),"code",code));
    }
    public Tokens refresh(String refreshToken) {
        return request(Map.of("grant_type","refresh_token","client_id",properties.clientId(),
                "client_secret",properties.clientSecret(),"refresh_token",refreshToken));
    }
    private Tokens request(Map<String,String> body) {
        try {
            JsonNode json=client.post().uri("/oauth/token").contentType(MediaType.APPLICATION_JSON)
                    .header(HttpHeaders.ACCEPT,"application/json").header(HttpHeaders.USER_AGENT,properties.userAgent())
                    .body(body).retrieve().body(JsonNode.class);
            if (json == null || !json.isObject() || !json.path("access_token").isString()
                    || !json.path("refresh_token").isString() || !json.path("token_type").isString()
                    || !json.path("expires_in").isIntegralNumber() || !json.path("expires_in").canConvertToLong())
                throw new IllegalArgumentException();
            Tokens result=new Tokens(json.path("access_token").asText(),json.path("refresh_token").asText(),
                    json.path("token_type").asText(),json.path("expires_in").asLong());
            if(!validator.validate(result).isEmpty()) throw new IllegalArgumentException();
            return result;
        } catch(RuntimeException e) {
            // Provider exceptions may embed codes, refresh tokens or client secrets. Do not retain/log causes.
            throw new OAuthFailure(502,"O Melhor Envio não confirmou a autorização. Inicie uma nova autorização.");
        }
    }
    public record Tokens(@NotBlank @Size(max=16384) @Pattern(regexp="[!-~]+") String accessToken,
            @NotBlank @Size(max=16384) @Pattern(regexp="[!-~]+") String refreshToken,
            @NotBlank @Pattern(regexp="(?i)Bearer") String tokenType,
            @Min(60) @Max(2592000) long expiresIn) {
        @Override public String toString() { return "Tokens[redacted]"; }
    }
}
