package br.com.belyeve.backend.orders;

public record ShippingOptionResponse(
        String id,
        String kind,
        String carrier,
        String service,
        EstimatedDays estimatedDays,
        long priceCents,
        java.time.Instant expiresAt
) {
    public static ShippingOptionResponse from(OrderEntity order) {
        if (order.getShippingQuoteId() != null) {
            return new ShippingOptionResponse(order.getShippingQuoteId().toString(), order.getShippingKind(),
                    order.getShippingCarrier(), order.getShippingService(),
                    order.getShippingMinDays() == null ? null : new EstimatedDays(order.getShippingMinDays(), order.getShippingMaxDays()),
                    order.getShippingCents(), null);
        }
        if (order.getShippingCents() == 0 && isPedreira(order)) {
            return localDelivery();
        }
        return carrier(order.getShippingCents());
    }

    public static ShippingOptionResponse localDelivery() {
        return new ShippingOptionResponse(
                "local-pedreira",
                "local_delivery",
                "BELYEVE",
                "Entrega grátis em Pedreira",
                null,
                0,
                null
        );
    }

    public static ShippingOptionResponse carrier(long priceCents) {
        return new ShippingOptionResponse(
                "configured-shipping",
                "carrier",
                "BELYEVE",
                "Frete configurado",
                null,
                priceCents,
                null
        );
    }

    private static boolean isPedreira(OrderEntity order) {
        return order.getCity().equalsIgnoreCase("Pedreira") && order.getState().equalsIgnoreCase("SP");
    }

    public record EstimatedDays(int min, int max) {
    }
}
