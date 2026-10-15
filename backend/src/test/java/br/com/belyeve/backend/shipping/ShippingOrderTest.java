package br.com.belyeve.backend.shipping;

import br.com.belyeve.backend.orders.*;
import org.junit.jupiter.api.Test;
import java.time.Instant;
import java.util.UUID;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

class ShippingOrderTest {
    @Test void snapshotsTheServerQuoteAndIgnoresManipulatedItemPrice() {
        UUID id = UUID.randomUUID();
        var quote = new ShippingQuoteEntity();
        quote.id = id; quote.kind = "carrier"; quote.environment = "sandbox";
        quote.carrier = "Correios"; quote.service = "PAC"; quote.providerServiceId = 1;
        quote.priceCents = 1987; quote.minDays = 4; quote.maxDays = 6;
        quote.expiresAt = Instant.now().plusSeconds(900);
        var shipping = mock(ShippingService.class);
        var repository = mock(OrderRepository.class);
        var address = new CreateOrderRequest.AddressRequest("01001000", "Praça da Sé", "123", null, "Sé", "São Paulo", "SP");
        when(shipping.selected(id.toString(), address, 2)).thenReturn(quote);
        when(repository.save(any(OrderEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));
        var request = new CheckoutOrderRequest(
                new CheckoutOrderRequest.Item("scoop-2", 2, 1L,
                        new CheckoutOrderRequest.Preferences("dourado", false, null, false, null, false, false, null, null)),
                new CreateOrderRequest.CustomerRequest("Cliente BELYEVE", "19999999999", "cliente@example.com", "52998224725"),
                address, id.toString(), "pix", null, false);
        OrderEntity order = new OrderService(repository, ShippingFixtures.pricing(), shipping).create(request);
        assertThat(order.getShippingCents()).isEqualTo(1987);
        assertThat(order.getSubtotalCents()).isEqualTo(19000);
        assertThat(order.getTotalCents()).isEqualTo(20987);
        assertThat(order.getShippingQuoteId()).isEqualTo(id);
        assertThat(order.getShippingProviderServiceId()).isEqualTo(1);
        assertThat(order.getShippingEnvironment()).isEqualTo("sandbox");
        var snapshot = ShippingOptionResponse.from(order);
        quote.service = "Changed provider name"; quote.priceCents = 99999;
        assertThat(ShippingOptionResponse.from(order)).isEqualTo(snapshot);
        assertThat(snapshot.service()).isEqualTo("PAC");
        assertThat(snapshot.estimatedDays()).isEqualTo(new ShippingOptionResponse.EstimatedDays(4, 6));
    }
}
