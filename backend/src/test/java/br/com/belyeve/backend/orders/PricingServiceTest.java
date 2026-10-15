package br.com.belyeve.backend.orders;

import br.com.belyeve.backend.config.AppProperties;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

class PricingServiceTest {
    private final PricingService service = new PricingService(new AppProperties(
            "http://localhost:3000", new AppProperties.Pricing(10000, 19000, 27000),
            new AppProperties.Asaas("sandbox", "https://api-sandbox.asaas.com/v3",
                    "https://api.asaas.com/v3", "sandbox-key", "production-key", "webhook-token"),
            new AppProperties.PurchaseEmail(false, null, null, false)));

    @Test void includesTheSelectedAuthoritativeRateInTotals() {
        assertThat(service.calculate(2, 1987)).isEqualTo(new PricingService.Totals(9500, 19000, 0, 1987, 20987));
    }
    @Test void keepsFreeLocalDeliveryAndMinimumGuarantee() {
        assertThat(service.calculate(3, 0).totalCents()).isEqualTo(27000);
        assertThat(service.guarantee(3)).isEqualTo(new PricingService.Guarantee(6, 9));
    }
    @Test void rejectsInvalidQuantityAndNegativeShipping() {
        assertThatThrownBy(() -> service.calculate(4, 1000)).isInstanceOf(BusinessException.class);
        assertThatThrownBy(() -> service.calculate(1, -1)).isInstanceOf(BusinessException.class);
    }
}
