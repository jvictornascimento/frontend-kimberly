package br.com.belyeve.backend.shipping;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.util.Map;
import static org.assertj.core.api.Assertions.*;

class ShippingValidationTest {
    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test void acceptsOnlySupportedQuantityPostalFormatAndState() {
        assertThat(validator.validate(new ShippingQuoteRequest("13925-400", "Pedreira", "SP", 3))).isEmpty();
        for (ShippingQuoteRequest input : new ShippingQuoteRequest[]{
                new ShippingQuoteRequest(null, "Pedreira", "SP", 1),
                new ShippingQuoteRequest("123", "Pedreira", "SP", 1),
                new ShippingQuoteRequest("13925400", "Pedreira", "XX", 1),
                new ShippingQuoteRequest("13925400", "x".repeat(121), "SP", 1),
                new ShippingQuoteRequest("13925400", "", "SP", 1),
                new ShippingQuoteRequest("13925400", "Pedreira", "SP", null),
                new ShippingQuoteRequest("13925400", "Pedreira", "SP", 0),
                new ShippingQuoteRequest("13925400", "Pedreira", "SP", 4)}) {
            assertThat(validator.validate(input)).isNotEmpty();
        }
    }

    @Test void enabledIntegrationRequiresCompleteConfiguration() {
        var valid = ShippingFixtures.properties();
        assertThat(validator.validate(valid)).isEmpty();
        var invalid = new ShippingProperties(true, "sandbox", "", "production-token",
                valid.userAgent(), valid.originZipCode(), valid.parcels(), 900, 10, "1,2");
        assertThat(validator.validate(invalid)).isNotEmpty();
        var parcel = new ShippingProperties.Parcel(BigDecimal.ZERO, BigDecimal.ONE, BigDecimal.ONE, BigDecimal.ONE);
        var invalidParcel = new ShippingProperties(true, "sandbox", "sandbox-token", "",
                valid.userAgent(), valid.originZipCode(), Map.of(1, parcel, 2, parcel, 3, parcel), 900, 10, "1,2");
        assertThat(validator.validate(invalidParcel)).isNotEmpty();
        var disabled = new ShippingProperties(false, "sandbox", "", "", "", "", Map.of(), 900, 10, "1,2");
        assertThat(validator.validate(disabled)).isEmpty();
        var production = new ShippingProperties(true, "production", "sandbox-token", "production-token",
                valid.userAgent(), valid.originZipCode(), valid.parcels(), 900, 10, "1,2");
        assertThat(production.token()).isEqualTo("production-token");
        assertThat(production.baseUrl()).isEqualTo("https://melhorenvio.com.br");
    }
}
