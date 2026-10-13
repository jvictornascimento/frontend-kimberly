package br.com.belyeve.backend.shipping;

import br.com.belyeve.backend.orders.CreateOrderRequest;
import br.com.belyeve.backend.orders.BusinessException;
import br.com.belyeve.backend.orders.PricingService;
import br.com.belyeve.backend.orders.ShippingOptionResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ShippingService {
    private final PostalAddressClient addresses;
    private final MelhorEnvioClient provider;
    private final ShippingQuoteRepository repository;
    private final ShippingProperties properties;
    private final PricingService pricing;
    private final Clock clock;

    public ShippingService(PostalAddressClient addresses, MelhorEnvioClient provider,
                           ShippingQuoteRepository repository, ShippingProperties properties,
                           PricingService pricing, Clock clock) {
        this.addresses = addresses;
        this.provider = provider;
        this.repository = repository;
        this.properties = properties;
        this.pricing = pricing;
        this.clock = clock;
    }

    @Transactional
    public List<ShippingOptionResponse> quote(ShippingQuoteRequest request) {
        if (request.quantity() == null || request.quantity() < 1 || request.quantity() > 3) {
            throw new BusinessException("Invalid Scoop quantity");
        }
        var address = addresses.verify(request.zipCode(), request.city(), request.state());
        long subtotal = pricing.packagePrice(request.quantity());
        List<ShippingQuoteEntity> quotes = new ArrayList<>();
        if (address.localDelivery()) {
            quotes.add(create(address, request.quantity(), subtotal, null));
        } else {
            for (var rate : provider.calculate(address.zipCode(), request.quantity(), subtotal)) {
                if (java.util.Arrays.stream(properties.services().split(","))
                        .anyMatch(id -> id.equals(Integer.toString(rate.serviceId())))) {
                    quotes.add(create(address, request.quantity(), subtotal, rate));
                }
            }
        }
        return repository.saveAll(quotes).stream().map(ShippingQuoteEntity::response).toList();
    }

    private ShippingQuoteEntity create(PostalAddressClient.Address address, int quantity,
                                       long subtotal, MelhorEnvioClient.Rate rate) {
        ShippingQuoteEntity quote = new ShippingQuoteEntity();
        quote.id = UUID.randomUUID();
        quote.zipCode = address.zipCode();
        quote.city = address.city();
        quote.state = address.state();
        quote.quantity = quantity;
        quote.subtotalCents = subtotal;
        quote.environment = rate == null ? "local" : properties.environment();
        quote.kind = rate == null ? "local_delivery" : "carrier";
        quote.carrier = rate == null ? "BELYEVE" : rate.carrier();
        quote.service = rate == null ? "Entrega grátis em Pedreira" : rate.service();
        quote.providerServiceId = rate == null ? null : rate.serviceId();
        quote.priceCents = rate == null ? 0 : rate.priceCents();
        quote.minDays = rate == null ? null : rate.minDays();
        quote.maxDays = rate == null ? null : rate.maxDays();
        quote.expiresAt = clock.instant().plusSeconds(properties.quoteTtlSeconds());
        return quote;
    }

    @Transactional(readOnly = true)
    public ShippingQuoteEntity selected(String id, CreateOrderRequest.AddressRequest address, int quantity) {
        UUID quoteId;
        try { quoteId = UUID.fromString(id); }
        catch (IllegalArgumentException error) { throw new ShippingQuoteInvalidException(); }
        ShippingQuoteEntity quote = repository.findById(quoteId).orElseThrow(ShippingQuoteInvalidException::new);
        if (!clock.instant().isBefore(quote.expiresAt)
                || !quote.zipCode.equals(address.zipCode().replace("-", ""))
                || !PostalAddressClient.normalize(quote.city).equals(PostalAddressClient.normalize(address.city()))
                || !quote.state.equals(address.state()) || quote.quantity != quantity
                || quote.subtotalCents != pricing.packagePrice(quantity)
                || (quote.providerServiceId != null && (!properties.enabled()
                    || !quote.environment.equals(properties.environment())
                    || !java.util.Arrays.asList(properties.services().split(",")).contains(quote.providerServiceId.toString())))) {
            throw new ShippingQuoteInvalidException();
        }
        return quote;
    }
}
