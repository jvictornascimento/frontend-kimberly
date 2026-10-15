package br.com.belyeve.backend.protection;

import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestClient;
import java.net.http.HttpClient;
import tools.jackson.databind.JsonNode;

@Component
public class TurnstileClient {
    private final CheckoutProtectionProperties properties;
    private final RestClient client;
    @Autowired
    public TurnstileClient(CheckoutProtectionProperties properties, RestClient.Builder builder) {
        this(properties, builder.clone().requestFactory(factory(properties.timeoutSeconds())).build());
    }
    TurnstileClient(CheckoutProtectionProperties properties, RestClient client) {
        this.properties = properties;
        this.client = client;
    }
    private static JdkClientHttpRequestFactory factory(int seconds) {
        var timeout = Duration.ofSeconds(seconds);
        var factory = new JdkClientHttpRequestFactory(HttpClient.newBuilder().connectTimeout(timeout).build());
        factory.setReadTimeout(timeout);
        return factory;
    }
    public boolean verify(String token, String ip, String action) {
        var body = new LinkedMultiValueMap<String, String>();
        body.add("secret", properties.secretKey());
        body.add("response", token);
        body.add("remoteip", ip);
        JsonNode result = client.post().uri("https://challenges.cloudflare.com/turnstile/v0/siteverify")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED).body(body)
                .retrieve().body(JsonNode.class);
        if (result == null || !result.path("success").isBoolean() || !result.path("success").asBoolean()
                || !result.path("hostname").isString() || !result.path("action").isString()
                || !result.path("challenge_ts").isString()) return false;
        if (!action.equals(result.path("action").asText())
                || !properties.allowedHostnames().contains(result.path("hostname").asText().toLowerCase(Locale.ROOT)))
            return false;
        try {
            long age = Duration.between(Instant.parse(result.path("challenge_ts").asText()), Instant.now()).getSeconds();
            return age >= -30 && age < 300;
        } catch (RuntimeException e) { return false; }
    }
}
