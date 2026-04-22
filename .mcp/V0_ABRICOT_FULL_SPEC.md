# Abricot — v0 / UI generation full specification

**Purpose:** Single handoff document so v0 (or any UI generator) can produce Vue views that drop into the **existing** Abricot repo with minimal glue. **Stack, tokens, folder rules, every service function, and every major DTO** are specified below.

**Product (fictional B2B SaaS, Argentina):** *Abricot* — resilient cloud SaaS for **reservations** and **takeout orders** for restaurants. Centralises digital channel; avoids overbooking and lost orders via automation, queues, and analytics.

**Five capabilities (map to UI):**

| # | Capability | Primary views |
|---|------------|----------------|
| 1 | **Dashboard disponibilidad** — horarios, mesas, capacidad; bloqueo de cupos | Owner: business hours, tables, availability calendar |
| 2 | **Motor reservas autoservicio** — widget-like flow: fecha/hora, validación, confirmación | Customer: restaurant detail → slot picker → `reservationService.create` |
| 3 | **Pedidos con seguimiento** — menú digital, estados | Customer: menu + cart + checkout; order tracking. Owner: order board + `orderService.updateStatus` |
| 4 | **Promociones ad hoc** | Owner: CRUD promotions. Customer: `promotionService.getFeed` / restaurant promotions |
| 5 | **Analítica demanda** | Owner: analytics dashboards (`analyticsService.*`) |

---

## 1. Technical stack (must match repo)

| Area | Choice |
|------|--------|
| Framework | **Vue 3** Composition API, **`<script setup lang="ts">`** |
| Build | **Vite 8** |
| Language | **TypeScript strict**, no `any` |
| State | **Pinia** |
| Router | **Vue Router 5**, `createWebHistory` |
| Styling | **Tailwind CSS v4** via `@tailwindcss/vite` in `vite.config.ts` |
| Design tokens | **`src/assets/globals.css`** — CSS variables on `:root` (see §4). `src/assets/main.css` is only `@import "tailwindcss"` + `@import "./globals.css"` |
| Icons | **lucide-vue-next** |
| i18n | **vue-i18n** — UI strings in locale files; **mock/marketing copy can stay Spanish (Argentina)** |
| HTTP | **Native `fetch`**, thin wrapper **`src/services/http.ts`** — **no Axios** |
| IDs | **`ApiId` = `string`** (UUID v7 in API contract). All path params (`restaurantId`, `userId`, `menuId`, …) are UUID strings |

---

## 2. Repository layout (v0 output should mirror this)

```
src/
├── assets/
│   ├── main.css              ← Tailwind + globals only
│   └── globals.css           ← ALL design tokens + keyframes
├── components/
│   ├── base/                 ← primitives: BaseButton, BaseInput, RotatingText, … + styles/*.css
│   ├── shared/               ← AppLayout, SidebarNav, ToastContainer, … + styles/*.css
│   └── <feature>/           ← domain components (restaurant/, order/, …)
├── composables/
├── locales/                  ← vue-i18n JSON/TS messages
├── router/
│   ├── index.ts
│   └── guards.ts
├── services/                 ← ONE file per domain; only API calls, no Pinia
│   ├── http.ts
│   ├── authService.ts
│   ├── lookupService.ts
│   ├── restaurantService.ts
│   ├── tableService.ts
│   ├── businessHoursService.ts
│   ├── availabilityService.ts
│   ├── reservationService.ts
│   ├── menuService.ts
│   ├── menuCategoryService.ts
│   ├── menuItemService.ts
│   ├── orderService.ts
│   ├── promotionService.ts
│   ├── userService.ts
│   ├── notificationPreferenceService.ts
│   ├── analyticsService.ts
│   └── index.ts              ← barrel re-exports
├── stores/                   ← Pinia only
├── types/                    ← one type per file, barrel `types/index.ts`
└── views/                    ← one route = one view file
    ├── styles/               ← **scoped** CSS per view: `LandingView.css`, …
    └── *.vue                 ← `<style src="./styles/ViewName.css" scoped></style>`
```

