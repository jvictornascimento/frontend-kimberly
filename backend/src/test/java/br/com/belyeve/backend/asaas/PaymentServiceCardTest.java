package br.com.belyeve.backend.asaas;

import br.com.belyeve.backend.notifications.PaidOrderEvent;
import br.com.belyeve.backend.orders.OrderEntity;
import br.com.belyeve.backend.orders.OrderRepository;
import br.com.belyeve.backend.orders.OrderStatus;
import br.com.belyeve.backend.orders.PaymentMethod;
import br.com.belyeve.backend.orders.PaymentStatus;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PaymentServiceCardTest {
    @Test
    void createsCardPaymentAndPublishesPaidOrderEvent() {
        UUID orderId = UUID.randomUUID();
        OrderEntity order = new OrderEntity(orderId);
        order.setPaymentMethod(PaymentMethod.CREDIT_CARD);
        order.setInstallments(2);
        OrderRepository repository = mock(OrderRepository.class);
        AsaasClient asaasClient = mock(AsaasClient.class);
        ApplicationEventPublisher events = mock(ApplicationEventPublisher.class);
        var card = new CreatePaymentRequest.Card("4111 1111 1111 1111", "Joao Victor", "12/30", "123");
        when(repository.findById(orderId)).thenReturn(Optional.of(order));
        when(asaasClient.findCustomerByExternalReference(orderId))
                .thenReturn(Optional.of(new AsaasClient.CustomerResponse("cus_123")));
        when(asaasClient.createCardPayment(order, "cus_123", card, 2, "203.0.113.10"))
                .thenReturn(new AsaasClient.PaymentResponse("pay_123", "CONFIRMED", "cus_123", "CREDIT_CARD"));

        CardPaymentResponse response = new PaymentService(repository, asaasClient, events)
                .createCard(orderId, card, 2, "203.0.113.10");

        assertEquals("pay_123", response.paymentId());
        assertEquals(PaymentStatus.PAID, response.paymentStatus());
        assertEquals(OrderStatus.PAID, order.getStatus());
        verify(events).publishEvent(new PaidOrderEvent(orderId));
    }

    @Test
    void returnsExistingCardPaymentWithoutChargingAgain() {
        UUID orderId = UUID.randomUUID();
        OrderEntity order = new OrderEntity(orderId);
        order.setPaymentMethod(PaymentMethod.CREDIT_CARD);
        order.setInstallments(3);
        order.setAsaasPaymentId("pay_existing");
        order.setPaymentStatus(PaymentStatus.PAYMENT_PROCESSING);
        OrderRepository repository = mock(OrderRepository.class);
        AsaasClient asaasClient = mock(AsaasClient.class);
        when(repository.findById(orderId)).thenReturn(Optional.of(order));

        CardPaymentResponse response = new PaymentService(repository, asaasClient, mock(ApplicationEventPublisher.class))
                .createCard(orderId,
                        new CreatePaymentRequest.Card("4111 1111 1111 1111", "Joao Victor", "12/30", "123"),
                        1,
                        "203.0.113.10");

        assertEquals("pay_existing", response.paymentId());
        assertEquals(PaymentStatus.PAYMENT_PROCESSING, response.paymentStatus());
        assertEquals(3, response.installments());
        verify(asaasClient, never()).createCardPayment(
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.anyString(),
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.anyInt(),
                org.mockito.ArgumentMatchers.anyString()
        );
    }

    @Test
    void recoversPaymentAfterTheProviderAcceptedARequestButTheResponseWasLost() {
        UUID orderId = UUID.randomUUID();
        OrderEntity order = new OrderEntity(orderId);
        order.setPaymentMethod(PaymentMethod.CREDIT_CARD);
        order.setInstallments(2);
        OrderRepository repository = mock(OrderRepository.class);
        AsaasClient asaasClient = mock(AsaasClient.class);
        when(repository.findById(orderId)).thenReturn(Optional.of(order));
        when(asaasClient.findPaymentByExternalReference(orderId, "CREDIT_CARD"))
                .thenReturn(Optional.of(new AsaasClient.PaymentResponse(
                        "pay_recovered", "PENDING", "cus_123", "CREDIT_CARD"
                )));

        CardPaymentResponse response = new PaymentService(repository, asaasClient, mock(ApplicationEventPublisher.class))
                .createCard(orderId,
                        new CreatePaymentRequest.Card("4111 1111 1111 1111", "Joao Victor", "12/30", "123"),
                        2,
                        "203.0.113.10");

        assertEquals("pay_recovered", response.paymentId());
        assertEquals(PaymentStatus.AWAITING_PAYMENT, response.paymentStatus());
        assertEquals("pay_recovered", order.getAsaasPaymentId());
        verify(asaasClient, never()).createCardPayment(
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.anyString(),
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.anyInt(),
                org.mockito.ArgumentMatchers.anyString()
        );
    }
}
