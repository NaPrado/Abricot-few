# Abricot Frontend — Claude Guidelines

Abricot is a Cloud-native B2B SaaS for restaurants (online orders + reservations).
This repo is the **SPA frontend** only: Vue 3 + TypeScript, built and hosted in an
S3 website bucket. It talks to a serverless backend (API Gateway HTTP API → Lambda).

## ⚠️ API source of truth = the DEPLOYED BACKEND (not `.mcp/`)

The authoritative API contract is the **deployed backend**, defined by:

1. The Lambda **custom dispatcher** — `lambdas/{service}/handler.py` (the backend
   is NOT Flask; routing is a hand-written dispatcher per service), and
2. The API Gateway **route map** — `infra/locals.tf`,

both in the **`Abricot-be`** repo.

**`.mcp/` in THIS repo is DEPRECATED for contracts.** Those docs are aspirational
and have diverged from reality twice, causing route bugs. When the frontend and a
`.mcp/` doc disagree, **the frontend code + deployed backend win**. Never wire a new
call from a `.mcp/` route. See `.claude/working-in-this-repo.md` and
`.claude/api-contract.md` (which flags the known-wrong `.mcp/` routes).

Two cautionary tales (real bugs):
- **Menu activate** — `.mcp/` said `PATCH /restaurants/{id}/menus/{menuId}/activate`.
  No such route exists. Real: `PATCH /restaurants/{id}/menus/{menuId}` with body
  `{ isActive: true | false }` (`src/services/menuService.ts:30`).
- **Photo upload** — `POST /restaurants/{id}/photo` (multipart) only worked once the
  backend dispatcher got a `/photo` branch; the Flask-only version 404'd. The
  multipart field is **`file`**, not `photo` as `.mcp/` claims
  (`src/services/restaurantService.ts:28`).

## Tech Stack
- Vue 3.5 (Composition API, `<script setup>`) · Vite · TypeScript (strict, no `any`)
- Pinia (stores) · Vue Router · Tailwind CSS v4 · vue-i18n · Chart.js (vue-chartjs)
- Package manager: **pnpm**. Backend: AWS serverless (Cognito, API GW, Lambda, S3, SNS).

## Architecture (see `.claude/architecture.md` for detail)
- `src/services/*` — one module per backend resource; all go through the `http`
  client (`src/services/http.ts`). Components/stores never call `fetch` directly.
- `src/stores/*` — Pinia (`auth`, `cart`, `restaurant`, `restaurantContext`, `lookups`).
- `src/types/*` — strict interfaces for every business entity; `*Type` suffix,
  re-exported without the suffix via `src/types/index.ts`.
- `src/views/*` + `src/components/*` — non-trivial `<script setup>` logic lives in a
  colocated `scripts/` module (`useViewName` / `useComponentName`). Vue 3.5+ forbids
  `<script setup src="...">`, so import the composable instead.
- Routing splits **owner** (`/app/...`, roles `RESTAURANT_ADMIN`/`SUPER_ADMIN`) from
  **customer** (`/me/...`, role `CUSTOMER`) plus public routes.

## Key domain rules (see `.claude/api-contract.md`)
- **Images**: render the API-provided `photoUrl` directly. The backend returns a
  presigned URL. **NEVER construct S3 URLs client-side.**
- **Menu draft/active model**: `create` makes a **draft** (`isActive=false`). Owners
  read drafts via `GET /restaurants/{id}/admin/menus`; activation flips `isActive`.
  Customers only ever see the active menu via `GET /restaurants/{id}/menus?isActive=true`.
- **Reservations require a confirmed SNS email subscription**: the public restaurant
  page gates booking on `user.snsSubscriptionStatus === 'CONFIRMED'`
  (`src/views/scripts/RestaurantPublicView.ts:66`).

## Development Rules
- **Strict TypeScript**: no `any`. Define interfaces for all business entities.
- **Clean code**: early returns, functional style, descriptive names. Refactor flawed
  architecture rather than patching. Write code a senior engineer would approve.
- **Language**: code + comments in English; UI text and mock data in Spanish (AR).
- **No automated tests** (Jest/Cypress/Vitest) unless explicitly requested.
- Prefer targeted edits over rewriting whole files. Ask before large boilerplate.
- Only read the specific files needed for the task.

## Verification (non-negotiable)
Do NOT report success unless **type-check and lint pass**:
- `pnpm type-check` (or `pnpm build`) and `pnpm lint`.
In this repo the operator runs commands — propose them, wait for output, then claim
success only against real output. See `.claude/working-in-this-repo.md`.
