package br.com.belyeve.backend.orders;

import br.com.belyeve.backend.shipping.ShippingQuoteEntity;
import br.com.belyeve.backend.shipping.ShippingService;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.json.JsonMapper;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties={"ASAAS_SANDBOX_API_KEY=test-sandbox-key",
        "ASAAS_WEBHOOK_TOKEN=test-webhook-token-with-more-than-32-chars"})
@ActiveProfiles("test") @AutoConfigureMockMvc
class ReligiousItemsPreferenceHttpTest {
    @Autowired MockMvc mvc;
    @Autowired JsonMapper mapper;
    @Autowired OrderRepository orders;
    @MockitoBean ShippingService shipping;
    private static final String QUOTE="10000000-0000-0000-0000-000000000001";
    private static final String BODY="""
        {"item":{"packageId":"scoop-1","quantity":1,"preferences":{
          "metal":"dourado","wearsRings":false,"ringSize":null,"allowsMalePieces":false,
          "maleMetal":null,"allowsPiercing":false,"allowsReligiousItems":%s,"piercingLocations":[],"avoidNote":""}},
         "customer":{"fullName":"Cliente BELYEVE","whatsapp":"19999999999","email":"cliente@example.com","cpf":"52998224725"},
         "address":{"zipCode":"13925400","street":"Rua das Flores","number":"123","district":"Centro","city":"Pedreira","state":"SP"},
         "shippingOptionId":"10000000-0000-0000-0000-000000000001","paymentMethod":"pix","socialMediaConsent":false}
        """;
    @BeforeEach void mockQuote() {
        var quote=mock(ShippingQuoteEntity.class);
        when(quote.response()).thenReturn(new ShippingOptionResponse(QUOTE,"local_delivery","BELYEVE",
                "Entrega grátis em Pedreira",null,0,Instant.now().plusSeconds(900)));
        when(quote.getEnvironment()).thenReturn("local");
        when(shipping.selected(anyString(),any(),anyInt())).thenReturn(quote);
    }
    @Test void savesEitherExplicitAnswerAndReturnsItWithoutChangingPricesOrConsent() throws Exception {
        for(boolean answer:new boolean[]{false,true}) {
            String response=mvc.perform(post("/api/orders").contentType(MediaType.APPLICATION_JSON).content(BODY.formatted(answer)))
                    .andExpect(status().isCreated()).andExpect(jsonPath("$.item.preferences.allowsReligiousItems").value(answer))
                    .andExpect(jsonPath("$.socialMediaConsent").value(false)).andExpect(jsonPath("$.totals.totalCents").value(10000))
                    .andReturn().getResponse().getContentAsString();
            UUID id=UUID.fromString(mapper.readTree(response).path("id").asText());
            var saved=orders.findById(id).orElseThrow();
            assertThat(saved.getAllowsReligiousItems()).isEqualTo(answer);
            assertThat(OrderResponse.from(saved).allowsReligiousItems()).isEqualTo(answer);
            assertThat(CheckoutOrderResponse.from(saved).item().preferences().allowsReligiousItems()).isEqualTo(answer);
        }
    }
    @Test void rejectsMissingNullAndCoercedAnswersBeforeDomainOrProviders() throws Exception {
        for(String answer:new String[]{"null","\"true\"","\"false\"","\"yes\"","1","0","{}","[]"}) {
            mvc.perform(post("/api/orders").contentType(MediaType.APPLICATION_JSON).content(BODY.formatted(answer)))
                    .andExpect(status().isBadRequest());
        }
        mvc.perform(post("/api/orders").contentType(MediaType.APPLICATION_JSON)
                .content(BODY.replace("\"allowsReligiousItems\":%s,", ""))).andExpect(status().isBadRequest());
        verifyNoInteractions(shipping);
    }
    @Test void preservesUnknownAnswerOnHistoricalOrders() throws Exception {
        String response=mvc.perform(post("/api/orders").contentType(MediaType.APPLICATION_JSON).content(BODY.formatted(false)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        UUID id=UUID.fromString(mapper.readTree(response).path("id").asText());
        var historical=orders.findById(id).orElseThrow();
        historical.setAllowsReligiousItems(null);orders.saveAndFlush(historical);
        assertThat(orders.findById(id).orElseThrow().getAllowsReligiousItems()).isNull();
        assertThat(CheckoutOrderResponse.from(historical).item().preferences().allowsReligiousItems()).isNull();
        assertThat(OrderResponse.from(historical).allowsReligiousItems()).isNull();
    }
}
