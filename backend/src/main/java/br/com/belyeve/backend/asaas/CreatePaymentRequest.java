package br.com.belyeve.backend.asaas;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import jakarta.validation.Valid;

import java.util.UUID;

public record CreatePaymentRequest(
        @NotNull UUID orderId,
        @NotBlank @Pattern(regexp = "pix|credit_card") String method,
        @Min(1) @Max(3) Integer installments,
        @Valid
        CardRequest card
) {
    @AssertTrue(message = "card data is required for credit card payments")
    boolean isValidCardData() {
        if (!"credit_card".equals(method)) {
            return card == null;
        }
        return card != null && installments != null;
    }

    public record CardRequest(
            @NotBlank @Size(min = 13, max = 19) String number,
            @NotBlank @Size(max = 80) String holderName,
            @NotBlank @Pattern(regexp = "\\d{2}/\\d{2}") String expiry,
            @NotBlank @Pattern(regexp = "\\d{3,4}") String cvv
    ) {
    }
}
