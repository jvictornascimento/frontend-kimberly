package br.com.belyeve.backend.orders;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class OrderService {
    private final OrderRepository repository;
    private final PricingService pricingService;

    public OrderService(OrderRepository repository, PricingService pricingService) {
        this.repository = repository;
        this.pricingService = pricingService;
    }

    @Transactional
    public OrderEntity create(CreateOrderRequest request) {
        PricingService.Totals totals = pricingService.calculate(request);
        OrderEntity order = new OrderEntity(UUID.randomUUID());
        order.setScoopQuantity(request.scoopQuantity());
        order.setJewelryCategory(request.jewelryCategory());
        order.setUsesRings(request.usesRings());
        order.setRingSize(trimToNull(request.ringSize()));
        order.setRestrictions(trimToNull(request.restrictions()));
        order.setSocialMediaConsent(request.socialMediaConsent());
        order.setFullName(request.customer().fullName().trim());
        order.setWhatsapp(request.customer().whatsapp());
        order.setEmail(request.customer().email().trim().toLowerCase());
        order.setCpf(request.customer().cpf());
        order.setZipCode(request.address().zipCode());
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
        return repository.save(order);
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
