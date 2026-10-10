package br.com.belyeve.backend.orders;

import br.com.belyeve.backend.config.AppProperties;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PricingServiceTest {
    private final PricingService service = new PricingService(new AppProperties(
            "http://localhost:3000",
            new AppProperties.Pricing(10000, 19000, 27000, 2500),
            new AppProperties.Asaas("https://api-sandbox.asaas.com/v3", "key", "webhook-token")
    ));

    @Test
    void calculatesLocalDeliveryAsFreeForPedreiraSP() {
        PricingService.Totals totals = service.calculate(request(2, "Pedréira", "SP"));

        assertThat(totals.subtotalCents()).isEqualTo(19000);
        assertThat(totals.shippingCents()).isZero();
        assertThat(totals.totalCents()).isEqualTo(19000);
    }

    @Test
    void usesConfiguredShippingOutsidePedreiraSP() {
        PricingService.Totals totals = service.calculate(request(1, "Campinas", "SP"));

        assertThat(totals.subtotalCents()).isEqualTo(10000);
        assertThat(totals.shippingCents()).isEqualTo(2500);
        assertThat(totals.totalCents()).isEqualTo(12500);
    }

    @Test
    void keepsMinimumGuaranteePerScoop() {
        assertThat(service.guarantee(3)).isEqualTo(new PricingService.Guarantee(6, 9));
    }

    private CreateOrderRequest request(int quantity, String city, String state) {
        return new CreateOrderRequest(
                quantity,
                JewelryCategory.GOLD,
                false,
                null,
                null,
                false,
                new CreateOrderRequest.CustomerRequest(
                        "Cliente BELYEVE",
                        "19999999999",
                        "cliente@example.com",
                        "52998224725"
                ),
                new CreateOrderRequest.AddressRequest(
                        "13920000",
                        "Rua das Flores",
                        "123",
                        null,
                        "Centro",
                        city,
                        state
                )
        );
    }
}
