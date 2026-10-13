package br.com.belyeve.backend.shipping;

import org.springframework.http.HttpHeaders;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import tools.jackson.databind.JsonNode;

import java.math.BigDecimal;
import java.net.http.HttpClient;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;

@Component
public class MelhorEnvioClient {
    private final RestClient client;
    private final ShippingProperties properties;

    @org.springframework.beans.factory.annotation.Autowired
    public MelhorEnvioClient(RestClient.Builder builder, ShippingProperties properties) {
        this.properties = properties;
        Duration timeout = Duration.ofSeconds(properties.timeoutSeconds());
        var factory = new JdkClientHttpRequestFactory(HttpClient.newBuilder().connectTimeout(timeout).build());
        factory.setReadTimeout(timeout);
        client = builder.clone().baseUrl(properties.baseUrl()).requestFactory(factory).build();
    }

    MelhorEnvioClient(RestClient client, ShippingProperties properties) {
        this.client = client;
        this.properties = properties;
    }

    public List<Rate> calculate(String destinationZip, int quantity, long subtotalCents) {
        if (!properties.enabled() || !properties.isConfigured()) throw new ShippingUnavailableException();
        var parcel = properties.parcels().get(quantity);
        // A measured, fully packed order is one volume; quantity selects its actual parcel profile.
        Map<String, Object> body = Map.of(
                "from", Map.of("postal_code", properties.originZipCode()),
                "to", Map.of("postal_code", destinationZip),
                "volumes", List.of(Map.of("width", parcel.width(), "height", parcel.height(),
                        "length", parcel.length(), "weight", parcel.weight(),
                        "insurance", BigDecimal.valueOf(subtotalCents, 2))),
                "options", Map.of("receipt", false, "own_hand", false),
                "services", properties.services());
        try {
            JsonNode response = client.post().uri("/api/v2/me/shipment/calculate")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + properties.token())
                    .header(HttpHeaders.USER_AGENT, properties.userAgent())
                    .header(HttpHeaders.ACCEPT, "application/json")
                    .header(HttpHeaders.CONTENT_TYPE, "application/json")
                    .body(body).retrieve().body(JsonNode.class);
            return parse(response);
        } catch (RestClientException error) {
            // Do not log provider bodies or exception messages containing request details.
            throw new ShippingUnavailableException();
        }
    }

    static List<Rate> parse(JsonNode response) {
        if (response == null || !response.isArray() || response.size() > 100) throw new ShippingUnavailableException();
        List<Rate> result = new ArrayList<>();
        var ids = new HashSet<Integer>();
        for (JsonNode item : response) {
            if (!item.isObject()) throw new ShippingUnavailableException();
            if (item.hasNonNull("error")) continue; // Unavailable carrier service, not a free rate.
            JsonNode id = item.get("id");
            JsonNode price = item.get("custom_price");
            JsonNode days = item.get("custom_delivery_time");
            if (id == null || !id.isIntegralNumber() || !id.canConvertToInt() || id.asInt() <= 0
                    || price == null || (!price.isString() && !price.isNumber())
                    || days == null || !days.isIntegralNumber() || !days.canConvertToInt()
                    || days.asInt() < 1 || days.asInt() > 365) throw new ShippingUnavailableException();
            String amount = price.asText();
            if (!amount.matches("(?:0|[1-9]\\d{0,6})(?:\\.\\d{1,2})?")) throw new ShippingUnavailableException();
            long cents = new BigDecimal(amount).movePointRight(2).longValueExact();
            if (cents <= 0 || !ids.add(id.asInt())) throw new ShippingUnavailableException();
            int min = days.asInt();
            int max = min;
            JsonNode range = item.get("custom_delivery_range");
            if (range != null && !range.isNull()) {
                if (!range.isObject() || !validDay(range.get("min")) || !validDay(range.get("max"))) throw new ShippingUnavailableException();
                min = range.get("min").asInt();
                max = range.get("max").asInt();
                if (min > max) throw new ShippingUnavailableException();
            }
            String service = text(item.get("name"));
            JsonNode company = item.get("company");
            if (company == null || !company.isObject()) throw new ShippingUnavailableException();
            result.add(new Rate(id.asInt(), text(company.get("name")), service, cents, min, max));
        }
        return List.copyOf(result);
    }

    private static boolean validDay(JsonNode value) {
        return value != null && value.isIntegralNumber() && value.canConvertToInt()
                && value.asInt() >= 1 && value.asInt() <= 365;
    }

    private static String text(JsonNode value) {
        if (value == null || !value.isString() || value.asText().isBlank() || value.asText().length() > 120) {
            throw new ShippingUnavailableException();
        }
        return value.asText();
    }

    public record Rate(int serviceId, String carrier, String service, long priceCents, int minDays, int maxDays) {}
}
