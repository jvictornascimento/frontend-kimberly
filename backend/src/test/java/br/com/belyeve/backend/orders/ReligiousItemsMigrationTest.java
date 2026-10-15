package br.com.belyeve.backend.orders;

import java.nio.charset.StandardCharsets;
import java.sql.DriverManager;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;
import static org.assertj.core.api.Assertions.*;

class ReligiousItemsMigrationTest {
    @Test void addsPreferenceWithoutInventingAnswersForHistoricalOrders() throws Exception {
        try(var connection=DriverManager.getConnection("jdbc:h2:mem:religious_migration;MODE=PostgreSQL","sa","");
            var statement=connection.createStatement();
            var input=new ClassPathResource("db/migration/V7__add_religious_items_preference.sql").getInputStream()) {
            statement.execute("create table orders (id integer primary key)");
            statement.execute("insert into orders(id) values (1)");
            statement.execute(new String(input.readAllBytes(),StandardCharsets.UTF_8));
            try(var rows=statement.executeQuery("select allows_religious_items from orders where id=1")) {
                assertThat(rows.next()).isTrue();assertThat(rows.getObject(1)).isNull();
            }
            statement.execute("update orders set allows_religious_items=false where id=1");
            try(var rows=statement.executeQuery("select allows_religious_items from orders where id=1")) {
                assertThat(rows.next()).isTrue();assertThat(rows.getObject(1)).isEqualTo(false);
            }
        }
    }
}