### Styling rules for generated components

1. **Prefer CSS variables** from §4 for colours, radii, motion (`var(--brand)`, `var(--text-muted)`, …).
2. **Per-file scoped CSS:** sibling folder `styles/<ComponentName>.css` imported from the SFC:  
   `<style src="./styles/Foo.css" scoped></style>`
3. **Class naming:** kebab-case, prefixed by feature (`landing-hero-`, `sidebar-nav-`, `restaurant-card-`) to match existing views (e.g. `LandingView.vue` + `views/styles/LandingView.css`).
4. **Tailwind:** use for layout/spacing utilities where helpful; **do not** replace token-based brand colours with hardcoded hex in random places — align with `globals.css`.

---

## 3. Global design tokens (`src/assets/globals.css`)

Use these exact custom properties (non-exhaustive but critical):

**Backgrounds:** `--bg-base`, `--bg-surface`, `--bg-card`, `--bg-card-hover`, `--bg-input`, `--bg-navbar`  
**Borders:** `--border-default`, `--border-subtle`, `--border-strong`  
**Brand (orange):** `--brand`, `--brand-hover`, `--brand-dim`, `--brand-dim-hover`, `--brand-border`, `--brand-border-hover`, `--brand-glow`, `--brand-glow-strong`  
**Text:** `--text-primary`, `--text-secondary`, `--text-muted`, `--text-placeholder`  
**Semantic:** `--danger`, `--success`, `--warning-*`  
**Radii:** `--radius-sm` … `--radius-full`  
**Typography scale:** `--text-xs` … `--text-6xl`; weights `--weight-medium` … `--weight-extrabold`  
**Motion:** `--dur-fast`, `--dur-base`, `--dur-slow`, `--ease-out`, …  
**Layout:** `--sidebar-width: 240px`, `--z-sticky`, `--z-modal`, `--z-toast`  
**Gradients:** `--gradient-brand-glow-*`, `--gradient-feature-highlight`

**Keyframes:** `fade-slide-up`, `fade-in`, `scale-in`, `slide-in-right`, `spin`, `pulse-glow`

---

## 4. Authentication, roles, and strict flows

### 4.1 Session

- **Login/register** response shape: `AuthResponse` = `{ accessToken, refreshToken, user }`.
- **Persisted today in repo:** `localStorage.access_token`, `localStorage.user` (JSON). **`refresh_token` is not yet persisted in `authStore`** — v0 can assume it will be stored under `localStorage.refresh_token` for `authService.refresh()` (http already supports `authMode: 'refresh'`).
- **HTTP:** sends `Authorization: Bearer <access_token>` by default. **`import.meta.env.VITE_API_BASE_URL`** — no trailing slash required; services use paths like `/auth/login`.

### 4.2 User model (`User`)

```ts
interface User {
  id: ApiId              // UUID string
  email: string
  name: string
  surname: string
  role: 'CUSTOMER' | 'RESTAURANT_ADMIN' | 'SUPER_ADMIN'
  createdAt: string       // ISO datetime
}
```

### 4.3 Route separation (product requirement)

| Role | Allowed areas |
|------|-----------------|
| **CUSTOMER** | Public marketing, search, restaurant public pages, **own** reservations/orders/profile, cart/checkout |
| **RESTAURANT_ADMIN** (owner) | **Admin shell** only: restaurants they own, CRUD operations, analytics, operational screens |
| **SUPER_ADMIN** | Same admin patterns; extend as needed |

**Rule:** After login, **router must branch on `user.role`**. Owners **must not** open customer-only flows (browse-as-guest checkout tied to “consumer” paths is OK only if product allows; default **strict**: owner dashboard ≠ customer home). Customers **must not** enter `/app/...` owner routes.

