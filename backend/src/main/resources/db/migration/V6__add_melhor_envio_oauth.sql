CREATE TABLE melhor_envio_connections (
    environment VARCHAR(20) PRIMARY KEY CHECK (environment IN ('sandbox', 'production')),
    state_hash VARCHAR(64), state_expires_at TIMESTAMP WITH TIME ZONE,
    generation BIGINT NOT NULL DEFAULT 0,
    access_ciphertext VARCHAR(24000), refresh_ciphertext VARCHAR(24000),
    access_expires_at TIMESTAMP WITH TIME ZONE, refresh_expires_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT chk_oauth_state CHECK ((state_hash IS NULL) = (state_expires_at IS NULL)),
    CONSTRAINT chk_oauth_tokens CHECK (
        (access_ciphertext IS NULL AND refresh_ciphertext IS NULL AND access_expires_at IS NULL AND refresh_expires_at IS NULL)
        OR (access_ciphertext IS NOT NULL AND refresh_ciphertext IS NOT NULL AND access_expires_at IS NOT NULL AND refresh_expires_at IS NOT NULL))
);
INSERT INTO melhor_envio_connections (environment) VALUES ('sandbox'), ('production');
