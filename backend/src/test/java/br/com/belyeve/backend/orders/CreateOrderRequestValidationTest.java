package br.com.belyeve.backend.orders;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class CreateOrderRequestValidationTest {
    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void acceptsFalseSocialMediaConsent() {
        assertThat(validator.validate(validRequest(false))).isEmpty();
    }

    @Test
    void rejectsMissingRingSizeWhenRingsAreEnabled() {
        CreateOrderRequest request = new CreateOrderRequest(
                1,
                JewelryCategory.SILVER,
                true,
                " ",
                false,
                null,
                false,
                null,
                null,
                true,
                validRequest(true).customer(),
                validRequest(true).address()
        );

        assertThat(validator.validate(request))
                .anyMatch(error -> error.getMessage().equals("ringSize is required when rings are enabled"));
    }

    @Test
    void rejectsUnsupportedScoopQuantity() {
        CreateOrderRequest request = new CreateOrderRequest(
                4,
                JewelryCategory.GOLD,
                false,
                null,
                false,
                null,
                false,
                null,
                null,
                true,
                validRequest(true).customer(),
                validRequest(true).address()
        );

        assertThat(validator.validate(request))
                .anyMatch(error -> error.getMessage().equals("scoopQuantity must be 1, 2, or 3"));
    }

    private CreateOrderRequest validRequest(boolean socialConsent) {
        return new CreateOrderRequest(
                1,
                JewelryCategory.GOLD,
                false,
                null,
                false,
                null,
                false,
                null,
                "Não uso pulseiras.",
                socialConsent,
                new CreateOrderRequest.CustomerRequest(
                        "Cliente BELYEVE",
                        "19999999999",
                        "cliente@example.com",
                        "52998224725"
                ),
                new CreateOrderRequest.AddressRequest(
                        "13920000",
                        "Rua das Flores",
                        "123",
                        null,
                        "Centro",
                        "Pedreira",
                        "SP"
                )
        );
    }
}
