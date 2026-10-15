package br.com.belyeve.backend.shipping;

import br.com.belyeve.backend.orders.CreateOrderRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.time.*;
import java.util.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

class ShippingServiceTest {
    private final PostalAddressClient addresses = mock(PostalAddressClient.class);
    private final MelhorEnvioClient provider = mock(MelhorEnvioClient.class);
    private final ShippingQuoteRepository repository = mock(ShippingQuoteRepository.class);
    private final Instant now = Instant.parse("2026-10-12T12:00:00Z");
    private ShippingService service;

    @BeforeEach void setup() {
        service = new ShippingService(addresses, provider, repository, ShippingFixtures.properties(),
                ShippingFixtures.pricing(), Clock.fixed(now, ZoneOffset.UTC));
        when(repository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test void localDeliveryIsFreeWithoutCallingMelhorEnvio() {
        when(addresses.verify("13925400", "Pedreira", "SP"))
                .thenReturn(new PostalAddressClient.Address("13925400", "Rua", "Centro", "Pedreira", "SP"));
        var quotes = service.quote(new ShippingQuoteRequest("13925400", "Pedreira", "SP", 3));
        assertThat(quotes).hasSize(1);
        assertThat(quotes.getFirst().kind()).isEqualTo("local_delivery");
        assertThat(quotes.getFirst().priceCents()).isZero();
        assertThat(quotes.getFirst().expiresAt()).isEqualTo(now.plusSeconds(900));
        verifyNoInteractions(provider);
    }

    @Test void storesProviderServiceRateAndOnlyConfiguredServices() {
        when(addresses.verify("01001000", "São Paulo", "SP"))
                .thenReturn(new PostalAddressClient.Address("01001000", "Praça", "Sé", "São Paulo", "SP"));
        when(provider.calculate("01001000", 2, 19000)).thenReturn(List.of(
                new MelhorEnvioClient.Rate(1, "Correios", "PAC", 1987, 4, 6),
                new MelhorEnvioClient.Rate(99, "Other", "Other", 100, 1, 1)));
        var result = service.quote(new ShippingQuoteRequest("01001000", "São Paulo", "SP", 2));
        assertThat(result).hasSize(1);
        assertThat(result.getFirst().priceCents()).isEqualTo(1987);
        assertThat(result.getFirst().carrier()).isEqualTo("Correios");
        assertThat(result.getFirst().service()).isEqualTo("PAC");
    }

    @Test void rejectsExpiredUnknownMismatchedAndManipulatedQuotes() {
        ShippingQuoteEntity quote = quote();
        when(repository.findById(quote.id)).thenReturn(Optional.of(quote));
        var address = address("01001000", "São Paulo", "SP");
        assertThat(service.selected(quote.id.toString(), address, 2)).isSameAs(quote);
        assertThatThrownBy(() -> service.selected("local-pedreira", address, 2)).isInstanceOf(ShippingQuoteInvalidException.class);
        assertThatThrownBy(() -> service.selected(UUID.randomUUID().toString(), address, 2)).isInstanceOf(ShippingQuoteInvalidException.class);
        assertThatThrownBy(() -> service.selected(quote.id.toString(), address("13920013", "Pedreira", "SP"), 2)).isInstanceOf(ShippingQuoteInvalidException.class);
        assertThatThrownBy(() -> service.selected(quote.id.toString(), address("01001000", "Pedreira", "SP"), 2)).isInstanceOf(ShippingQuoteInvalidException.class);
        assertThatThrownBy(() -> service.selected(quote.id.toString(), address("01001000", "São Paulo", "RJ"), 2)).isInstanceOf(ShippingQuoteInvalidException.class);
        assertThatThrownBy(() -> service.selected(quote.id.toString(), address, 1)).isInstanceOf(ShippingQuoteInvalidException.class);
        quote.environment = "production";
        assertThatThrownBy(() -> service.selected(quote.id.toString(), address, 2)).isInstanceOf(ShippingQuoteInvalidException.class);
        quote.environment = "sandbox";
        quote.subtotalCents = 1;
        assertThatThrownBy(() -> service.selected(quote.id.toString(), address, 2)).isInstanceOf(ShippingQuoteInvalidException.class);
        quote.subtotalCents = 19000;
        quote.expiresAt = now;
        assertThatThrownBy(() -> service.selected(quote.id.toString(), address, 2)).isInstanceOf(ShippingQuoteInvalidException.class);
    }

    @Test void noServiceAndProviderFailureNeverBecomeFreeShipping() {
        when(addresses.verify("01001000", "São Paulo", "SP"))
                .thenReturn(new PostalAddressClient.Address("01001000", "Praça", "Sé", "São Paulo", "SP"));
        when(provider.calculate("01001000", 2, 19000)).thenReturn(List.of());
        assertThat(service.quote(new ShippingQuoteRequest("01001000", "São Paulo", "SP", 2))).isEmpty();
        when(provider.calculate("01001000", 2, 19000)).thenThrow(new ShippingUnavailableException());
        assertThatThrownBy(() -> service.quote(new ShippingQuoteRequest("01001000", "São Paulo", "SP", 2)))
                .isInstanceOf(ShippingUnavailableException.class);
    }

    private ShippingQuoteEntity quote() {
        ShippingQuoteEntity quote = new ShippingQuoteEntity();
        quote.id = UUID.randomUUID(); quote.zipCode = "01001000"; quote.city = "São Paulo"; quote.state = "SP";
        quote.quantity = 2; quote.subtotalCents = 19000; quote.environment = "sandbox";
        quote.providerServiceId = 1; quote.expiresAt = now.plusSeconds(900);
        return quote;
    }
    private CreateOrderRequest.AddressRequest address(String zip, String city, String state) {
        return new CreateOrderRequest.AddressRequest(zip, "Rua", "123", null, "Centro", city, state);
    }
}
