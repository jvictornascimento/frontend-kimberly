package br.com.belyeve.backend.integrations.melhorenvio;

import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

interface OAuthConnectionRepository extends JpaRepository<OAuthConnection,String> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from OAuthConnection c where c.environment = :environment")
    Optional<OAuthConnection> lock(String environment);
}
