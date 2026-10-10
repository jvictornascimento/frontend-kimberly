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
Set `FRONTEND_API_BASE_URL` to the public backend URL that the customer's browser can reach.

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
