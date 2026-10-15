package br.com.belyeve.backend.orders;

import br.com.belyeve.backend.shipping.ShippingService;
import br.com.belyeve.backend.shipping.ShippingQuoteEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class OrderService {
    private final OrderRepository repository;
    private final PricingService pricingService;

    private final ShippingService shippingService;

    public OrderService(OrderRepository repository, PricingService pricingService, ShippingService shippingService) {
        this.repository = repository;
        this.pricingService = pricingService;
        this.shippingService = shippingService;
    }

    private OrderEntity create(CreateOrderRequest request, ShippingQuoteEntity quote) {
        var shipping = quote.response();
        PricingService.Totals totals = pricingService.calculate(request.scoopQuantity(), shipping.priceCents());
        OrderEntity order = new OrderEntity(UUID.randomUUID());
        order.setScoopQuantity(request.scoopQuantity());
        order.setJewelryCategory(request.jewelryCategory());
        order.setUsesRings(request.usesRings());
        order.setRingSize(trimToNull(request.ringSize()));
        order.setAllowsMalePieces(request.allowsMalePieces());
        order.setMaleJewelryCategory(request.allowsMalePieces() ? request.maleJewelryCategory() : null);
        order.setAllowsPiercing(request.allowsPiercing());
        order.setPiercingLocations(request.allowsPiercing() ? trimToNull(request.piercingLocations()) : null);
        order.setRestrictions(trimToNull(request.restrictions()));
        order.setSocialMediaConsent(request.socialMediaConsent());
        order.setFullName(request.customer().fullName().trim());
        order.setWhatsapp(request.customer().whatsapp());
        order.setEmail(request.customer().email().trim().toLowerCase());
        order.setCpf(request.customer().cpf());
        order.setZipCode(request.address().zipCode().replace("-", ""));
        order.setStreet(request.address().street().trim());
        order.setAddressNumber(request.address().number().trim());
        order.setComplement(trimToNull(request.address().complement()));
        order.setDistrict(request.address().district().trim());
        order.setCity(request.address().city().trim());
        order.setState(request.address().state().trim().toUpperCase());
        order.setUnitPriceCents(totals.unitPriceCents());
        order.setSubtotalCents(totals.subtotalCents());
        order.setDiscountCents(totals.discountCents());
        order.setShippingCents(totals.shippingCents());
        order.setTotalCents(totals.totalCents());
        order.setShippingQuoteId(UUID.fromString(shipping.id()));
        order.setShippingKind(shipping.kind());
        order.setShippingCarrier(shipping.carrier());
        order.setShippingService(shipping.service());
        order.setShippingProviderServiceId(quote.getProviderServiceId());
        order.setShippingEnvironment(quote.getEnvironment());
        order.setShippingMinDays(shipping.estimatedDays() == null ? null : shipping.estimatedDays().min());
        order.setShippingMaxDays(shipping.estimatedDays() == null ? null : shipping.estimatedDays().max());
        return repository.save(order);
    }

    @Transactional
    public OrderEntity create(CheckoutOrderRequest request) {
        if ("credit_card".equals(request.paymentMethod())
                && (request.installments() == null || request.installments() < 1 || request.installments() > 3)) {
            throw new BusinessException("Invalid installment count");
        }
        ShippingQuoteEntity quote = shippingService.selected(request.shippingOptionId(), request.address(), request.item().quantity());
        OrderEntity order = create(request.toCreateOrderRequest(), quote);
        order.setPaymentMethod(PaymentMethod.valueOf(request.paymentMethod().toUpperCase()));
        order.setInstallments(request.installments());
        return order;
    }

    @Transactional(readOnly = true)
    public OrderEntity find(UUID id) {
        return repository.findById(id).orElseThrow(OrderNotFoundException::new);
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) return null;
        return value.trim();
    }
}
