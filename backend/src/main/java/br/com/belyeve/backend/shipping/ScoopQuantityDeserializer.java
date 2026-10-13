package br.com.belyeve.backend.shipping;

import tools.jackson.core.JsonParser;
import tools.jackson.core.JsonToken;
import tools.jackson.databind.DeserializationContext;
import tools.jackson.databind.ValueDeserializer;

/** Reject coercion at the shipping/order HTTP boundary before Bean Validation. */
public class ScoopQuantityDeserializer extends ValueDeserializer<Integer> {
    @Override
    public Integer deserialize(JsonParser parser, DeserializationContext context) {
        if (parser.currentToken() != JsonToken.VALUE_NUMBER_INT) {
            return context.reportInputMismatch(Integer.class, "Scoop quantity must be an integer JSON number");
        }
        return parser.getIntValue();
    }
}
