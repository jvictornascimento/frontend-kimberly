package br.com.belyeve.backend.integrations.melhorenvio;

final class OAuthFailure extends RuntimeException {
    final int status;
    OAuthFailure(int status, String safeMessage) { super(safeMessage); this.status = status; }
}