> **Current repo gap:** `router/guards.ts` only checks `access_token`, **not** `role`. Implement `meta.roles: ('CUSTOMER')[]` vs `meta.roles: ('RESTAURANT_ADMIN','SUPER_ADMIN')[]` and redirect wrong role to a safe home.

### 4.4 Registration as restaurant owner (flow)

1. **`authService.register`** with `RegisterRequest` — backend returns `user` with a role (today types do **not** include `role` in the register form; **assume API** returns `RESTAURANT_ADMIN` for “owner signup” URL or a future field).
2. **First restaurant:** **`restaurantService.create`** with `RestaurantCreateRequest` (requires `cityId`, lookup cascades).
3. **Further restaurants:** same `POST /restaurants/`; list owned venues with **`userService.listRestaurants(user.id)`** → `GET /users/{userId}/restaurants/`.
4. **In-app “active restaurant”:** Pinia store (e.g. `useRestaurantContextStore`) holding `activeRestaurantId: ApiId | null`, persisted to `localStorage`, **switched from a dropdown** in admin header/sidebar. All owner API calls use that id.

---

## 5. Proposed routes (implement in `router/index.ts`)

Paths are suggestions; **keep SPA history mode**.

### Public

| Path | View | Notes |
|------|------|-------|
| `/` | `LandingView` | Hero + **RotatingText** + **search bar** (navigates to search with query) |
| `/login` | `LoginView` | |
| `/register` | `RegisterView` | Link variant “Registrar mi restaurante” if product uses same form |
| `/explore` or `/search` | `RestaurantSearchView` | Query: see §7 filters (`RestaurantListQuery`) |
| `/restaurants/:restaurantId` | `RestaurantPublicView` | Tabs: Overview, **Menús** (read-only menu), **Reservar**, **Pedir** (takeout) |
| `/restaurants/:restaurantId/menus/:menuId` | optional deep-link | Uses `menuService.getById` |

### Customer (authenticated as CUSTOMER)

| Path | View | Services |
|------|------|----------|
| `/me/reservations` | `MyReservationsView` | `reservationService.listByUser(user.id, { page, status, … })` |
| `/me/reservations/:id` | `ReservationDetailView` | `reservationService.getById`, `cancel` |
| `/me/orders` | `MyOrdersView` | `orderService.listByUser(user.id, { status, page })` |
| `/me/orders/:orderId` | `OrderTrackingView` | `orderService.getById` — poll or refresh for status |
| `/me/profile` | `ProfileView` | `userService.getById`, `update`, `updatePassword` |
| `/me/notifications` | `NotificationPreferencesView` | `notificationPreferenceService.listByUser`, `updateByRestaurant` |

### Owner / admin (authenticated as RESTAURANT_ADMIN or SUPER_ADMIN)

Prefix example: **`/admin`** (today repo uses `/app` — either works if consistent).

| Path | View | Services |
|------|------|----------|
| `/admin` | redirect | → `/admin/restaurants` |
| `/admin/restaurants` | `OwnerRestaurantListView` | `userService.listRestaurants(user.id)` + **Create** → modal → `restaurantService.create` |
| `/admin/restaurants/:restaurantId` | `OwnerRestaurantDashboardView` | Summary cards; links to sub-routes |
| `/admin/restaurants/:restaurantId/stats` | `OwnerAnalyticsView` | §8 analytics |
| `/admin/restaurants/:restaurantId/tables` | `OwnerTablesView` | `tableService.*` |
| `/admin/restaurants/:restaurantId/hours` | `OwnerBusinessHoursView` | `businessHoursService.*` |
| `/admin/restaurants/:restaurantId/reservations` | `OwnerReservationsView` | `reservationService.getByRestaurant`, `createAdmin`, `cancel`, `reassignTables`, `complete`, `noShow` |
| `/admin/restaurants/:restaurantId/orders` | `OwnerOrdersView` | `orderService.getByRestaurant`, `updateStatus` |
| `/admin/restaurants/:restaurantId/menus` | `OwnerMenusView` | `menuService.*`, `menuCategoryService.*`, `menuItemService.*` |
| `/admin/restaurants/:restaurantId/promotions` | `OwnerPromotionsView` | `promotionService.*` |

