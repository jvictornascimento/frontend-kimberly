package br.com.belyeve.backend.shipping;

import br.com.belyeve.backend.orders.BusinessException;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import tools.jackson.databind.JsonNode;

import java.net.http.HttpClient;
import java.time.Duration;
import java.text.Normalizer;
import java.util.Locale;

@Component
public class PostalAddressClient {
    private final RestClient client;

    @org.springframework.beans.factory.annotation.Autowired
    public PostalAddressClient(RestClient.Builder builder, ShippingProperties properties) {
        Duration timeout = Duration.ofSeconds(properties.timeoutSeconds());
        var factory = new JdkClientHttpRequestFactory(HttpClient.newBuilder().connectTimeout(timeout).build());
        factory.setReadTimeout(timeout);
        client = builder.clone().baseUrl("https://viacep.com.br")
                .requestFactory(factory).build();
    }

    PostalAddressClient(RestClient client) { this.client = client; }

    public Address lookup(String zipCode) {
        String zip = zipCode.replace("-", "");
        if (!zip.matches("\\d{8}")) throw new BusinessException("CEP inválido.");
        try {
            JsonNode data = client.get().uri("/ws/{zip}/json/", zip).retrieve().body(JsonNode.class);
            if (data == null || !data.isObject()) throw new ShippingUnavailableException();
            if (data.has("erro")) {
                JsonNode error = data.get("erro");
                if ((error.isBoolean() && error.asBoolean())
                        || (error.isString() && "true".equals(error.asText()))) return null;
                throw new ShippingUnavailableException();
            }
            String cep = text(data, "cep", 9).replace("-", "");
            String city = text(data, "localidade", 120);
            String state = text(data, "uf", 2);
            if (!cep.equals(zip) || !state.matches("AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO")) {
                throw new ShippingUnavailableException();
            }
            return new Address(cep, optionalText(data, "logradouro", 160),
                    optionalText(data, "bairro", 120), city, state);
        } catch (RestClientException error) {
            throw new ShippingUnavailableException();
        }
    }

    public Address verify(String zip, String city, String state) {
        Address address = lookup(zip);
        if (address == null) throw new BusinessException("CEP não encontrado.");
        if (!normalize(address.city()).equals(normalize(city)) || !address.state().equals(state)) {
            throw new BusinessException("Cidade e estado devem corresponder ao CEP informado.");
        }
        return address;
    }

    static String normalize(String value) {
        return Normalizer.normalize(value.trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "").toLowerCase(Locale.ROOT);
    }

    private static String text(JsonNode node, String field, int max) {
        String value = optionalText(node, field, max);
        if (value.isBlank()) throw new ShippingUnavailableException();
        return value;
    }

    private static String optionalText(JsonNode node, String field, int max) {
        JsonNode value = node.get(field);
        if (value == null || !value.isString() || value.asText().length() > max) throw new ShippingUnavailableException();
        return value.asText();
    }

    public record Address(String zipCode, String street, String district, String city, String state) {
        public boolean localDelivery() {
            return normalize(city).equals("pedreira") && state.equals("SP");
        }
    }
}
