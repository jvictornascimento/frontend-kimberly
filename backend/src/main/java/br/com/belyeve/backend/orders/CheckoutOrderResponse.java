package br.com.belyeve.backend.orders;

import java.time.Instant;
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
                order.getJewelryCategory() == JewelryCategory.GOLD ? "dourado" : "prata",
                order.isUsesRings(),
                order.getRingSize(),
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
                null,
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
}