---

## 6. Landing + hero (reference implementation)

- **Rotating phrases** component: `@/components/base/RotatingText.vue` — prop `phrases: string[]`, optional `interval` (default 2600 ms).
- **Hero search:** navigates to search route with **`name`** query matching **`RestaurantListQuery.name`**.
- **Background / marketing:** already styled in `LandingView` + `views/styles/LandingView.css` (dark + burgundy corner glows). v0 can reuse tokens.

---

## 7. Restaurant discovery — filters (contract)

**Service:** `restaurantService.getAll(query?)` → **`GET /restaurants/`** (public, `authMode: 'none'`).

**Query type `RestaurantListQuery`** (all optional unless noted):

| Query key | Type | Meaning |
|-----------|------|---------|
| `name` | string | Free text search |
| `country_id` | ApiId | Filter |
| `province_id` | ApiId | Filter |
| `city_id` | ApiId | Filter |
| `neighbourhood_id` | ApiId | Filter |
| `price_range_id` | ApiId | Filter |
| `cuisine_type_id` | ApiId **or** ApiId[] | Filter (multi via repeated keys — `http` appends arrays) |
| `page` | number | Pagination |
| `per_page` | number | Pagination |

**Lookup cascade (for filter UI):**

1. `lookupService.getCountries()`
2. `lookupService.getProvincesByCountry(countryId)`
3. `lookupService.getCitiesByProvince(provinceId)`
4. `lookupService.getNeighbourhoodsByCity(cityId)`
5. `lookupService.getPriceRanges()`
6. `lookupService.getCuisines()`

**Response:** `RestaurantListResponse` = **`PaginatedResponse<Restaurant>`**:

```ts
interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  perPage: number
}
```

**`Restaurant` entity:**

| Field | Type |
|-------|------|
| id | ApiId |
| name | string |
| address | string |
| phone | string |
| email | string \| null |
| description | string \| null |
| photoUrl | string \| null |
| allowTableJoining | boolean |
| defaultSlotDurationMinutes | number |
| createdAt | ISO string |
| city | `{ id, name, province: { id, name, country } }` (see `RestaurantCityType`) |
| neighbourhood | `{ id, name, cityId }` \| null |
| priceRange | `{ id, label, … }` \| null |
| cuisineTypes | `{ id, name }[]` |

---

## 8. Analytics (owner “stats”)

All require **auth**; `restaurantId` in path.

| Service method | HTTP | Query |
|----------------|------|--------|
| `analyticsService.getOccupancy(restaurantId, { start, end })` | GET `.../analytics/occupancy` | `start`, `end` ISO dates |
| `analyticsService.getOrders(restaurantId, { start, end })` | GET `.../analytics/orders` | same |
| `analyticsService.getPopularItems(restaurantId, { start, end, limit? })` | GET `.../analytics/popular-items` | optional `limit` |
| `analyticsService.getPromotions(restaurantId, { start, end })` | GET `.../analytics/promotions` | same |
| `analyticsService.getPeakHours(restaurantId, { start, end })` | GET `.../analytics/peak-hours` | same |

**Response highlights:**

- **Occupancy:** `restaurantId`, `period`, `totalReservations`, `totalCovers`, `occupancyByDay[]`
- Others: see `src/types/analytics/*` for exact point types (orders by status, revenue by day, popular items, promotion performance, peak hour counts).

---

## 9. Complete service catalogue (copy-paste contract)

Base URL: **`VITE_API_BASE_URL`**. All `id` path params: **UUID strings**.

### `authService` (`@/services/authService`)

| Method | HTTP | Body | Returns |
|--------|------|------|---------|
| `login(payload)` | POST `/auth/login` | `LoginRequest` | `AuthResponse` |
| `register(payload)` | POST `/auth/register` | `RegisterRequest` | `AuthResponse` |
| `refresh()` | POST `/auth/refresh` | none | `RefreshTokenResponse` (uses refresh token header mode) |

