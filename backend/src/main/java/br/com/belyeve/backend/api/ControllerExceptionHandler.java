package br.com.belyeve.backend.api;

import br.com.belyeve.backend.orders.BusinessException;
import br.com.belyeve.backend.orders.OrderNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;

@ControllerAdvice
public class ControllerExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(ControllerExceptionHandler.class);

    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<StandardError> responseStatusError(ResponseStatusException error, HttpServletRequest request) {
        HttpStatus status = HttpStatus.valueOf(error.getStatusCode().value());
        return response(status, status.getReasonPhrase(), request);
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<StandardError> internalServerError(Exception error, HttpServletRequest request) {
        log.error("Unexpected backend error", error);
        return response(HttpStatus.INTERNAL_SERVER_ERROR, "Internal error", request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<StandardError> validationError(MethodArgumentNotValidException error, HttpServletRequest request) {
        String message = error.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(FieldError::getDefaultMessage)
                .orElse("Validation error");
        return response(HttpStatus.BAD_REQUEST, message, request);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<StandardError> invalidRequestBody(HttpMessageNotReadableException error, HttpServletRequest request) {
        return response(HttpStatus.BAD_REQUEST, "Invalid request body", request);
    }

    @ExceptionHandler(BusinessException.class)
    ResponseEntity<StandardError> businessError(BusinessException error, HttpServletRequest request) {
        return response(HttpStatus.BAD_REQUEST, error.getMessage(), request);
    }

    @ExceptionHandler(OrderNotFoundException.class)
    ResponseEntity<StandardError> orderNotFound(OrderNotFoundException error, HttpServletRequest request) {
        return response(HttpStatus.NOT_FOUND, error.getMessage(), request);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    ResponseEntity<StandardError> methodNotAllowed(HttpRequestMethodNotSupportedException error, HttpServletRequest request) {
        return response(HttpStatus.METHOD_NOT_ALLOWED, "Method not allowed", request);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    ResponseEntity<StandardError> notFound(NoResourceFoundException error, HttpServletRequest request) {
        return response(HttpStatus.NOT_FOUND, "Resource not found", request);
    }

    private ResponseEntity<StandardError> response(HttpStatus status, String message, HttpServletRequest request) {
        return ResponseEntity.status(status).body(new StandardError(
                Instant.now(),
                status.value(),
                status.getReasonPhrase(),
                message,
                request.getRequestURI()
        ));
    }
}
