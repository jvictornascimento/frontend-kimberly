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
- Customer confirmation email is pending [issue #24](https://github.com/jvictornascimento/frontend-kimberly/issues/24). Its previous PR was merged into an intermediate branch and is absent from `main`.
- Pedreira/SP has free local delivery. Other destinations currently use the temporary `NON_LOCAL_SHIPPING_CENTS` rate. Real Melhor Envio quotes are pending [issue #27](https://github.com/jvictornascimento/frontend-kimberly/issues/27).

Shipping integration must preserve free Pedreira/SP delivery and calculate other rates through `Frontend -> BELYEVE backend -> Melhor Envio`. The backend must validate the selected quote when creating an order.

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
