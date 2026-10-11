package br.com.belyeve.backend.asaas;

import br.com.belyeve.backend.orders.BusinessException;
import br.com.belyeve.backend.orders.OrderEntity;
import br.com.belyeve.backend.orders.OrderNotFoundException;
import br.com.belyeve.backend.orders.OrderRepository;
import br.com.belyeve.backend.orders.OrderStatus;
import br.com.belyeve.backend.orders.PaymentMethod;
import br.com.belyeve.backend.orders.PaymentStatus;
import br.com.belyeve.backend.notifications.PaidOrderEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.Optional;
import java.util.UUID;

@Service
public class PaymentService {
    private static final ZoneId ASAAS_LOCAL_TIME_ZONE = ZoneId.of("America/Sao_Paulo");
    private final OrderRepository orderRepository;
    private final AsaasClient asaasClient;
    private final ApplicationEventPublisher eventPublisher;

    public PaymentService(
            OrderRepository orderRepository,
            AsaasClient asaasClient,
            ApplicationEventPublisher eventPublisher
    ) {
        this.orderRepository = orderRepository;
        this.asaasClient = asaasClient;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public PixPaymentResponse createPix(UUID orderId) {
        OrderEntity order = orderRepository.findById(orderId).orElseThrow(OrderNotFoundException::new);
        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            throw new BusinessException("Order is already paid");
        }
        if (order.getAsaasPaymentId() != null) {
            return PixPaymentResponse.from(order);
        }

        Optional<AsaasClient.PaymentResponse> existingPayment =
                asaasClient.findPixPaymentByExternalReference(order.getId());
        AsaasClient.CustomerResponse customer;
        AsaasClient.PaymentResponse payment;
        if (existingPayment.isPresent()) {
            payment = existingPayment.get();
            if (payment.customer() == null || payment.customer().isBlank()) {
                throw new BusinessException("Existing PIX payment has no customer reference");
            }
            customer = new AsaasClient.CustomerResponse(payment.customer());
        } else {
            customer = asaasClient.createCustomer(order);
            payment = asaasClient.createPixPayment(order, customer.id());
        }
        AsaasClient.PixQrCodeResponse qrCode = asaasClient.getPixQrCode(payment.id());

        order.setAsaasCustomerId(customer.id());
        order.setAsaasPaymentId(payment.id());
        order.setPaymentMethod(PaymentMethod.PIX);
        order.setStatus(OrderStatus.AWAITING_PAYMENT);
        order.setPaymentStatus(PaymentStatus.AWAITING_PAYMENT);
        order.setPixPayload(qrCode.payload());
        order.setPixQrCodeBase64(qrCode.encodedImage());
        order.setPixExpirationAt(parseExpiration(qrCode.expirationDate()));
        return PixPaymentResponse.from(order);
    }

    @Transactional
    public CardPaymentResponse createCard(UUID orderId, CreatePaymentRequest.Card card, int installments, String remoteIp) {
        OrderEntity order = orderRepository.findById(orderId).orElseThrow(OrderNotFoundException::new);
        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            throw new BusinessException("Order is already paid");
        }
        if (order.getPaymentMethod() != PaymentMethod.CREDIT_CARD) {
            throw new BusinessException("Order is not set for credit card payment");
        }
        if (installments < 1 || installments > 3) {
            throw new BusinessException("Invalid installment count");
        }
        if (order.getAsaasPaymentId() != null
                && order.getPaymentStatus() != PaymentStatus.PAYMENT_FAILED
                && order.getPaymentStatus() != PaymentStatus.CANCELLED) {
            return new CardPaymentResponse(order.getAsaasPaymentId(), order.getPaymentStatus(),
                    order.getInstallments() == null ? installments : order.getInstallments());
        }

        Optional<AsaasClient.PaymentResponse> existingPayment =
                asaasClient.findPaymentByExternalReference(order.getId(), "CREDIT_CARD");
        if (existingPayment.isPresent()
                && !"REFUSED".equals(existingPayment.get().status())
                && !"OVERDUE".equals(existingPayment.get().status())
                && !"DELETED".equals(existingPayment.get().status())
                && !"REFUNDED".equals(existingPayment.get().status())) {
            AsaasClient.PaymentResponse payment = existingPayment.get();
            PaymentStatus status = mapAsaasPaymentStatus(payment.status());
            order.setAsaasCustomerId(payment.customer());
            order.setAsaasPaymentId(payment.id());
            order.setPaymentStatus(status);
            order.setStatus(status == PaymentStatus.PAID ? OrderStatus.PAID : OrderStatus.AWAITING_PAYMENT);
            if (status == PaymentStatus.PAID) eventPublisher.publishEvent(new PaidOrderEvent(order.getId()));
            return new CardPaymentResponse(payment.id(), status, installments);
        }

