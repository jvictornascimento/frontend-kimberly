package br.com.belyeve.backend.asaas;

import br.com.belyeve.backend.orders.OrderEntity;
import br.com.belyeve.backend.orders.OrderRepository;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PaymentServiceExpirationTest {
    @Test
    void parsesAsaasLocalExpirationDateAsSaoPauloTime() {
        OrderRepository repository = mock(OrderRepository.class);
        AsaasClient asaasClient = mock(AsaasClient.class);
        UUID orderId = UUID.randomUUID();
        OrderEntity order = new OrderEntity(orderId);
        when(repository.findById(orderId)).thenReturn(Optional.of(order));
        when(asaasClient.createCustomer(order)).thenReturn(new AsaasClient.CustomerResponse("cus_123"));
        when(asaasClient.createPixPayment(order, "cus_123"))
                .thenReturn(new AsaasClient.PaymentResponse("pay_123", "PENDING", "cus_123", "PIX"));
        when(asaasClient.getPixQrCode("pay_123"))
                .thenReturn(new AsaasClient.PixQrCodeResponse("image", "payload", "2027-10-12 23:59:59"));

        PixPaymentResponse response = new PaymentService(
                repository, asaasClient, mock(ApplicationEventPublisher.class)
        ).createPix(orderId);

        assertThat(response.expiresAt()).isEqualTo(Instant.parse("2027-10-13T02:59:59Z"));
    }

    @Test
    void parsesAsaasOffsetExpirationDate() {
        OrderRepository repository = mock(OrderRepository.class);
        AsaasClient asaasClient = mock(AsaasClient.class);
        UUID orderId = UUID.randomUUID();
        OrderEntity order = new OrderEntity(orderId);
        when(repository.findById(orderId)).thenReturn(Optional.of(order));
        when(asaasClient.createCustomer(order)).thenReturn(new AsaasClient.CustomerResponse("cus_123"));
        when(asaasClient.createPixPayment(order, "cus_123"))
                .thenReturn(new AsaasClient.PaymentResponse("pay_123", "PENDING", "cus_123", "PIX"));
        when(asaasClient.getPixQrCode("pay_123"))
                .thenReturn(new AsaasClient.PixQrCodeResponse("image", "payload", "2027-10-12T23:59:59-03:00"));

        PixPaymentResponse response = new PaymentService(
                repository, asaasClient, mock(ApplicationEventPublisher.class)
        ).createPix(orderId);

        assertThat(response.expiresAt()).isEqualTo(Instant.parse("2027-10-13T02:59:59Z"));
    }

    @Test
    void reusesExistingPixPaymentForOrderAfterPreviousRequestFailed() {
        OrderRepository repository = mock(OrderRepository.class);
        AsaasClient asaasClient = mock(AsaasClient.class);
        UUID orderId = UUID.randomUUID();
        OrderEntity order = new OrderEntity(orderId);
        when(repository.findById(orderId)).thenReturn(Optional.of(order));
        when(asaasClient.findPixPaymentByExternalReference(orderId)).thenReturn(Optional.of(
                new AsaasClient.PaymentResponse("pay_existing", "PENDING", "cus_existing", "PIX")
        ));
        when(asaasClient.getPixQrCode("pay_existing"))
                .thenReturn(new AsaasClient.PixQrCodeResponse("image", "payload", "2027-10-12 23:59:59"));

        PixPaymentResponse response = new PaymentService(
                repository, asaasClient, mock(ApplicationEventPublisher.class)
        ).createPix(orderId);

        assertThat(response.paymentId()).isEqualTo("pay_existing");
        verify(asaasClient, never()).createCustomer(order);
        verify(asaasClient, never()).createPixPayment(order, "cus_existing");
    }
}
