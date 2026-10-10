package br.com.belyeve.backend.orders;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CheckoutOrderRequest(
        @Valid @NotNull Item item,
        @Valid @NotNull CreateOrderRequest.CustomerRequest customer,
        @Valid @NotNull CreateOrderRequest.AddressRequest address,
        @NotBlank @Size(max = 80) String shippingOptionId,
        @NotBlank @Pattern(regexp = "pix|credit_card") String paymentMethod,
        Integer installments,
        @NotNull Boolean socialMediaConsent
) {
    public CreateOrderRequest toCreateOrderRequest() {
        return new CreateOrderRequest(
                item.quantity(),
                item.preferences().jewelryCategory(),
                item.preferences().wearsRings(),
                item.preferences().ringSize(),
                item.preferences().allowsMalePieces(),
                item.preferences().maleJewelryCategory(),
                item.preferences().allowsPiercing(),
                item.preferences().joinedPiercingLocations(),
                item.preferences().avoidNote(),
                socialMediaConsent,
                customer,
                address
        );
    }

    public record Item(
            @NotBlank @Size(max = 80) String packageId,
            @NotNull Integer quantity,
            Long unitPriceCents,
            @Valid @NotNull Preferences preferences
    ) {
    }

    public record Preferences(
            @NotBlank @Pattern(regexp = "dourado|prata|misto") String metal,
            @NotNull Boolean wearsRings,
            @Size(max = 20) String ringSize,
            @NotNull Boolean allowsMalePieces,
            @Pattern(regexp = "dourado|prata|misto") String maleMetal,
            @NotNull Boolean allowsPiercing,
            @Size(max = 2) List<@Pattern(regexp = "nariz|helix") String> piercingLocations,
            @Size(max = 500) String avoidNote
    ) {
        JewelryCategory jewelryCategory() {
            return toJewelryCategory(metal);
        }

        JewelryCategory maleJewelryCategory() {
            return maleMetal == null ? null : toJewelryCategory(maleMetal);
        }

        String joinedPiercingLocations() {
            if (piercingLocations == null || piercingLocations.isEmpty()) {
                return null;
            }
            return String.join(",", piercingLocations);
        }

        private JewelryCategory toJewelryCategory(String value) {
            return switch (value) {
                case "dourado" -> JewelryCategory.GOLD;
                case "prata" -> JewelryCategory.SILVER;
                case "misto" -> JewelryCategory.MIXED;
                default -> throw new IllegalArgumentException("Invalid jewelry category");
            };
        }
    }
}
