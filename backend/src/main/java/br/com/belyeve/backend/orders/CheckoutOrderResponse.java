package br.com.belyeve.backend.orders;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

public record CheckoutOrderResponse(
        UUID id,
        OrderStatus status,
        CheckoutOrderRequest.Item item,
        OrderResponse.Customer customer,
        OrderResponse.Address address,
        ShippingOptionResponse shipping,
        String paymentMethod,
        Integer installments,
        boolean socialMediaConsent,
        OrderResponse.Totals totals,
        Instant createdAt
) {
    public static CheckoutOrderResponse from(OrderEntity order) {
        CheckoutOrderRequest.Preferences preferences = new CheckoutOrderRequest.Preferences(
                toMetalValue(order.getJewelryCategory()),
                order.isUsesRings(),
                order.getRingSize(),
                order.isAllowsMalePieces(),
                order.getMaleJewelryCategory() == null ? null : toMetalValue(order.getMaleJewelryCategory()),
                order.isAllowsPiercing(),
                order.getAllowsReligiousItems(),
                splitPiercingLocations(order.getPiercingLocations()),
                order.getRestrictions()
        );
        CheckoutOrderRequest.Item item = new CheckoutOrderRequest.Item(
                "scoop-" + order.getScoopQuantity(),
                order.getScoopQuantity(),
                order.getUnitPriceCents(),
                preferences
        );
        return new CheckoutOrderResponse(
                order.getId(),
                order.getStatus(),
                item,
                new OrderResponse.Customer(order.getFullName(), order.getWhatsapp(), order.getEmail(), order.getCpf()),
                new OrderResponse.Address(
                        order.getZipCode(),
                        order.getStreet(),
                        order.getAddressNumber(),
                        order.getComplement(),
                        order.getDistrict(),
                        order.getCity(),
                        order.getState()
                ),
                ShippingOptionResponse.from(order),
                order.getPaymentMethod() == null ? null : order.getPaymentMethod().name().toLowerCase(),
                order.getInstallments(),
                order.isSocialMediaConsent(),
                new OrderResponse.Totals(
                        order.getUnitPriceCents(),
                        order.getSubtotalCents(),
                        order.getDiscountCents(),
                        order.getShippingCents(),
                        order.getTotalCents()
                ),
                order.getCreatedAt()
        );
    }

    private static String toMetalValue(JewelryCategory category) {
        return switch (category) {
            case GOLD -> "dourado";
            case SILVER -> "prata";
            case MIXED -> "misto";
        };
    }

    private static List<String> splitPiercingLocations(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }
        return Arrays.stream(value.split(",")).filter(item -> !item.isBlank()).toList();
    }
}
