package br.com.belyeve.backend.shipping;

import br.com.belyeve.backend.orders.BusinessException;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class PostalAddressClientTest {
    @Test void confirmsPedreiraFromThePostalProviderIncludingOtherCityPrefixes() {
        var builder = RestClient.builder().baseUrl("https://viacep.com.br");
        var server = MockRestServiceServer.bindTo(builder).build();
        server.expect(requestTo("https://viacep.com.br/ws/13925400/json/"))
                .andRespond(withSuccess("""
                    {"cep":"13925-400","logradouro":"Rua Teste","bairro":"Centro","localidade":"Pedreira","uf":"SP"}
                    """, MediaType.APPLICATION_JSON));
        var address = new PostalAddressClient(builder.build()).verify("13925-400", " pedréira ", "SP");
        assertThat(address.localDelivery()).isTrue();
        server.verify();
    }
    @Test void rejectsForgedPedreiraForANonLocalPostalCode() {
        var builder = RestClient.builder().baseUrl("https://viacep.com.br");
        var server = MockRestServiceServer.bindTo(builder).build();
        server.expect(anything()).andRespond(withSuccess("""
            {"cep":"01001-000","logradouro":"Praça da Sé","bairro":"Sé","localidade":"São Paulo","uf":"SP"}
            """, MediaType.APPLICATION_JSON));
        assertThatThrownBy(() -> new PostalAddressClient(builder.build()).verify("01001000", "Pedreira", "SP"))
                .isInstanceOf(BusinessException.class);
        server.verify();
    }
    @Test void handlesUnknownAndMalformedPostalResponses() {
        for (String response : new String[]{"{\"erro\":true}", "{\"erro\":\"true\"}"}) {
            var builder = RestClient.builder().baseUrl("https://viacep.com.br");
            var server = MockRestServiceServer.bindTo(builder).build();
            server.expect(anything()).andRespond(withSuccess(response, MediaType.APPLICATION_JSON));
            assertThat(new PostalAddressClient(builder.build()).lookup("00000000")).isNull();
            server.verify();
        }
        var builder = RestClient.builder().baseUrl("https://viacep.com.br");
        var server = MockRestServiceServer.bindTo(builder).build();
        server.expect(anything()).andRespond(withSuccess("{}", MediaType.APPLICATION_JSON));
        assertThatThrownBy(() -> new PostalAddressClient(builder.build()).lookup("01001000"))
                .isInstanceOf(ShippingUnavailableException.class);
    }
}
