# BELYEVE Scoop

Mobile-first sales experience for BELYEVE Scoop, focused on customers coming from Instagram and TikTok.

The current repository contains the frontend landing page and checkout flow. Backend integrations are planned for a later phase and are not implemented here yet.

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

Planned backend architecture, documented in `AGENTS.md`, is Cloudflare Workers with TypeScript, Hono, Zod, and PostgreSQL. This backend is not implemented in this repository yet.

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

## Build

```sh
bun run build
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

## Environment

The frontend reads:

- `VITE_API_BASE_URL`: BELYEVE backend base URL.

When `VITE_API_BASE_URL` is empty, checkout services use local mocks.

Do not commit secrets, API keys, access tokens, webhook secrets, or production credentials.

## Project Structure

- `src/components/belyeve/`: landing page sections.
- `src/components/checkout/`: checkout UI.
- `src/features/checkout/`: checkout types, state, hooks, services, adapters, mocks, and domain helpers.
- `src/data/`: editable business/content data used by the frontend.
- `src/routes/`: TanStack Start routes.
- `src/test/`: test setup and future frontend tests.

## Development Workflow

See `AGENTS.md` for detailed project rules.

Short version:

Issue -> branch -> small Conventional Commits -> validation -> PR -> main.

Do not develop directly on `main`.

## License

MIT License.
