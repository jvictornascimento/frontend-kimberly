package br.com.belyeve.backend.asaas;

import br.com.belyeve.backend.config.AppProperties;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/webhooks/asaas")
public class AsaasWebhookController {
    private static final String ASAAS_TOKEN_HEADER = "asaas-access-token";

    private final AppProperties properties;
    private final PaymentWebhookEventRepository eventRepository;
    private final PaymentService paymentService;
    private final JsonMapper objectMapper;

    public AsaasWebhookController(
            AppProperties properties,
            PaymentWebhookEventRepository eventRepository,
            PaymentService paymentService,
            JsonMapper objectMapper
    ) {
        this.properties = properties;
        this.eventRepository = eventRepository;
        this.paymentService = paymentService;
        this.objectMapper = objectMapper;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void receive(
            @RequestHeader(name = ASAAS_TOKEN_HEADER, required = false) String accessToken,
            @RequestBody String payload
    ) throws Exception {
        if (!properties.asaas().webhookToken().equals(accessToken)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid webhook token");
        }

        JsonNode root;
        try {
            root = objectMapper.readTree(payload);
        } catch (tools.jackson.core.JacksonException error) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid webhook payload");
        }
        if (root == null || !root.isObject()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid webhook payload");
        }
        String eventType = requiredText(root, "event");
        JsonNode payment = root.path("payment");
        String paymentId = requiredText(payment, "id");
        String eventId = root.path("id").asText("");
        if (eventId.isBlank()) {
            eventId = paymentId + ":" + eventType;
        }

        if (eventRepository.existsByAsaasEventId(eventId)) {
            return;
        }

        eventRepository.save(new PaymentWebhookEventEntity(eventId, paymentId, eventType, payload));
        paymentService.markFromAsaas(paymentId, eventType);
    }

    private String requiredText(JsonNode node, String fieldName) {
        String value = node.path(fieldName).asText("");
        if (value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid webhook payload");
        }
        return value;
    }
}
