package br.com.belyeve.backend.integrations.melhorenvio;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

class OAuthTokenCipherTest {
    @Test void encryptsWithRandomNonceAndBindsTokensToEnvironmentAndPurpose() {
        var cipher=new OAuthTokenCipher(OAuthFixtures.properties("sandbox"));
        String encrypted=cipher.encrypt("private-token","sandbox:access");
        assertThat(encrypted).doesNotContain("private-token");
        assertThat(cipher.encrypt("private-token","sandbox:access")).isNotEqualTo(encrypted);
        assertThat(cipher.decrypt(encrypted,"sandbox:access")).isEqualTo("private-token");
        assertThatThrownBy(() -> cipher.decrypt(encrypted,"production:access")).isInstanceOf(OAuthFailure.class);
        assertThatThrownBy(() -> cipher.decrypt(encrypted,"sandbox:refresh")).isInstanceOf(OAuthFailure.class);
        assertThatThrownBy(() -> cipher.decrypt("invalid","sandbox:access")).isInstanceOf(OAuthFailure.class);
        byte[] tampered=java.util.Base64.getDecoder().decode(encrypted);tampered[tampered.length-1]^=1;
        assertThatThrownBy(() -> cipher.decrypt(java.util.Base64.getEncoder().encodeToString(tampered),"sandbox:access"))
                .isInstanceOf(OAuthFailure.class);
    }
    @Test void environmentCredentialsNeverFallbackToAnotherAccount() {
        assertThat(OAuthFixtures.properties("sandbox").clientId()).isEqualTo("123");
        assertThat(OAuthFixtures.properties("production").clientId()).isEqualTo("456");
        assertThat(OAuthFixtures.properties("sandbox").isConfigured()).isTrue();
        var p=OAuthFixtures.properties("production");
        var missing=new MelhorEnvioOAuthProperties(true,"production",p.sandboxClientId(),p.sandboxClientSecret(),"","",
                p.redirectUri(),p.setupKey(),p.encryptionKey(),p.userAgent());
        assertThat(missing.isConfigured()).isFalse();
        var invalid=new MelhorEnvioOAuthProperties(true,"sandbox",p.sandboxClientId(),p.sandboxClientSecret(),"","",
                "https://evil.example/path",p.setupKey(),"invalid",p.userAgent());
        assertThat(invalid.isConfigured()).isFalse();
        assertThat(p.toString()).doesNotContain(p.productionClientSecret(),p.setupKey(),p.encryptionKey());
        assertThat(OAuthFixtures.tokens("secret").toString()).doesNotContain("access-secret","refresh-secret");
    }
}
