package br.com.belyeve.backend.integrations.melhorenvio;

class OAuthFixtures {
    static final String KEY="test-setup-key-abcdefghijklmnopqrstuvwxyz0123456789";
    static MelhorEnvioOAuthProperties properties(String environment) {
        return new MelhorEnvioOAuthProperties(true,environment,"123","sandbox-client-secret-test",
                "456","production-client-secret-test","https://www.belyeve.com.br/api/integrations/melhor-envio/callback",
                KEY,"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","BELYEVE (technical@example.com)");
    }
    static MelhorEnvioOAuthClient.Tokens tokens(String suffix) {
        return new MelhorEnvioOAuthClient.Tokens("access-"+suffix,"refresh-"+suffix,"Bearer",2592000);
    }
}