**Types:**

```ts
interface LoginRequest { email: string; password: string }
interface RegisterRequest { email: string; password: string; name: string; surname: string }
interface AuthResponse { accessToken: string; refreshToken: string; user: User }
```

### `lookupService`

| Method | HTTP |
|--------|------|
| `getCuisines()` | GET `/cuisines/` |
| `getPriceRanges()` | GET `/price-ranges/` |
| `getCountries()` | GET `/countries/` |
| `getProvincesByCountry(countryId)` | GET `/countries/{countryId}/provinces/` |
| `getCitiesByProvince(provinceId)` | GET `/provinces/{provinceId}/cities/` |
| `getNeighbourhoodsByCity(cityId)` | GET `/cities/{cityId}/neighbourhoods/` |

All **`authMode: 'none'`**.

### `restaurantService`

| Method | HTTP |
|--------|------|
| `getAll(query?)` | GET `/restaurants/` |
| `getById(id)` | GET `/restaurants/{id}` |
| `create(payload)` | POST `/restaurants/` |
| `update(id, payload)` | PUT `/restaurants/{id}` |
| `delete(id)` | DELETE `/restaurants/{id}` |
| `uploadPhoto(id, file)` | POST `/restaurants/{id}/photo` multipart field **`photo`** |

**`RestaurantCreateRequest` / `RestaurantUpdateRequest` (full PUT same shape):**

| Field | Required | Notes |
|-------|----------|-------|
| name | yes | |
| address | yes | |
| cityId | yes | ApiId |
| neighbourhoodId | no | ApiId |
| priceRangeId | no | ApiId |
| cuisineTypeIds | no | ApiId[] |
| phone | yes | |
| email | no | |
| description | no | |
| allowTableJoining | no | boolean |
| defaultSlotDurationMinutes | no | positive int |

### `userService` — **always pass `user.id` from session** (no `/me`)

| Method | HTTP |
|--------|------|
| `getById(userId)` | GET `/users/{userId}` |
| `update(userId, payload)` | PUT `/users/{userId}` |
| `updatePassword(userId, payload)` | PUT `/users/{userId}/password` |
| `listRestaurants(userId)` | GET `/users/{userId}/restaurants/` |

**`UpdateUserMeRequest`:** `{ name, surname }`  
**`UpdatePasswordRequest`:** `{ currentPassword: string; newPassword: string }`

### `notificationPreferenceService`

| Method | HTTP |
|--------|------|
| `listByUser(userId)` | GET `/users/{userId}/notification-preferences/` |
| `updateByRestaurant(userId, restaurantId, payload)` | PUT `/users/{userId}/notification-preferences/{restaurantId}` |

**`UpdateNotificationPreferenceRequest`:** `{ receivePromotions, receiveOrderUpdates, receiveReservationReminders }` (booleans)

### `tableService`

| Method | HTTP |
|--------|------|
| `getByRestaurant(restaurantId)` | GET `/restaurants/{restaurantId}/tables/` |
| `create(restaurantId, payload)` | POST `/restaurants/{restaurantId}/tables/` |
| `bulkCreate(restaurantId, payload)` | POST `/restaurants/{restaurantId}/tables/bulk` |
| `getById(restaurantId, tableId)` | GET `/restaurants/{restaurantId}/tables/{tableId}` |
| `update(restaurantId, tableId, payload)` | PUT `/restaurants/{restaurantId}/tables/{tableId}` |
| `delete(restaurantId, tableId)` | DELETE `/restaurants/{restaurantId}/tables/{tableId}` |

**`Table`:** `{ id, restaurantId, number, capacity, name?, isJoinable, isActive }`  
**`CreateTableRequest`:** `{ number, capacity, name?, isJoinable?, isActive? }`  
**`UpdateTableRequest`:** full PUT same fields as create.

