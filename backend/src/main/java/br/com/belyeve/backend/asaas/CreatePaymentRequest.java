package br.com.belyeve.backend.asaas;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreatePaymentRequest(
        @NotNull UUID orderId,
        @NotBlank @Pattern(regexp = "pix|credit_card") String method,
        @Min(1) @Max(3) Integer installments,
        @jakarta.validation.Valid Card card
) {
    public record Card(
            @NotBlank @Pattern(regexp = "[0-9 ]{13,23}") String number,
            @NotBlank @Size(min = 3, max = 60) String holderName,
            @NotBlank @Pattern(regexp = "(0[1-9]|1[0-2])/[0-9]{2,4}") String expiry,
            @NotBlank @Pattern(regexp = "[0-9]{3,4}") String cvv
    ) {}
}
