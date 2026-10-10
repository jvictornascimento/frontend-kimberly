package br.com.belyeve.backend.orders;

import br.com.belyeve.backend.asaas.AsaasClient;
import br.com.belyeve.backend.asaas.CardPaymentResponse;
import br.com.belyeve.backend.asaas.CreatePaymentRequest;
import br.com.belyeve.backend.asaas.PaymentService;
import br.com.belyeve.backend.notifications.PaidOrderEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PaymentServiceTest {
    @Test
    void mapsConfirmedAsaasEventToPaidOrder() {
        OrderRepository repository = mock(OrderRepository.class);
        AsaasClient asaasClient = mock(AsaasClient.class);
        ApplicationEventPublisher eventPublisher = mock(ApplicationEventPublisher.class);
        PaymentService service = new PaymentService(repository, asaasClient, eventPublisher);
        OrderEntity order = new OrderEntity(UUID.randomUUID());
        order.setAsaasPaymentId("pay_123");
        order.setStatus(OrderStatus.AWAITING_PAYMENT);
        order.setPaymentStatus(PaymentStatus.AWAITING_PAYMENT);
        when(repository.findByAsaasPaymentId("pay_123")).thenReturn(Optional.of(order));

        service.markFromAsaas("pay_123", "PAYMENT_CONFIRMED");

        assertThat(order.getStatus()).isEqualTo(OrderStatus.PAID);
        assertThat(order.getPaymentStatus()).isEqualTo(PaymentStatus.PAID);
        verify(repository).findByAsaasPaymentId("pay_123");
        verify(eventPublisher).publishEvent(new PaidOrderEvent(order.getId()));
    }

    @Test
    void createsCreditCardPaymentAsProcessing() {
        OrderRepository repository = mock(OrderRepository.class);
        AsaasClient asaasClient = mock(AsaasClient.class);
        ApplicationEventPublisher eventPublisher = mock(ApplicationEventPublisher.class);
        PaymentService service = new PaymentService(repository, asaasClient, eventPublisher);
        UUID orderId = UUID.randomUUID();
        OrderEntity order = new OrderEntity(orderId);
        order.setTotalCents(15000);
        order.setFullName("Cliente BELYEVE");
        order.setEmail("cliente@example.com");
        order.setCpf("52998224725");
        order.setWhatsapp("19999999999");
        order.setZipCode("13920000");
        order.setAddressNumber("123");
        CreatePaymentRequest.CardRequest card = new CreatePaymentRequest.CardRequest(
                "4111111111111111",
                "Cliente BELYEVE",
                "12/30",
                "123"
        );

        when(repository.findById(orderId)).thenReturn(Optional.of(order));
        when(asaasClient.createCustomer(order)).thenReturn(new AsaasClient.CustomerResponse("cus_123"));
        when(asaasClient.createCreditCardPayment(order, "cus_123", card, 2, "127.0.0.1"))
                .thenReturn(new AsaasClient.PaymentResponse("pay_card_123", "PENDING"));

        CardPaymentResponse response = service.createCreditCard(orderId, card, 2, "127.0.0.1");

        assertThat(response.paymentId()).isEqualTo("pay_card_123");
        assertThat(response.paymentStatus()).isEqualTo(PaymentStatus.PAYMENT_PROCESSING);
        assertThat(order.getPaymentMethod()).isEqualTo(PaymentMethod.CREDIT_CARD);
        assertThat(order.getPaymentStatus()).isEqualTo(PaymentStatus.PAYMENT_PROCESSING);
        verify(asaasClient).createCreditCardPayment(order, "cus_123", card, 2, "127.0.0.1");
    }
}