### `businessHoursService`

| Method | HTTP |
|--------|------|
| `getByRestaurant(restaurantId)` | GET `/restaurants/{restaurantId}/business-hours/` (public) |
| `updateByRestaurant(restaurantId, payload)` | PUT `/restaurants/{restaurantId}/business-hours/` |

**`UpdateBusinessHoursRequest`:** `BusinessHourInput[]` — each `{ dayOfWeek: 0-6, opensAt?: string|null, closesAt?: string|null, isClosed: boolean }` (times `HH:MM`).

### `availabilityService`

| Method | HTTP |
|--------|------|
| `getByRestaurant(restaurantId, query)` | GET `/restaurants/{restaurantId}/availability/` |

**`AvailabilityQuery`:** `{ date: 'YYYY-MM-DD', party_size: number }` (snake_case **`party_size`** in query string).

**`AvailabilityResponse`:** `{ date, partySize, allowTableJoining, slots: AvailabilitySlot[] }`  
**`AvailabilitySlot`:** `{ timeSlot, isAvailable, tableAssignment }`  
**`TableAssignment`:** `{ tableIds[], tableNumbers[], totalCapacity, isJoined }`

### `reservationService`

| Method | HTTP |
|--------|------|
| `create(restaurantId, payload)` | POST `/restaurants/{restaurantId}/reservations/` |
| `createAdmin(restaurantId, payload)` | POST `/restaurants/{restaurantId}/reservations/admin` |
| `getByRestaurant(restaurantId, query?)` | GET `/restaurants/{restaurantId}/reservations/` |
| `getById(reservationId)` | GET `/reservations/{reservationId}` |
| `lookup(query)` | GET `/reservations/lookup` **public** — query `{ code: string }` |
| `cancel(reservationId, payload?)` | PATCH `/reservations/{reservationId}/cancel` |
| `reassignTables(reservationId, payload)` | PATCH `.../reassign-tables` |
| `complete(reservationId)` | PATCH `.../complete` |
| `noShow(reservationId)` | PATCH `.../no-show` |
| `listByUser(userId, query?)` | GET `/users/{userId}/reservations/` |

**`CreateReservationRequest`:** `{ partySize, date, timeSlot, notes? }`  
**`CreateAdminReservationRequest`:** base `{ partySize, date, timeSlot, source: 'PHONE'|'EVENT', guestPhone?, guestEmail?, notes? }` plus **either** `{ userId, guestName? }` **or** `{ userId: null, guestName }` (walk-in / phone guest).  
**`RestaurantReservationsQuery`:** `{ page?, per_page?, date_from?, date_to?, status?, source? }`  
**`Reservation`:** `{ id, restaurantId, restaurantName, userId|null, guestName, guestPhone, guestEmail, source, partySize, date, timeSlot, status, notes, confirmationCode, createdAt, tables[] }`  
**`ReservationStatus`:** `'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'`  
**`CancelReservationRequest`:** `{ reason?: string }`

### `menuService`

| Method | HTTP |
|--------|------|
| `getByRestaurant(restaurantId)` | GET `/restaurants/{restaurantId}/menus/` (public) |
| `create(restaurantId, payload)` | POST `/restaurants/{restaurantId}/menus/` |
| `getById(restaurantId, menuId)` | GET `/restaurants/{restaurantId}/menus/{menuId}` (public) |
| `update(restaurantId, menuId, payload)` | PUT `...` |
| `delete(restaurantId, menuId)` | DELETE `...` |
| `activate(restaurantId, menuId)` | PATCH `.../activate` |

**`Menu`:** `{ id, restaurantId, name, isActive, createdAt }`  
**`MenuDetail`:** `Menu` + `{ categories: MenuCategoryWithItems[] }`  
**`MenuCategoryWithItems`:** category + embedded **`items: MenuItem[]`**

### `menuCategoryService`

