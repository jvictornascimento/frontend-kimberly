package br.com.belyeve.backend.orders;

import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateOrderRequest(
        @NotNull Integer scoopQuantity,
        @NotNull JewelryCategory jewelryCategory,
        @NotNull Boolean usesRings,
        @Size(max = 20) String ringSize,
        @Size(max = 500) String restrictions,
        @NotNull Boolean socialMediaConsent,
        @Valid @NotNull CustomerRequest customer,
        @Valid @NotNull AddressRequest address
) {
    @AssertTrue(message = "scoopQuantity must be 1, 2, or 3")
    boolean isValidScoopQuantity() {
        return scoopQuantity != null && (scoopQuantity == 1 || scoopQuantity == 2 || scoopQuantity == 3);
    }

    @AssertTrue(message = "ringSize is required when rings are enabled")
    boolean isValidRingSize() {
        if (usesRings == null) return true;
        if (!usesRings) return ringSize == null || ringSize.isBlank();
        return ringSize != null && !ringSize.isBlank();
    }

    public record CustomerRequest(
            @NotBlank @Size(max = 120) String fullName,
            @NotBlank @Pattern(regexp = "\\d{10,11}", message = "whatsapp must contain 10 or 11 digits") String whatsapp,
            @NotBlank @Email @Size(max = 160) String email,
            @NotBlank @Pattern(regexp = "\\d{11}", message = "cpf must contain 11 digits") String cpf
    ) {
    }

    public record AddressRequest(
            @NotBlank @Pattern(regexp = "\\d{8}", message = "zipCode must contain 8 digits") String zipCode,
            @NotBlank @Size(max = 160) String street,
            @NotBlank @Size(max = 40) String number,
            @Size(max = 120) String complement,
            @NotBlank @Size(max = 120) String district,
            @NotBlank @Size(max = 120) String city,
            @NotBlank @Pattern(regexp = "[A-Z]{2}", message = "state must be a valid UF") String state
    ) {
    }
}
