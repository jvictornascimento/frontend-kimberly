package br.com.belyeve.backend.orders;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

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
            @NotBlank @Pattern(regexp = "dourado|prata") String metal,
            @NotNull Boolean wearsRings,
            @Size(max = 20) String ringSize,
            @Size(max = 500) String avoidNote
    ) {
        JewelryCategory jewelryCategory() {
            return "dourado".equals(metal) ? JewelryCategory.GOLD : JewelryCategory.SILVER;
        }
    }
}