| Method | HTTP |
|--------|------|
| `getByMenu(menuId)` | GET `/menus/{menuId}/categories/` |
| `create(menuId, payload)` | POST `/menus/{menuId}/categories/` |
| `update(menuId, categoryId, payload)` | PUT `/menus/{menuId}/categories/{categoryId}` |
| `delete(menuId, categoryId)` | DELETE `...` |
| `reorder(menuId, payload)` | PATCH `/menus/{menuId}/categories/reorder` |

### `menuItemService`

| Method | HTTP |
|--------|------|
| `getByCategory(categoryId)` | GET `/categories/{categoryId}/items/` |
| `create(categoryId, payload)` | POST `/categories/{categoryId}/items/` |
| `getById(itemId)` | GET `/items/{itemId}` |
| `update(itemId, payload)` | PUT `/items/{itemId}` |
| `delete(itemId)` | DELETE `/items/{itemId}` |
| `uploadPhoto(itemId, file)` | POST `/items/{itemId}/photo` field **`photo`** |
| `updateAvailability(itemId, payload)` | PATCH `/items/{itemId}/availability` |

**`MenuItem`:** `{ id, categoryId, name, description?, price, photoUrl?, isAvailable, createdAt }` — **`price`** is **decimal string** `"12.34"` (`MoneyAmountType`).

### `orderService`

| Method | HTTP |
|--------|------|
| `create(restaurantId, payload)` | POST `/restaurants/{restaurantId}/orders/` |
| `getByRestaurant(restaurantId, query?)` | GET `/restaurants/{restaurantId}/orders/` |
| `getById(orderId)` | GET `/orders/{orderId}` |
| `updateStatus(orderId, payload)` | PATCH `/orders/{orderId}/status` |
| `cancel(orderId)` | PATCH `/orders/{orderId}/cancel` |
| `listByUser(userId, query?)` | GET `/users/{userId}/orders/` |

**`CreateOrderRequest`:** `{ items: { menuItemId, quantity, notes? }[]; notes?: string }`  
**`Order`:** `{ id, restaurantId, restaurantName, userId, status, totalAmount, notes?, estimatedReadyAt?, createdAt, items[] }`  
**`OrderStatus`:** `PENDING | CONFIRMED | IN_PREPARATION | READY | COMPLETED | CANCELLED`  
**`UpdateOrderStatusRequest`:** `{ status, estimatedReadyAt? }`

### `promotionService`

| Method | HTTP |
|--------|------|
| `getByRestaurant(restaurantId)` | GET `/restaurants/{restaurantId}/promotions/` |
| `getFeed(query?)` | GET `/promotions/feed` — paginated promotions discovery |
| `create(restaurantId, payload)` | POST `/restaurants/{restaurantId}/promotions/` |
| `getById(restaurantId, promotionId)` | GET `.../{promotionId}` |
| `update(restaurantId, promotionId, payload)` | PUT `...` |
| `deactivate` / `activate` | PATCH `.../deactivate` | `.../activate` |
| `delete(restaurantId, promotionId)` | DELETE `...` |

**`Promotion`:** includes `discountType: 'PERCENTAGE'|'FIXED_AMOUNT'|'FREE_ITEM'`, `discountValue`, dates, `items[]`, `notifyUsers`, etc.

---

## 10. Per-view UI specifications (wireframes for v0)

### 10.1 `RestaurantSearchView`

- **Header:** search input bound to `name`; “Filters” drawer.
- **Filters:** cascade country → province → city → neighbourhood; chips for cuisine multi-select; price range select.
- **Data:** `restaurantService.getAll(combinedQuery)`.
- **Grid:** cards with `photoUrl`, name, city, price range, cuisine chips; click → `/restaurants/:id`.
- **Pagination:** `page`, `perPage` from response.

### 10.2 `RestaurantPublicView`

