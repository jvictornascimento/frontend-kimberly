package br.com.belyeve.backend.integrations.melhorenvio;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Component;

@Component
public class OAuthTokenCipher {
    private final MelhorEnvioOAuthProperties properties;
    private final SecureRandom random = new SecureRandom();
    public OAuthTokenCipher(MelhorEnvioOAuthProperties properties) { this.properties = properties; }
    public String encrypt(String value, String context) {
        try {
            byte[] iv = new byte[12]; random.nextBytes(iv);
            Cipher cipher = cipher(Cipher.ENCRYPT_MODE, iv, context);
            byte[] encrypted = cipher.doFinal(value.getBytes(StandardCharsets.UTF_8));
            byte[] result = new byte[iv.length + encrypted.length];
            System.arraycopy(iv,0,result,0,iv.length); System.arraycopy(encrypted,0,result,iv.length,encrypted.length);
            return Base64.getEncoder().encodeToString(result);
        } catch (Exception e) { throw new OAuthFailure(503,"Não foi possível proteger a conexão. Contate o suporte."); }
    }
    public String decrypt(String value, String context) {
        try {
            byte[] bytes = Base64.getDecoder().decode(value);
            if (bytes.length < 29 || bytes.length > 24000) throw new IllegalArgumentException();
            byte[] iv = java.util.Arrays.copyOfRange(bytes,0,12);
            return new String(cipher(Cipher.DECRYPT_MODE,iv,context).doFinal(bytes,12,bytes.length-12), StandardCharsets.UTF_8);
        } catch (Exception e) { throw new OAuthFailure(503,"A conexão precisa ser autorizada novamente."); }
    }
    private Cipher cipher(int mode, byte[] iv, String context) throws Exception {
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(mode,new SecretKeySpec(Base64.getDecoder().decode(properties.encryptionKey()),"AES"),new GCMParameterSpec(128,iv));
        cipher.updateAAD(context.getBytes(StandardCharsets.UTF_8)); return cipher;
    }
}
