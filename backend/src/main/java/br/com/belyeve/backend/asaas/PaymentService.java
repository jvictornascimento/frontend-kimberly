package br.com.belyeve.backend.asaas;

import br.com.belyeve.backend.orders.BusinessException;
import br.com.belyeve.backend.orders.OrderEntity;
import br.com.belyeve.backend.orders.OrderNotFoundException;
import br.com.belyeve.backend.orders.OrderRepository;
import br.com.belyeve.backend.orders.OrderStatus;
import br.com.belyeve.backend.orders.PaymentMethod;
import br.com.belyeve.backend.orders.PaymentStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class PaymentService {
    private final OrderRepository orderRepository;
    private final AsaasClient asaasClient;

    public PaymentService(OrderRepository orderRepository, AsaasClient asaasClient) {
        this.orderRepository = orderRepository;
        this.asaasClient = asaasClient;
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

        AsaasClient.CustomerResponse customer = asaasClient.createCustomer(order);
        AsaasClient.PaymentResponse payment = asaasClient.createPixPayment(order, customer.id());
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
    public void markFromAsaas(String paymentId, String eventType) {
        orderRepository.findByAsaasPaymentId(paymentId).ifPresent(order -> {
            PaymentStatus paymentStatus = mapPaymentStatus(eventType);
            order.setPaymentStatus(paymentStatus);
            if (paymentStatus == PaymentStatus.PAID) {
                order.setStatus(OrderStatus.PAID);
            } else if (paymentStatus == PaymentStatus.PAYMENT_FAILED) {
                order.setStatus(OrderStatus.PAYMENT_FAILED);
            } else if (paymentStatus == PaymentStatus.CANCELLED) {
                order.setStatus(OrderStatus.CANCELLED);
            }
        });
    }

    private PaymentStatus mapPaymentStatus(String eventType) {
        return switch (eventType) {
            case "PAYMENT_RECEIVED", "PAYMENT_CONFIRMED" -> PaymentStatus.PAID;
            case "PAYMENT_OVERDUE", "PAYMENT_DELETED" -> PaymentStatus.PAYMENT_FAILED;
            case "PAYMENT_REFUNDED", "PAYMENT_REFUND_DENIED", "PAYMENT_CHARGEBACK_REQUESTED" -> PaymentStatus.CANCELLED;
            default -> PaymentStatus.PAYMENT_PROCESSING;
        };
    }

    private Instant parseExpiration(String expirationDate) {
        if (expirationDate == null || expirationDate.isBlank()) return null;
        return OffsetDateTime.parse(expirationDate).toInstant();
    }
}