        AsaasClient.CustomerResponse customer = asaasClient.findCustomerByExternalReference(order.getId())
                .orElseGet(() -> asaasClient.createCustomer(order));
        AsaasClient.PaymentResponse payment = asaasClient.createCardPayment(
                order, customer.id(), card, installments, remoteIp
        );
        PaymentStatus status = mapAsaasPaymentStatus(payment.status());
        order.setAsaasCustomerId(customer.id());
        order.setAsaasPaymentId(payment.id());
        order.setPaymentMethod(PaymentMethod.CREDIT_CARD);
        order.setPaymentStatus(status);
        order.setStatus(status == PaymentStatus.PAID ? OrderStatus.PAID
                : status == PaymentStatus.PAYMENT_FAILED ? OrderStatus.PAYMENT_FAILED
                : status == PaymentStatus.CANCELLED ? OrderStatus.CANCELLED
                : OrderStatus.AWAITING_PAYMENT);
        if (status == PaymentStatus.PAID) eventPublisher.publishEvent(new PaidOrderEvent(order.getId()));
        return new CardPaymentResponse(payment.id(), status, installments);
    }

    @Transactional
    public void markFromAsaas(String paymentId, String eventType) {
        orderRepository.findByAsaasPaymentId(paymentId).ifPresent(order -> {
            PaymentStatus previousStatus = order.getPaymentStatus();
            PaymentStatus paymentStatus = mapPaymentStatus(eventType);
            order.setPaymentStatus(paymentStatus);
            if (paymentStatus == PaymentStatus.PAID) {
                order.setStatus(OrderStatus.PAID);
                if (previousStatus != PaymentStatus.PAID) {
                    eventPublisher.publishEvent(new PaidOrderEvent(order.getId()));
                }
            } else if (paymentStatus == PaymentStatus.PAYMENT_FAILED) {
                order.setStatus(OrderStatus.PAYMENT_FAILED);
            } else if (paymentStatus == PaymentStatus.CANCELLED) {
                order.setStatus(OrderStatus.CANCELLED);
            }
        });
    }

    @Transactional(readOnly = true)
    public PaymentStatus statusByPaymentId(String paymentId) {
        return orderRepository.findByAsaasPaymentId(paymentId)
                .map(OrderEntity::getPaymentStatus)
                .orElse(PaymentStatus.PAYMENT_PROCESSING);
    }

    private PaymentStatus mapPaymentStatus(String eventType) {
        return switch (eventType) {
            case "PAYMENT_RECEIVED", "PAYMENT_CONFIRMED" -> PaymentStatus.PAID;
            case "PAYMENT_OVERDUE", "PAYMENT_DELETED" -> PaymentStatus.PAYMENT_FAILED;
            case "PAYMENT_REFUNDED", "PAYMENT_REFUND_DENIED", "PAYMENT_CHARGEBACK_REQUESTED" -> PaymentStatus.CANCELLED;
            default -> PaymentStatus.PAYMENT_PROCESSING;
        };
    }

    private PaymentStatus mapAsaasPaymentStatus(String status) {
        return switch (status == null ? "" : status) {
            case "CONFIRMED", "RECEIVED" -> PaymentStatus.PAID;
            case "PENDING", "AWAITING_RISK_ANALYSIS" -> PaymentStatus.AWAITING_PAYMENT;
            case "OVERDUE", "REFUSED", "CHARGEBACK" -> PaymentStatus.PAYMENT_FAILED;
            case "REFUNDED", "DELETED" -> PaymentStatus.CANCELLED;
            default -> PaymentStatus.PAYMENT_PROCESSING;
        };
    }

    private Instant parseExpiration(String expirationDate) {
        if (expirationDate == null || expirationDate.isBlank()) return null;
        try {
            return OffsetDateTime.parse(expirationDate).toInstant();
        } catch (java.time.format.DateTimeParseException ignored) {
            // Asaas also returns local date-times such as "2027-10-12 23:59:59".
            return LocalDateTime.parse(expirationDate.replace(' ', 'T'))
                    .atZone(ASAAS_LOCAL_TIME_ZONE)
                    .toInstant();
        }
    }
}
