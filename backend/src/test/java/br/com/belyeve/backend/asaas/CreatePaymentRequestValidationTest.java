package br.com.belyeve.backend.asaas;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class CreatePaymentRequestValidationTest {
    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void acceptsPixWithoutCardData() {
        CreatePaymentRequest request = new CreatePaymentRequest(UUID.randomUUID(), "pix", null, null);

        assertThat(validator.validate(request)).isEmpty();
    }

    @Test
    void requiresCardDataForCreditCard() {
        CreatePaymentRequest request = new CreatePaymentRequest(UUID.randomUUID(), "credit_card", 1, null);

        assertThat(validator.validate(request))
                .anyMatch(error -> error.getMessage().equals("card data is required for credit card payments"));
    }

    @Test
    void acceptsCreditCardWithCardData() {
        CreatePaymentRequest request = new CreatePaymentRequest(
                UUID.randomUUID(),
                "credit_card",
                3,
                new CreatePaymentRequest.CardRequest("4111111111111111", "Cliente BELYEVE", "12/30", "123")
        );

        assertThat(validator.validate(request)).isEmpty();
    }
}
