# AGENTS.md

## What this repo is

Hexlet educational project (ru): «Календарь звонков» — упрощённый сервис бронирования времени по мотивам Cal.com.
Course: https://ru.hexlet.io/programs/ai-for-developers — expected behavior demo: https://files.hexlet.app/a/2ipc5m

## Stack

- React 19 + TypeScript, Vite
- Mantine UI
- Feature-Sliced Design (`src/app`, `src/pages`, `src/widgets`, `src/features`, `src/entities`, `src/shared`)
- Vitest + Testing Library, ESLint (typescript-eslint)

## Commands

- `npm install` — install dependencies
- `npm run dev` — start dev server
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
