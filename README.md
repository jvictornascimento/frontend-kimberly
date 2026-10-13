# BELYEVE Scoop

Mobile-first sales experience for BELYEVE Scoop, focused on customers coming from Instagram and TikTok.

The current repository contains the BELYEVE frontend and the backend MVP used to store sales and support checkout.

## Stack

- TanStack Start
- React
- TypeScript
- Vite
- Tailwind CSS
- React Query
- React Hook Form
- Zod
- Vitest
- Spring Boot
- Java 21
- PostgreSQL
- Flyway
- Docker

The backend architecture is Spring Boot with PostgreSQL, deployed with Docker Compose on a VPS.

## Requirements

- Bun
- Git
- Java 21 and Maven for local backend development.
- Docker with Compose for running the complete application and PostgreSQL.

This repository includes `bun.lock`, so Bun is the preferred package manager for dependency installation.

## Installation

```sh
git clone https://github.com/jvictornascimento/frontend-kimberly.git
cd frontend-kimberly
bun install
```

## Development

```sh
bun run dev
```

## Docker

Start frontend, backend, and PostgreSQL together:

```sh
docker compose up -d --build
```

The frontend is exposed on `FRONTEND_PORT` and the backend on `BACKEND_PORT`.
Copy `.env.example` to `.env` and configure the required values before starting Compose.
`FRONTEND_API_BASE_URL` is passed into the frontend build as `VITE_API_BASE_URL`.
Use `/api` when a reverse proxy routes that path to the backend on the same origin, or a public backend URL reachable by the customer's browser. Compose does not configure that reverse proxy.

## Current backend status

The Java 21 Spring Boot API lives in `backend/`. It stores orders in PostgreSQL with JPA and versioned Flyway migrations, validates external requests with Jakarta Bean Validation, and determines prices, totals and payment status.

- Order creation and status endpoints are implemented.
- Asaas PIX and credit card payments (up to three installments) run through the backend. Payment confirmation comes from provider responses and authenticated webhooks, not browser clicks.
- Asaas sandbox and production have separate URLs and keys. `ASAAS_ENVIRONMENT` selects the environment; sandbox is the default.
- Internal purchase emails use Spring Mail after an authoritative paid transition and transaction commit.
- Customer confirmation email is implemented with independent environment control (`PURCHASE_CUSTOMER_EMAIL_ENABLED`) and uses the email stored in the order.
- Pedreira/SP has free local delivery, verified by the backend using ViaCEP. Other destinations use Melhor Envio quotes; the former fixed `NON_LOCAL_SHIPPING_CENTS` rate is no longer used.

Shipping rates follow `Frontend -> BELYEVE backend -> Melhor Envio`. Quotes are saved in PostgreSQL and expire after 15 minutes by default. Order creation validates their destination, quantity, current item price, service and environment. Each order stores the selected shipping price, carrier, service and transport estimate. Provider failures never fall back to a made-up rate or free shipping.

The Scoop video is sent through WhatsApp in 2–5 business days. Dispatch takes up to seven days after the subsequent WhatsApp confirmation.

## Build

```sh
bun run build
```

Backend:

```sh
cd backend
mvn -B package
```

## Lint

```sh
bun run lint
```

## Tests

```sh
bun run test
```

For watch mode during development:

```sh
bun run test:watch
```

Backend:

```sh
cd backend
mvn -B test
```

## Environment

The frontend reads:

- `VITE_API_BASE_URL`: BELYEVE backend base URL.

When `VITE_API_BASE_URL` is empty, checkout services use local mocks.

Do not commit secrets, API keys, access tokens, webhook secrets, or production credentials.

The backend reads database, pricing, CORS and Asaas settings from environment variables. Use `.env.example` as a starting point and keep real values outside git.

Paid-order email uses the backend's asynchronous post-commit event and Spring Mail SMTP settings (`MAIL_*`). Set `PURCHASE_CUSTOMER_EMAIL_ENABLED=true` to send confirmation to the email stored in the order. `PURCHASE_EMAIL_ENABLED` independently enables the internal notification to `PURCHASE_EMAIL_TO`. Both are disabled by default and share `PURCHASE_EMAIL_FROM`.

