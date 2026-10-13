package br.com.belyeve.backend.orders;

import br.com.belyeve.backend.shipping.ShippingService;
import br.com.belyeve.backend.shipping.ShippingQuoteRequest;
import br.com.belyeve.backend.shipping.PostalAddressClient;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CheckoutSupportController {
    private final ShippingService shipping;
    private final PostalAddressClient addresses;

    public CheckoutSupportController(ShippingService shipping, PostalAddressClient addresses) {
        this.shipping = shipping;
        this.addresses = addresses;
    }

    @PostMapping("/shipping/quote")
    public List<ShippingOptionResponse> shippingQuote(@Valid @RequestBody ShippingQuoteRequest request) {
        return shipping.quote(request);
    }

    @PostMapping("/payments/installments")
    public List<InstallmentOptionResponse> installments(@Valid @RequestBody InstallmentRequest request) {
        if (request.totalCents() == null) return List.of();
        return List.of(
                new InstallmentOptionResponse(1, request.totalCents(), request.totalCents()),
                new InstallmentOptionResponse(2, Math.round((double) request.totalCents() / 2), request.totalCents()),
                new InstallmentOptionResponse(3, Math.round((double) request.totalCents() / 3), request.totalCents())
        );
    }

    @GetMapping("/addresses/{zipCode}")
    public AddressLookupResponse address(@PathVariable @Pattern(regexp = "\\d{5}-?\\d{3}") String zipCode) {
        var address = addresses.lookup(zipCode);
        return address == null ? null : new AddressLookupResponse(address.street(), address.district(), address.city(), address.state());
    }

    public record InstallmentRequest(Long totalCents) {
    }

    public record InstallmentOptionResponse(int installments, long installmentValueCents, long totalWithFeesCents) {
    }

    public record AddressLookupResponse(String street, String district, String city, String state) {
    }
}
