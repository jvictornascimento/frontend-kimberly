package br.com.belyeve.backend.notifications;

import br.com.belyeve.backend.config.AppProperties;
import br.com.belyeve.backend.orders.OrderEntity;
import br.com.belyeve.backend.orders.OrderRepository;
import org.junit.jupiter.api.Test;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.argThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PurchaseEmailServiceTest {
    @Test
    void sendsCustomerEmailAfterPaidOrder() {
        UUID orderId = UUID.randomUUID();
        OrderEntity order = order(orderId);
        OrderRepository repository = mock(OrderRepository.class);
        JavaMailSender mailSender = mock(JavaMailSender.class);
        PurchaseEmailService service = new PurchaseEmailService(
                properties(false, true),
                mailSender,
                repository
        );
        when(repository.findById(orderId)).thenReturn(Optional.of(order));

        service.sendPaidOrderEmail(new PaidOrderEvent(orderId));

        verify(mailSender).send(argThat((SimpleMailMessage message) ->
                message.getTo() != null
                        && message.getTo()[0].equals("cliente@example.com")
                        && "Pagamento confirmado - BELYEVE Scoop".equals(message.getSubject())
                        && message.getText() != null
                        && message.getText().contains("Seu pagamento do BELYEVE Scoop foi confirmado.")
                        && message.getText().contains("2 a 5 dias úteis")
                        && message.getText().contains("até 7 dias após essa confirmação pelo WhatsApp")
        ));
    }

    @Test
    void keepsInternalEmailSupported() {
        UUID orderId = UUID.randomUUID();
        OrderEntity order = order(orderId);
        OrderRepository repository = mock(OrderRepository.class);
        JavaMailSender mailSender = mock(JavaMailSender.class);
        PurchaseEmailService service = new PurchaseEmailService(
                properties(true, false),
                mailSender,
                repository
        );
        when(repository.findById(orderId)).thenReturn(Optional.of(order));

        service.sendPaidOrderEmail(new PaidOrderEvent(orderId));

        verify(mailSender).send(argThat((SimpleMailMessage message) ->
                message.getTo() != null
                        && message.getTo()[0].equals("loja@example.com")
                        && message.getSubject() != null
                        && message.getSubject().startsWith("Compra confirmada BELYEVE")
        ));
    }

    @Test
    void skipsWhenBothEmailTypesAreDisabled() {
        OrderRepository repository = mock(OrderRepository.class);
        JavaMailSender mailSender = mock(JavaMailSender.class);
        PurchaseEmailService service = new PurchaseEmailService(
                properties(false, false),
                mailSender,
                repository
        );

        service.sendPaidOrderEmail(new PaidOrderEvent(UUID.randomUUID()));

        verify(mailSender, org.mockito.Mockito.never()).send(any(SimpleMailMessage.class));
    }

    private AppProperties properties(boolean internalEnabled, boolean customerEnabled) {
        return new AppProperties(
                "http://localhost:3000",
                new AppProperties.Pricing(10000, 19000, 27000, 2500),
                new AppProperties.Asaas("sandbox", "https://api-sandbox.asaas.com/v3",
                        "https://api.asaas.com/v3", "sandbox-key", "production-key", "webhook-token"),
                new AppProperties.PurchaseEmail(
                        internalEnabled,
                        "loja@example.com",
                        "loja@example.com",
                        customerEnabled
                )
        );
    }

    private OrderEntity order(UUID id) {
        OrderEntity order = new OrderEntity(id);
        order.setFullName("Cliente BELYEVE");
        order.setEmail("cliente@example.com");
        order.setWhatsapp("19999999999");
        order.setScoopQuantity(2);
        order.setTotalCents(19000);
        order.setStreet("Rua das Flores");
        order.setAddressNumber("123");
        order.setDistrict("Centro");
        order.setCity("Pedreira");
        order.setState("SP");
        order.setZipCode("13920000");
        return order;
    }
}
