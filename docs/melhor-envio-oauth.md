# Melhor Envio app authorization

The backend implements `GET /api/integrations/melhor-envio/callback` for the registered URL:

```text
https://www.belyeve.com.br/api/integrations/melhor-envio/callback
```

Register that exact URL in the Melhor Envio application. The HTTPS reverse proxy for `www.belyeve.com.br` must forward `/api/` to Spring Boot, preserving the full path and query string. Docker Compose does not configure the public reverse proxy or deploy this route. A direct visit without query parameters only reports callback availability; it does not authorize an account.

## Configuration

Create the app in sandbox first. Sandbox and production accounts, client IDs, client secrets and tokens are separate. The callback can have the same address for both; the deployed backend uses the single environment selected by `MELHOR_ENVIO_ENVIRONMENT`.

Configure these backend-only variables:

```dotenv
MELHOR_ENVIO_ENVIRONMENT=sandbox
MELHOR_ENVIO_OAUTH_ENABLED=true
MELHOR_ENVIO_SANDBOX_CLIENT_ID=
MELHOR_ENVIO_SANDBOX_CLIENT_SECRET=
MELHOR_ENVIO_PRODUCTION_CLIENT_ID=
MELHOR_ENVIO_PRODUCTION_CLIENT_SECRET=
MELHOR_ENVIO_REDIRECT_URI=https://www.belyeve.com.br/api/integrations/melhor-envio/callback
MELHOR_ENVIO_SETUP_KEY=
MELHOR_ENVIO_TOKEN_ENCRYPTION_KEY=
MELHOR_ENVIO_USER_AGENT=BELYEVE (your-technical-contact@example.com)
```

Fill only the selected environment's client credentials. `MELHOR_ENVIO_SETUP_KEY` must be a cryptographically random URL-safe value of at least 43 characters. `MELHOR_ENVIO_TOKEN_ENCRYPTION_KEY` must contain 32 random bytes encoded with standard Base64. Generate both locally, save them only in `.env`/your secret manager, and do not publish their output. No credentials use a `VITE_` prefix.

Preserve the encryption key across restarts, deploys and database restores. Store its backup separately from database backups. Changing or losing it requires a new authorization. OAuth can be enabled while shipping is disabled to connect the account first. Then configure the origin CEP, parcel profiles, services and `MELHOR_ENVIO_ENABLED=true` as described in the README. OAuth mode takes precedence over manually supplied environment tokens and does not fall back to them on authorization failures.

## Connect the account

After deploying and applying Flyway migrations, run this from a trusted terminal with `MELHOR_ENVIO_SETUP_KEY` loaded in the shell environment:

```sh
curl --fail-with-body --request POST \
  --header "X-Integration-Setup-Key: ${MELHOR_ENVIO_SETUP_KEY}" \
  https://www.belyeve.com.br/api/integrations/melhor-envio/authorize
```

The response contains `authorizationUrl`. Open that URL in your browser, sign in to the matching Melhor Envio environment and authorize the BELYEVE application. The requested permission is only `shipping-calculate`; this does not request label purchase/generation permissions.

The callback validates an unpredictable, single-use state valid for ten minutes, exchanges the returned authorization code server-to-server, and stores the access/refresh tokens encrypted with AES-256-GCM in PostgreSQL. The browser receives a fixed confirmation message, never tokens or application secrets. Starting a new authorization invalidates any previous unfinished link for that environment. Denial, expiry or token-exchange failure requires a fresh authorization link. Do not share authorization URLs.

The setup endpoint requires the secret header; it is not part of the customer checkout, and this header is not allowed by CORS. There is no customer account, admin login or public token-management endpoint.

## Token lifecycle

Access tokens refresh on demand before a shipping quote when within five minutes of expiry. Database row locks serialize refreshes and state consumption across backend instances. Rotated tokens are persisted in their own transaction so an unrelated quote/order rollback does not restore an obsolete refresh token. Quote provider calls happen before the quote repository transaction, avoiding nested connection-pool allocation while refreshing credentials. Refresh tokens are treated as valid for 45 days from issuance; after that, authorize again. No background scheduler or new infrastructure is required.

If a refresh request times out after Melhor Envio has rotated its token but before the response is stored, a fresh authorization may be needed. A rejected/revoked token also requires reconnecting. Quote failures remain closed and never become free shipping outside Pedreira/SP.

## Proxy and logging

Do not cache either authorization or callback responses. Configure proxy/CDN access logs for the callback to log the path without query arguments: query parameters contain a temporary authorization code and state. Do not enable request/response body or HTTP wire logging for the OAuth client; token request bodies contain secrets. Callback responses set `Cache-Control: no-store`, `Referrer-Policy: no-referrer` and `X-Robots-Tag: noindex, nofollow`, and load no external assets.

## Validation

Automated tests mock Melhor Envio; they cover success, denial, invalid/missing/oversized parameters, duplicate/expired state, concurrent callbacks and refreshes, encrypted persistence, environment separation and sanitized provider failures. No real provider credentials are needed for normal tests.

Official references: [authorization and permissions](https://docs.melhorenvio.com.br/reference/fluxo-de-autoriza%C3%A7%C3%A3o), [token exchange and refresh](https://docs.melhorenvio.com.br/reference/solicitacao-do-token), [token lifetime](https://docs.melhorenvio.com.br/docs/autenticacao-1).
