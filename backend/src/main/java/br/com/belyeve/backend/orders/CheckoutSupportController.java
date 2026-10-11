package br.com.belyeve.backend.orders;

import br.com.belyeve.backend.config.AppProperties;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api")
public class CheckoutSupportController {
    private final AppProperties properties;

    public CheckoutSupportController(AppProperties properties) {
        this.properties = properties;
    }

    @PostMapping("/shipping/quote")
    public List<ShippingOptionResponse> shippingQuote(@Valid @RequestBody ShippingQuoteRequest request) {
        if (isPedreiraSP(request.city(), request.state())) {
            return List.of(ShippingOptionResponse.localDelivery());
        }
        return List.of(ShippingOptionResponse.carrier(properties.pricing().nonLocalShippingCents()));
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
        if (zipCode.replace("-", "").startsWith("13920")) {
            return new AddressLookupResponse("", "", "Pedreira", "SP");
        }
        return null;
    }

    private boolean isPedreiraSP(String city, String state) {
        return normalize(city).equals("pedreira") && state.toUpperCase(Locale.ROOT).equals("SP");
    }

    private String normalize(String value) {
        return Normalizer.normalize(value.trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT);
    }

    public record ShippingQuoteRequest(
            @NotBlank @Pattern(regexp = "\\d{5}-?\\d{3}") String zipCode,
            @NotBlank String city,
            @NotBlank @Pattern(regexp = "(?i)[A-Z]{2}") String state,
            @NotNull @Min(1) Integer quantity
    ) {
    }

    public record InstallmentRequest(Long totalCents) {
    }

    public record InstallmentOptionResponse(int installments, long installmentValueCents, long totalWithFeesCents) {
    }

    public record AddressLookupResponse(String street, String district, String city, String state) {
    }
}
