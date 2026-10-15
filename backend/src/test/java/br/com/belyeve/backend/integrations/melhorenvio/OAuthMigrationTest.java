package br.com.belyeve.backend.integrations.melhorenvio;

import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;
import java.nio.charset.StandardCharsets;
import java.sql.DriverManager;
import java.sql.SQLException;
import static org.assertj.core.api.Assertions.*;

class OAuthMigrationTest {
    @Test void seedsBothEnvironmentsAndRejectsPartialCredentials() throws Exception {
        try(var connection=DriverManager.getConnection("jdbc:h2:mem:oauth_migration;MODE=PostgreSQL","sa","");
            var statement=connection.createStatement();
            var input=new ClassPathResource("db/migration/V6__add_melhor_envio_oauth.sql").getInputStream()) {
            String migration=new String(input.readAllBytes(), StandardCharsets.UTF_8);
            for(String sql:migration.split(";"))if(!sql.isBlank())statement.execute(sql);
            try(var rows=statement.executeQuery("select environment,generation from melhor_envio_connections order by environment")) {
                assertThat(rows.next()).isTrue();assertThat(rows.getString(1)).isEqualTo("production");assertThat(rows.getLong(2)).isZero();
                assertThat(rows.next()).isTrue();assertThat(rows.getString(1)).isEqualTo("sandbox");assertThat(rows.next()).isFalse();
            }
            assertThatThrownBy(() -> statement.executeUpdate("update melhor_envio_connections set state_hash='hash' where environment='sandbox'"))
                    .isInstanceOf(SQLException.class);
            assertThatThrownBy(() -> statement.executeUpdate("update melhor_envio_connections set access_ciphertext='ciphertext' where environment='sandbox'"))
                    .isInstanceOf(SQLException.class);
            assertThatThrownBy(() -> statement.executeUpdate("insert into melhor_envio_connections(environment) values ('other')"))
                    .isInstanceOf(SQLException.class);
        }
    }
}
