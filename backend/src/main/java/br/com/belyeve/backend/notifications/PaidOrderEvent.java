package br.com.belyeve.backend.notifications;

import java.util.UUID;

public record PaidOrderEvent(UUID orderId) {
}
