package br.com.belyeve.backend.shipping;

import java.math.BigDecimal;
import java.util.Map;
import br.com.belyeve.backend.config.AppProperties;
import br.com.belyeve.backend.orders.PricingService;

class ShippingFixtures {
    static ShippingProperties properties() {
        var parcel = new ShippingProperties.Parcel(new BigDecimal("20"), new BigDecimal("10"),
                new BigDecimal("30"), new BigDecimal("0.75"));
        return new ShippingProperties(true, "sandbox", "sandbox-test-token", "production-test-token",
                "BELYEVE (technical@example.com)", "13920013", Map.of(1, parcel, 2, parcel, 3, parcel), 900, 10, "1,2", false);
    }
    static PricingService pricing() {
        return new PricingService(new AppProperties("http://localhost:3000",
                new AppProperties.Pricing(10000, 19000, 27000),
                new AppProperties.Asaas("sandbox", "https://api-sandbox.asaas.com/v3", "https://api.asaas.com/v3",
                        "sandbox-key", "production-key", "webhook-token"),
                new AppProperties.PurchaseEmail(false, null, null, false)));
    }
}
