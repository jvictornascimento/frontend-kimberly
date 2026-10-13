package br.com.belyeve.backend.shipping;

import jakarta.validation.constraints.*;

public record ShippingQuoteRequest(
        @NotBlank @Pattern(regexp = "\\d{5}-?\\d{3}") String zipCode,
        @NotBlank @Size(max = 120) String city,
        @NotBlank @Pattern(regexp = "AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO") String state,
        @tools.jackson.databind.annotation.JsonDeserialize(using = ScoopQuantityDeserializer.class)
        @NotNull @Min(1) @Max(3) Integer quantity
) {}
