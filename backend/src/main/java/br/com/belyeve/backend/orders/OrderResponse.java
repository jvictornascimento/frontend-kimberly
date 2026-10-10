package br.com.belyeve.backend.orders;

import java.time.Instant;
import java.util.UUID;

public record OrderResponse(
        UUID id,
        OrderStatus status,
        PaymentStatus paymentStatus,
        int scoopQuantity,
        JewelryCategory jewelryCategory,
        boolean usesRings,
        String ringSize,
        boolean allowsMalePieces,
        JewelryCategory maleJewelryCategory,
        boolean allowsPiercing,
        String piercingLocations,
        String restrictions,
        boolean socialMediaConsent,
        Customer customer,
        Address address,
        Totals totals,
        Instant createdAt
) {
    public record Customer(String fullName, String whatsapp, String email, String cpf) {
    }

    public record Address(
            String zipCode,
            String street,
            String number,
            String complement,
            String district,
            String city,
            String state
    ) {
    }

    public record Totals(
            long unitPriceCents,
            long subtotalCents,
            long discountCents,
            long shippingCents,
            long totalCents
    ) {
    }

    public static OrderResponse from(OrderEntity order) {
        return new OrderResponse(
                order.getId(),
                order.getStatus(),
                order.getPaymentStatus(),
                order.getScoopQuantity(),
                order.getJewelryCategory(),
                order.isUsesRings(),
                order.getRingSize(),
                order.isAllowsMalePieces(),
                order.getMaleJewelryCategory(),
                order.isAllowsPiercing(),
                order.getPiercingLocations(),
                order.getRestrictions(),
                order.isSocialMediaConsent(),
                new Customer(order.getFullName(), order.getWhatsapp(), order.getEmail(), order.getCpf()),
                new Address(
                        order.getZipCode(),
                        order.getStreet(),
                        order.getAddressNumber(),
                        order.getComplement(),
                        order.getDistrict(),
                        order.getCity(),
                        order.getState()
                ),
                new Totals(
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
