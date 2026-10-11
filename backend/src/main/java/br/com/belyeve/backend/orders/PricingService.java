package br.com.belyeve.backend.orders;

import br.com.belyeve.backend.config.AppProperties;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.Locale;

@Service
public class PricingService {
    private static final int MIN_JEWELRY_PER_SCOOP = 2;
    private static final int MIN_GIFTS_PER_SCOOP = 3;

    private final AppProperties properties;

    public PricingService(AppProperties properties) {
        this.properties = properties;
    }

    public Totals calculate(CreateOrderRequest request) {
        long subtotal = packagePrice(request.scoopQuantity());
        long unitPrice = Math.round((double) subtotal / request.scoopQuantity());
        long discount = 0;
        long shipping = isPedreiraSP(request.address().zipCode(), request.address().city(), request.address().state())
                ? 0
                : properties.pricing().nonLocalShippingCents();
        long total = subtotal - discount + shipping;
        return new Totals(unitPrice, subtotal, discount, shipping, total);
    }

    public Guarantee guarantee(int scoopQuantity) {
        return new Guarantee(MIN_JEWELRY_PER_SCOOP * scoopQuantity, MIN_GIFTS_PER_SCOOP * scoopQuantity);
    }

    private long packagePrice(int scoopQuantity) {
        return switch (scoopQuantity) {
            case 1 -> properties.pricing().scoopOnePriceCents();
            case 2 -> properties.pricing().scoopTwoPriceCents();
            case 3 -> properties.pricing().scoopThreePriceCents();
            default -> throw new BusinessException("Invalid Scoop quantity");
        };
    }

    private boolean isPedreiraSP(String zipCode, String city, String state) {
        return zipCode.replace("-", "").startsWith("13920")
                || (city != null && state != null
                && normalize(city).equals("pedreira") && state.trim().equalsIgnoreCase("SP"));
    }

    private String normalize(String value) {
        return Normalizer.normalize(value.trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT);
    }

    public record Totals(long unitPriceCents, long subtotalCents, long discountCents, long shippingCents, long totalCents) {
    }

    public record Guarantee(int jewelry, int gifts) {
    }
}
