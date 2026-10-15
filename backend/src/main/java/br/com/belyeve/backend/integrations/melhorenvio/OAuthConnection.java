package br.com.belyeve.backend.integrations.melhorenvio;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "melhor_envio_connections")
class OAuthConnection {
    @Id @Column(length = 20) String environment;
    @Column(length = 64) String stateHash;
    Instant stateExpiresAt;
    @Column(nullable = false) long generation;
    @Column(length = 24000) String accessCiphertext;
    @Column(length = 24000) String refreshCiphertext;
    Instant accessExpiresAt;
    Instant refreshExpiresAt;
    protected OAuthConnection() {}
    OAuthConnection(String environment) { this.environment = environment; }
}