Customer confirmation explains the WhatsApp contact, Scoop video in 2–5 business days and dispatch up to seven days after the subsequent WhatsApp confirmation. Browser actions never trigger a confirmation email directly.

For payments, configure the selected environment's `ASAAS_SANDBOX_API_KEY` or `ASAAS_PRODUCTION_API_KEY`, plus `ASAAS_WEBHOOK_TOKEN`. The current Compose configuration also requires the sandbox key when selecting production.

For internal purchase email, configure SMTP through `MAIL_*`, set `PURCHASE_EMAIL_ENABLED=true`, and provide `PURCHASE_EMAIL_FROM` and `PURCHASE_EMAIL_TO`. Email is disabled by default.

## Melhor Envio shipping configuration

Fill these backend variables in the local/VPS `.env` before enabling quotes:

- `MELHOR_ENVIO_ENVIRONMENT`: `sandbox` (default) or `production`, independent of Asaas.
- `MELHOR_ENVIO_SANDBOX_TOKEN` / `MELHOR_ENVIO_PRODUCTION_TOKEN`: a token with `shipping-calculate` permission for the selected account/environment. Tokens remain on the backend. OAuth token renewal must be handled operationally; this integration does not implement account authorization or automatic refresh.
- `MELHOR_ENVIO_USER_AGENT`: application name and technical contact, e.g. `BELYEVE (technical@example.com)`; replace the example email with a real contact.
- `MELHOR_ENVIO_ORIGIN_ZIP_CODE`: actual origin CEP, eight digits.
- `SCOOP_1_PARCEL_*`, `SCOOP_2_PARCEL_*`, `SCOOP_3_PARCEL_*`: measured `WIDTH`, `HEIGHT`, `LENGTH` in cm and total packed `WEIGHT` in kg. Each profile describes one complete packed order of that quantity, not one unpacked Scoop. The included zero values are placeholders and are rejected when enabling shipping.
- `MELHOR_ENVIO_SERVICES`: comma-separated carrier service IDs available to the account; default `1,2`. Configure only services BELYEVE can actually dispatch through.
- `SHIPPING_QUOTE_TTL_SECONDS`: internal quote validity (default 900, permitted 60–3600 seconds).
- `SHIPPING_TIMEOUT_SECONDS`: external request timeout (default 10, permitted 1–30 seconds).
- Finally set `MELHOR_ENVIO_ENABLED=true` and rebuild/recreate the backend container.

An enabled integration fails startup validation if required settings are missing. When disabled, verified Pedreira/SP delivery stays available; non-local quotes return a temporary unavailable error, without a fixed-rate fallback. Existing orders preserve their original shipping amount.

The backend quotes one measured volume, with insurance equal to the authoritative items subtotal. It uses the provider's `custom_price` and `custom_delivery_time`/`custom_delivery_range`, which include account customizations. Shipping quotes do not purchase labels or schedule dispatch. Transport estimates start after dispatch; the video and WhatsApp confirmation sequence remains unchanged.

Official references: [shipping calculation](https://docs.melhorenvio.com.br/reference/calculo-de-fretes-por-produtos), [API environments and headers](https://docs.melhorenvio.com.br/reference/introducao-api-melhor-envio), [ViaCEP](https://viacep.com.br/).

## Project Structure

- `src/components/belyeve/`: landing page sections.
- `src/components/checkout/`: checkout UI.
- `src/features/checkout/`: checkout types, state, hooks, services, adapters, mocks, and domain helpers.
- `src/data/`: editable business/content data used by the frontend.
- `src/routes/`: TanStack Start routes.
- `src/test/`: test setup and future frontend tests.
- `backend/`: Spring Boot backend API, migrations, integrations, and backend tests.

## Development Workflow

See `AGENTS.md` for detailed project rules.

Short version:

Issue -> branch -> small Conventional Commits -> validation -> PR -> main.

Do not develop directly on `main`.

## License

MIT License.
