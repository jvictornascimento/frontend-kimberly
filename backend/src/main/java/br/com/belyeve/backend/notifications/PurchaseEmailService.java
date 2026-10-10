package br.com.belyeve.backend.notifications;

import br.com.belyeve.backend.config.AppProperties;
import br.com.belyeve.backend.orders.OrderEntity;
import br.com.belyeve.backend.orders.OrderNotFoundException;
import br.com.belyeve.backend.orders.OrderRepository;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.text.NumberFormat;
import java.util.Locale;

@Service
public class PurchaseEmailService {
    private final AppProperties properties;
    private final JavaMailSender mailSender;
    private final OrderRepository orderRepository;

    public PurchaseEmailService(
            AppProperties properties,
            JavaMailSender mailSender,
            OrderRepository orderRepository
    ) {
        this.properties = properties;
        this.mailSender = mailSender;
        this.orderRepository = orderRepository;
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void sendPaidOrderEmail(PaidOrderEvent event) {
        AppProperties.PurchaseEmail config = properties.purchaseEmail();
        if (!config.enabled()) {
            return;
        }
        if (isBlank(config.from()) || isBlank(config.to())) {
            throw new IllegalStateException("Purchase email sender and recipient must be configured");
        }

        OrderEntity order = orderRepository.findById(event.orderId()).orElseThrow(OrderNotFoundException::new);
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(config.from());
        message.setTo(config.to());
        message.setSubject("Compra confirmada BELYEVE - " + order.getFullName());
        message.setText(body(order));
        mailSender.send(message);
    }

    private String body(OrderEntity order) {
        return """
                Compra confirmada na BELYEVE.

                Pedido: %s
                Cliente: %s
                WhatsApp: %s
                E-mail: %s
                Quantidade: %d Scoop(s)
                Preferência: %s
                Usa anéis: %s
                Tamanho do anel: %s
                Pode conter peças masculinas: %s
                Categoria masculina: %s
                Pode conter piercing Prata 925: %s
                Locais do piercing: %s
                Restrições: %s
                Consentimento social: %s
                Total: %s

                Endereço:
                %s, %s%s
                %s - %s/%s
                CEP: %s
                """.formatted(
                order.getId(),
                order.getFullName(),
                order.getWhatsapp(),
                order.getEmail(),
                order.getScoopQuantity(),
                order.getJewelryCategory(),
                yesNo(order.isUsesRings()),
                nullToDash(order.getRingSize()),
                yesNo(order.isAllowsMalePieces()),
                nullToDash(order.getMaleJewelryCategory()),
                yesNo(order.isAllowsPiercing()),
                nullToDash(order.getPiercingLocations()),
                nullToDash(order.getRestrictions()),
                yesNo(order.isSocialMediaConsent()),
                money(order.getTotalCents()),
                order.getStreet(),
                order.getAddressNumber(),
                order.getComplement() == null ? "" : " - " + order.getComplement(),
                order.getDistrict(),
                order.getCity(),
                order.getState(),
                order.getZipCode()
        );
    }

    private String money(long cents) {
        NumberFormat format = NumberFormat.getCurrencyInstance(Locale.of("pt", "BR"));
        return format.format(cents / 100.0);
    }

    private String yesNo(boolean value) {
        return value ? "Sim" : "Não";
    }

    private String nullToDash(Object value) {
        if (value == null || value.toString().isBlank()) {
            return "-";
        }
        return value.toString();
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
