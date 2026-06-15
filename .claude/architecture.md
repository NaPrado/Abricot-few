# Frontend Architecture

SPA: Vue 3.5 + TypeScript (strict) + Vite, Pinia, Vue Router, Tailwind v4, vue-i18n,
Chart.js. Built to `dist/` and served from an S3 website bucket. All backend access
flows through one HTTP client; nothing calls `fetch` directly except that client.

## Layers

```
views/ (+ views/scripts/useViewName.ts)   ← page-level UI + composable logic
components/ (base · restaurant · shared)   ← reusable UI (+ scripts/ composables)
stores/   (Pinia)                          ← auth, cart, restaurant, context, lookups
services/ (one per backend resource)       ← typed API calls via http client
services/http.ts                           ← fetch wrapper: auth, refresh, errors
types/    (*Type suffix, re-exported)      ← strict interfaces for every entity
utils/ · composables/ · locales/ · router/
```

### Colocated script modules
Per CLAUDE.md, non-trivial `<script setup>` logic
lives in a sibling `scripts/` module exporting `useViewName` / `useComponentName`
(e.g. `src/views/scripts/RestaurantPublicView.ts`). The `.vue` file keeps only
template, macros, and wiring. Vue 3.5+ forbids `<script setup src="...">`, so the
`.vue` imports and spreads the composable.

## HTTP client — `src/services/http.ts`

Single wrapper around `fetch`. `BASE_URL = import.meta.env.VITE_API_BASE_URL`
(the API Gateway HTTP API base). Exposes `http.{get,post,put,patch,delete,postForm,putForm}`.

- **`authMode`** per request (`http.ts:8`): selects which `localStorage` token becomes
  the `Authorization: Bearer` header.
  - `access` (**default**) → `access_token` (Cognito access JWT). Used by all owner/
    authenticated calls.
  - `id` → `id_token` (Cognito ID token). Used **only** by `POST /users`
    (provision / refresh local user) — `userService.ts:14,22`.
  - `refresh` → `refresh_token`. Used internally to refresh.
  - `none` → no header. Public endpoints.
- **Auto-refresh** (`http.ts:266`): on `401` with `authMode='access'`, calls
  `POST /access-tokens` (Bearer refresh token) once, stores the new `access_token`,
  retries the original request. Single-flight via `refreshInFlight`.
- **Session expiry** (`http.ts:47`): if refresh fails / `401` persists, clears all
  tokens and dispatches `abricot:auth-expired`. `main.ts:37` listens, logs out, toasts,
  redirects to `/login?expired=1`.
- **Errors**: non-2xx throws `HttpError(status, message, code?, errors?)`. Callers
  branch on `error.status` (e.g. `RestaurantPublicView.ts` handles 400/401/403/404).
- 10s timeout via `AbortController`; query DTOs serialized by `buildPath`
  (arrays → repeated keys); verbose dev logging via `utils/debug` (auth payloads redacted).
- `postForm`/`putForm` send `FormData` (multipart) for uploads — no `Content-Type` set
  so the browser adds the boundary.

## Auth flow (Cognito Hosted UI → API Gateway → SPA)

1. `cognitoAuthService` builds the Hosted UI URL. `VITE_COGNITO_REDIRECT_URI` points at
   **API Gateway `/callback`** (NOT the SPA). The service validation explicitly rejects a
   redirect ending in `/auth/callback` (`cognitoAuthService.ts:67`).
2. Cognito → API GW `/callback` (token exchange) → 302 to the SPA `/auth/callback` with
   tokens in the URL **fragment**.
3. `AuthCallbackView` (`scripts/AuthCallbackView.ts`) parses the hash
   (`parseCognitoCallbackHash`), `authStore.persistCognitoTokens` stores
   `access_token`/`id_token`/`refresh_token`, then:
   - if a local `user` already exists → redirect by role (`homePathForRole`);
   - else → `/onboarding/account-type`, which calls `POST /users` (ID token) to provision
     the local user and continues via `redirectAfterProvision`.
4. Roles are normalized (`utils/authRole.ts`): `RESTAURANT_OWNER`/`OWNER` →
   `RESTAURANT_ADMIN`; valid set is `CUSTOMER | RESTAURANT_ADMIN | SUPER_ADMIN`.

## Routing — `src/router/index.ts` + `guards.ts`

- **Public**: `/`, `/login`, `/register`, `/auth/callback`, `/explore`,
  `/restaurants/:restaurantId`, `/widgets/reservas/:restaurantId`.
- **Onboarding**: `/onboarding/account-type` (`requiresCognitoAuth`),
  `/onboarding/restaurant` (`requiresCognitoAuth + requiresLocalUser`).
- **Owner shell** `/app/*` (`AppLayout`, roles `RESTAURANT_ADMIN`/`SUPER_ADMIN`):
  restaurants list/dashboard, `tables`, `hours`, `reservations`, `orders`, `menus`,
  `promotions`, `stats`, `admins`.
- **Customer shell** `/me/*` (role `CUSTOMER`): `reservations`(+`:id`), `orders`
  (+`:orderId` tracking), `profile`, `notifications`.
- Guard (`guards.ts:42`) reads token + stored user role from `localStorage`, enforces
  `requiresAuth`/`requiresCognitoAuth`/`requiresLocalUser`/`roles`, bounces wrong-role
  users to their home, and guards against redirect loops.

## Stores — `src/stores/`

- **`auth`** — `token`/`user` (hydrated from `localStorage`), `isOwner`/`isCustomer`,
  `persistCognitoTokens`, `persistLocalUser`, `refreshLocalUser` (re-fetches `POST /users`,
  used to re-check SNS subscription status), `logout`.
- **`cart`** — guest cart persisted to `localStorage` (`abricot_cart`); single restaurant
  at a time (`ensureRestaurant` resets on restaurant change); drives order placement.
- **`restaurant`** — owner CRUD list backed by `restaurantService` (incl. `uploadPhoto`).
- **`restaurantContext`** — active restaurant id (`abricot_active_restaurant_id`) for the
  owner shell.
- **`lookups`** — cached catalogues (cuisines, price ranges, cities, neighbourhoods);
  hydrates flat IDs on `Restaurant` into nested label objects (`utils/restaurantHydration.ts`).

## Types — `src/types/`
One interface per file, `*Type` suffix, grouped by domain
(`analytics/`, `menu/`, `order/`, `reservation/`, `restaurant/`, `user/`, `scalar/`, …).
`src/types/index.ts` re-exports each without the suffix (`RestaurantType` → `Restaurant`).
`scalar/` holds branded primitives (Email, Money, IsoDateTime, …). No `any`.

## Image rule (critical)
`Restaurant.photoUrl` (`types/restaurant/RestaurantType.ts:22`) and
`MenuItem.photoUrl` are **presigned URLs returned by the API**. The UI renders them
directly (`background: url(${photoUrl})` in `ListCard`/`ExploreCard`/`PremiumCard`,
`RestaurantsView`, `RestaurantPublicView`). There is **no** client-side S3 URL
construction anywhere, and there must never be — presigned URLs expire and the bucket
layout is a backend concern.
