package br.com.belyeve.backend.orders;

import br.com.belyeve.backend.asaas.AsaasClient;
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
}
