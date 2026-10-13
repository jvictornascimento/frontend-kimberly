package br.com.belyeve.backend.orders;

import br.com.belyeve.backend.config.AppProperties;
import org.springframework.stereotype.Service;


@Service
public class PricingService {
    private static final int MIN_JEWELRY_PER_SCOOP = 2;
    private static final int MIN_GIFTS_PER_SCOOP = 3;

    private final AppProperties properties;

    public PricingService(AppProperties properties) {
        this.properties = properties;
    }

    public Totals calculate(int quantity, long shippingCents) {
        long subtotal = packagePrice(quantity);
        if (shippingCents < 0) throw new BusinessException("Invalid shipping price");
        long unitPrice = java.math.BigDecimal.valueOf(subtotal)
                .divide(java.math.BigDecimal.valueOf(quantity), 0, java.math.RoundingMode.HALF_UP).longValueExact();
        return new Totals(unitPrice, subtotal, 0, shippingCents, Math.addExact(subtotal, shippingCents));
    }

    public Guarantee guarantee(int scoopQuantity) {
        return new Guarantee(MIN_JEWELRY_PER_SCOOP * scoopQuantity, MIN_GIFTS_PER_SCOOP * scoopQuantity);
    }

    public long packagePrice(int scoopQuantity) {
        return switch (scoopQuantity) {
            case 1 -> properties.pricing().scoopOnePriceCents();
            case 2 -> properties.pricing().scoopTwoPriceCents();
            case 3 -> properties.pricing().scoopThreePriceCents();
            default -> throw new BusinessException("Invalid Scoop quantity");
        };
    }

    public record Totals(long unitPriceCents, long subtotalCents, long discountCents, long shippingCents, long totalCents) {
    }

    public record Guarantee(int jewelry, int gifts) {
    }
}
