package br.com.belyeve.backend.shipping;

public class ShippingUnavailableException extends RuntimeException {
    public ShippingUnavailableException() {
        super("Não conseguimos calcular o frete agora. Tente novamente em instantes.");
    }
}
