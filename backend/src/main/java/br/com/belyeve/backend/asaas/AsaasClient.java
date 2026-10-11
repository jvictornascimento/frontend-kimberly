package br.com.belyeve.backend.asaas;

import br.com.belyeve.backend.config.AppProperties;
import br.com.belyeve.backend.orders.BusinessException;
import br.com.belyeve.backend.orders.OrderEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Component
public class AsaasClient {
    private static final Logger log = LoggerFactory.getLogger(AsaasClient.class);
    private final RestClient restClient;
    private final JsonMapper jsonMapper;

    public AsaasClient(RestClient.Builder builder, AppProperties properties, JsonMapper jsonMapper) {
        this.jsonMapper = jsonMapper;
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
            logProviderFailure("customer creation", order, error);
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
            logProviderFailure("PIX payment creation", order, error);
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
            log.warn("Asaas PIX QR lookup failed: paymentId={} cause={}", paymentId,
                    error.getClass().getSimpleName());
            throw new BusinessException("Could not retrieve PIX QR Code");
        }
    }

    private void logProviderFailure(String operation, OrderEntity order, RestClientException error) {
        if (error instanceof RestClientResponseException responseError) {
            log.warn("Asaas {} failed: correlationId={} orderId={} status={} errors={}", operation,
                    MDC.get("correlationId"), order.getId(), responseError.getStatusCode().value(),
                    summarizeProviderErrors(responseError));
            return;
        }
        log.warn("Asaas {} failed: correlationId={} orderId={} cause={}", operation,
                MDC.get("correlationId"), order.getId(),
                error.getClass().getSimpleName());
    }

    private String summarizeProviderErrors(RestClientResponseException error) {
        try {
            JsonNode root = jsonMapper.readTree(error.getResponseBodyAsString());
            JsonNode errors = root == null ? null : root.path("errors");
            if (errors == null || !errors.isArray()) return "unstructured provider error";

            List<String> summaries = new ArrayList<>();
            for (JsonNode item : errors) {
                String code = item.path("code").asText("");
                String description = item.path("description").asText("");
                if (!description.isBlank()) {
                    description = description.replaceAll("(?i)[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}", "[email]")
                            .replaceAll("(?<!\\d)(?:\\+?\\d[\\s().-]*){10,14}(?!\\d)", "[phone/document]")
                            .replaceAll("[\\r\\n\\t]", " ");
                }
                String summary = code.isBlank() ? description : code + (description.isBlank() ? "" : ": " + description);
                if (!summary.isBlank()) summaries.add(summary.substring(0, Math.min(summary.length(), 240)));
            }
            return summaries.isEmpty() ? "provider returned no error details" : String.join("; ", summaries);
        } catch (JacksonException parseError) {
            return "unparseable provider error response";
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
