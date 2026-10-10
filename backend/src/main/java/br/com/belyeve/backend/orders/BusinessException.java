package br.com.belyeve.backend.orders;

public class BusinessException extends RuntimeException {
    public BusinessException(String message) {
        super(message);
    }
}
