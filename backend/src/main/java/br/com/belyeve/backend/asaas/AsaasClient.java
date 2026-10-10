package br.com.belyeve.backend.asaas;

import br.com.belyeve.backend.config.AppProperties;
import br.com.belyeve.backend.orders.BusinessException;
import br.com.belyeve.backend.orders.OrderEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.UUID;

@Component
public class AsaasClient {
    private final RestClient restClient;

    public AsaasClient(RestClient.Builder builder, AppProperties properties) {
        this.restClient = builder
                .baseUrl(properties.asaas().baseUrl())
                .defaultHeader("access_token", properties.asaas().apiKey())
                .defaultHeader(HttpHeaders.CONTENT_TYPE, "application/json")
                .build();
    }

    public CustomerResponse createCustomer(OrderEntity order) {
        try {
            return restClient.post()
                    .uri("/customers")
                    .body(new CustomerRequest(
                            order.getFullName(),
                            order.getCpf(),
                            order.getEmail(),
                            order.getWhatsapp(),
                            order.getId().toString(),
                            true
                    ))
                    .retrieve()
                    .body(CustomerResponse.class);
        } catch (RestClientException error) {
            throw new BusinessException("Could not create payment customer");
        }
    }

    public PaymentResponse createPixPayment(OrderEntity order, String customerId) {
        try {
            return restClient.post()
                    .uri("/payments")
                    .body(new PaymentRequest(
                            customerId,
                            "PIX",
                            centsToValue(order.getTotalCents()),
                            LocalDate.now().plusDays(1),
                            order.getId().toString(),
                            "BELYEVE Scoop"
                    ))
                    .retrieve()
                    .body(PaymentResponse.class);
        } catch (RestClientException error) {
            throw new BusinessException("Could not create PIX payment");
        }
    }

    public PixQrCodeResponse getPixQrCode(String paymentId) {
        try {
            return restClient.get()
                    .uri("/payments/{id}/pixQrCode", paymentId)
                    .retrieve()
                    .body(PixQrCodeResponse.class);
        } catch (RestClientException error) {
            throw new BusinessException("Could not retrieve PIX QR Code");
        }
    }

    private BigDecimal centsToValue(long cents) {
        return BigDecimal.valueOf(cents).divide(BigDecimal.valueOf(100), 2, RoundingMode.UNNECESSARY);
    }

    record CustomerRequest(
            String name,
            String cpfCnpj,
            String email,
            String mobilePhone,
            String externalReference,
            boolean notificationDisabled
    ) {
    }

    public record CustomerResponse(String id) {
    }

    record PaymentRequest(
            String customer,
            String billingType,
            BigDecimal value,
            LocalDate dueDate,
            String externalReference,
            String description
    ) {
    }

    public record PaymentResponse(String id, String status) {
    }

    public record PixQrCodeResponse(String encodedImage, String payload, String expirationDate) {
    }
}
