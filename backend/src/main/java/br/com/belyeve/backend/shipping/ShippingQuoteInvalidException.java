package br.com.belyeve.backend.shipping;

public class ShippingQuoteInvalidException extends RuntimeException {
    public ShippingQuoteInvalidException() {
        super("A cotação de frete expirou ou mudou. Volte à entrega e calcule novamente.");
    }
}
