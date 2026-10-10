package br.com.belyeve.backend.api;

import java.time.Instant;

public record StandardError(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path
) {
}