- **Tabs:** Resumen | Menú | Reservar | Pedir (labels i18n).
- **Resumen:** `restaurantService.getById`, show `description`, `address`, `phone`, map link optional.
- **Menú:** `menuService.getByRestaurant` → pick active or first menu → `menuService.getById` for nested categories+items; respect `isAvailable`.
- **Reservar:** date picker → `availabilityService.getByRestaurant` with `party_size` + `date` → list `slots` where `isAvailable`; on confirm `reservationService.create` with `CreateReservationRequest`; show **`confirmationCode`** from response.
- **Pedir:** same menu tree; local cart state; submit `orderService.create`; navigate to **`/me/orders/:orderId`**.

### 10.3 `MyReservationsView`

- Table/cards: date, time, restaurantName, status, confirmationCode.
- **Data:** `reservationService.listByUser(authStore.user.id, { page, status? })`.
- Row actions: if `CONFIRMED`, open cancel modal → `reservationService.cancel(id, { reason })`.

### 10.4 `OrderTrackingView`

- **Data:** `orderService.getById(orderId)` (ensure `userId` matches current user for customers).
- **UI:** timeline of `OrderStatus` + `estimatedReadyAt`; pull-to-refresh or interval polling.

### 10.5 `ProfileView`

- Form: name, surname → `userService.update(user.id, { name, surname })`.
- Password section: `userService.updatePassword(user.id, { currentPassword, newPassword })`.

### 10.6 `OwnerRestaurantListView`

- List from `userService.listRestaurants(user.id)`.
- Buttons: “Nuevo restaurante” → wizard using `lookupService` + `restaurantService.create`.
- **Restaurant switcher** (global): sets active `restaurantId` for child routes.

### 10.7 `OwnerReservationsView`

- Filters: date range, status, source.
- **Data:** `reservationService.getByRestaurant(activeRestaurantId, query)`.
- Actions: create admin reservation modal; cancel / complete / no-show / reassign tables per row.

### 10.8 `OwnerOrdersView`

- Kanban or table by `status`.
- **Data:** `orderService.getByRestaurant(activeRestaurantId, { status?, page? })`.
- Detail drawer: `updateStatus` with next status + optional `estimatedReadyAt` (ISO).

### 10.9 `OwnerMenusView`

- List menus; CRUD; **activate** patch; categories expandable; items CRUD + photo upload + availability toggle.

### 10.10 `OwnerPromotionsView`

- List `promotionService.getByRestaurant`; create/edit form matching `CreatePromotionRequest` / `UpdatePromotionRequest`; activate/deactivate/delete.

### 10.11 `OwnerAnalyticsView`

- Date range picker → parallel fetch of occupancy, orders, popular items, promotions, peak hours; charts (Chart.js is already a project dependency for future use).

---

## 11. Error handling

- Services throw **`HttpError`** with `status` and message from API (`message` or `msg` field).
- **401:** `http.ts` clears session and redirects to `/login?expired=1`.
- UI: use **`useToast`** from `@/composables/useToast` (pattern in existing code) for user-visible errors.

---

## 12. v0 prompt checklist (short)

When asking v0 to build a view, always attach:

1. This file (or §9–§10 for the specific screen).
2. **Role** (customer vs owner).
3. **Exact service methods** to call and **which `user.id` / `restaurantId`** to pass.
4. **Styling:** “Use CSS variables from `globals.css`; scoped CSS in `styles/ViewName.css`; Tailwind for layout only.”
5. **Language:** Spanish (Argentina) for user-visible strings in mocks, or `vue-i18n` keys if integrating directly.

---

## 13. Canonical endpoint list

See **`.mcp/endpoints-checklist.md`** (77 endpoints, kept in sync with backend). User-scoped routes use **`/users/{userId}/...`** with UUID `userId`.

## 14. Views implementation checklist

See **`.mcp/views-checklist-from-v0-spec.md`** — checkbox list of every view/route from **§5** (and related §10 / §4 items) to track v0 vs implementation progress.

---

*Document generated for the Abricot monorepo frontend. Extend with wireframes or Figma links as needed.*
