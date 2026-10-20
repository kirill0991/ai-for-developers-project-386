# AGENTS.md

## What this repo is

Hexlet educational project (ru): «Календарь звонков» — упрощённый сервис бронирования времени по мотивам Cal.com.
Course: https://ru.hexlet.io/programs/ai-for-developers — expected behavior demo: https://files.hexlet.app/a/2ipc5m

## Stack

- Frontend: React 19 + TypeScript, Vite, Mantine UI, React Router
- Feature-Sliced Design (`src/app`, `src/pages`, `src/widgets`, `src/features`, `src/entities`, `src/shared`)
- Backend: Fastify + SQLite (`better-sqlite3`) in `server/`
- API contract: TypeSpec (`spec/main.tsp`) → OpenAPI, JSON Schema (`server/schemas/`) and
  client SDK via orval (`src/shared/api/generated.ts`). See ADR-0002.
- Vitest + Testing Library, ESLint (typescript-eslint)

## Architecture notes

- The frontend talks to the API only through the generated SDK, wrapped by entity functions
  (`src/entities/*/model`) that throw `ApiError` on unexpected statuses.
- Never edit `src/shared/api/generated.ts` by hand — change `spec/main.tsp` and run `npm run generate`.
- In dev, Vite proxies `/event-types`, `/slots` and `/bookings` to `http://localhost:3000`;
  browser navigations (HTML requests) fall through to the SPA.
- Times are shown in Moscow time (fixed UTC+3), see `src/shared/lib/time.ts`.

## Commands

- `npm install` — install dependencies
- `npm run dev` — start frontend dev server (Vite)
- `npm run dev:server` — start backend (Fastify) in watch mode on port 3000
- `npm run start:server` — start backend (`DB_PATH`, `PORT`, `HOST` env vars)
- `npm run generate` — regenerate OpenAPI, JSON Schema and client SDK from TypeSpec
- `npm run build` — production build (`tsc -b && vite build`)
- `npm run preview` — preview production build
- `npm test` — run all tests (`vitest run`)
- `npx vitest run src/app/app.test.tsx` — run a single test file
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript check (`tsc -b`)

## Hard constraints (from Hexlet)

- `.github/workflows/hexlet-check.yml` is auto-generated and runs Hexlet's project check on
  **every push to any branch/tag**. Never edit, delete, or rename it — or rename the repo —
  it breaks automated grading.

## CI

- `.github/workflows/ci.yml` — lint, typecheck, tests and build on every push and pull request.
- `.github/workflows/release-please.yml` — automated releases via release-please; a release PR
  appears after a `feat`/`fix` commit lands in `main`.

## Commit format

Conventional Commits only (`type: description`, lowercase, imperative). Allowed types:

- `feat` — new feature (SemVer minor)
- `fix` — bug fix (SemVer patch)
- `docs` — documentation only
- `style` — code formatting without logic changes
- `refactor` — code refactoring without bug fixes or features
- `perf` — performance optimization
- `test` — adding or changing tests
- `chore` — build, auxiliary tools, dependencies
- `build` / `ci` — build system or CI/CD changes

## Agent skills

### Issue tracker

Issues and specs live as GitHub issues (via the `gh` CLI). See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical triage roles mapped to default label strings. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
