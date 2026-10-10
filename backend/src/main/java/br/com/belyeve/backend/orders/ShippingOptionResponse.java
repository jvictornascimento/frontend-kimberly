package br.com.belyeve.backend.orders;

public record ShippingOptionResponse(
        String id,
        String kind,
        String carrier,
        String service,
        EstimatedDays estimatedDays,
        long priceCents
) {
    public static ShippingOptionResponse from(OrderEntity order) {
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
                0
        );
    }

    public static ShippingOptionResponse carrier(long priceCents) {
        return new ShippingOptionResponse(
                "configured-shipping",
                "carrier",
                "BELYEVE",
                "Frete configurado",
                new EstimatedDays(5, 9),
                priceCents
        );
    }

    private static boolean isPedreira(OrderEntity order) {
        return order.getCity().equalsIgnoreCase("Pedreira") && order.getState().equalsIgnoreCase("SP");
    }

    public record EstimatedDays(int min, int max) {
    }
}
