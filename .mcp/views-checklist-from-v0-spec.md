# Abricot — Views checklist (from V0 full spec)

**Source:** [.mcp/V0_ABRICOT_FULL_SPEC.md](./V0_ABRICOT_FULL_SPEC.md) — especially **§5 Proposed routes** and **§10 Per-view UI specifications**.

**Snapshot date:** 2026-04-22 (updated against current `src/router/index.ts`, `src/views/*.vue`, and `src/views/scripts/*.ts`).

**How to use:**
- `Route+view` tracks structural implementation only: route exists in router and mapped `.vue` view exists.
- `Spec parity` tracks behavior against V0 responsibilities:
	- `OK`: core responsibilities and expected service calls are present.
	- `PARTIAL`: route/view exists but one or more expected responsibilities are missing.
	- `MISSING`: not implemented.
- Keep rows at `PARTIAL` until UX, service wiring, and role behavior match the spec end-to-end.

---

## Implementation snapshot

| Area | Status |
|------|--------|
| Public required routes | 5 / 5 implemented |
| Public optional routes | 0 / 2 implemented (`/search` alias, menu deep-link) |
| Customer required routes | 6 / 6 implemented |
| Owner required routes | 9 / 9 implemented (+ redirect route implemented) |
| Route-level required views total | 20 / 20 implemented |
| Route-level optional views total | 0 / 2 implemented |

---

## Public (no auth required)

| Route+view | Route | Current view | Spec parity | Notes |
|-----------|-------|--------------|-------------|-------|
| [x] | `/` | `LandingView` | OK | Hero + `RotatingText` + search-to-explore and marketing sections are present. |
| [x] | `/login` | `LoginView` | PARTIAL | Auth flow works via store (`authService` underneath); customer post-login goes to `/explore` (not `/me/reservations`). |
| [x] | `/register` | `RegisterView` | PARTIAL | Registration flow is implemented; dedicated "registrar restaurante" variant is not explicit yet. |
| [x] | `/explore` | `ExploreView` | PARTIAL | Uses `restaurantService.getAll` with name + pagination; lookup cascade filters from §7 are missing. |
| [ ] | `/search` | — | MISSING | Optional alias route from spec is not registered. |
| [x] | `/restaurants/:restaurantId` | `RestaurantPublicView` | PARTIAL | Currently summary-only (`restaurantService.getById`); tabs/flows for menús, reservar, pedir are pending. |
| [ ] | `/restaurants/:restaurantId/menus/:menuId` | — | MISSING | Optional deep-link route (`menuService.getById`) is not registered. |

---

## Customer shell (`CUSTOMER` — spec §4.3)

Dedicated `/me` shell exists in router with `roles: ['CUSTOMER']`.

| Route+view | Route | Current view | Spec parity | Notes |
|-----------|-------|--------------|-------------|-------|
| [x] | `/me/reservations` | `MyReservationsView` | OK | `reservationService.listByUser` + cancel flow implemented. |
| [x] | `/me/reservations/:id` | `ReservationDetailView` | OK | `reservationService.getById` + cancel with reason implemented. |
| [x] | `/me/orders` | `MyOrdersView` | OK | `orderService.listByUser` implemented. |
| [x] | `/me/orders/:orderId` | `OrderTrackingView` | PARTIAL | `orderService.getById` implemented with manual refresh; polling behavior from spec is pending. |
| [x] | `/me/profile` | `ProfileView` | PARTIAL | `update` + `updatePassword` implemented; `userService.getById` fetch is not used (uses auth store snapshot on mount). |
| [x] | `/me/notifications` | `NotificationPreferencesView` | OK | `notificationPreferenceService.listByUser` + `updateByRestaurant` implemented. |

**Also cover (spec §4 / functionality):**

| Done | Item | Notes |
|------|------|-------|
| [ ] | Customer cart + checkout flow | Not implemented yet; no `orderService.create` flow in customer public ordering UX. |
| [ ] | Promotions discovery (customer) | `promotionService.getFeed` not wired in customer-facing views. |

---

## Owner shell (`RESTAURANT_ADMIN` | `SUPER_ADMIN` — spec §5)

Current router prefix is `/app` (spec allows `/app` if consistent with role guards).

| Route+view | Route (current) | Current view | Spec parity | Notes |
|-----------|------------------|--------------|-------------|-------|
| [x] | `/app` | — | OK | Redirect-only route to `/app/restaurants` (no `.vue` required). |
| [x] | `/app/restaurants` | `RestaurantsView` | PARTIAL | CRUD flow is implemented; data load currently comes from `restaurantStore.fetchAll` (`restaurantService.getAll`) while owner list context also uses switcher/user lookup. |
| [x] | `/app/restaurants/:restaurantId` | `OwnerRestaurantDashboardView` | OK | Summary cards and deep links to owner sub-routes implemented. |
| [x] | `/app/restaurants/:restaurantId/stats` | `OwnerAnalyticsView` | OK | Uses all spec analytics endpoints (`occupancy`, `orders`, `popularItems`, `promotions`, `peakHours`). |
| [x] | `/app/restaurants/:restaurantId/tables` | `OwnerTablesView` | OK | `tableService` list/create/update/delete/bulk flows are implemented. |
| [x] | `/app/restaurants/:restaurantId/hours` | `OwnerBusinessHoursView` | OK | `businessHoursService.getByRestaurant` + `updateByRestaurant` implemented. |
| [x] | `/app/restaurants/:restaurantId/reservations` | `OwnerReservationsView` | PARTIAL | `getByRestaurant`, `createAdmin`, `cancel`, `complete`, `noShow` implemented; `reassignTables` is pending. |
| [x] | `/app/restaurants/:restaurantId/orders` | `OwnerOrdersView` | OK | `orderService.getByRestaurant` + `updateStatus` implemented. |
| [x] | `/app/restaurants/:restaurantId/menus` | `OwnerMenusView` | OK | `menuService`, `menuCategoryService`, `menuItemService` CRUD/activate/photo/availability are implemented. |
| [x] | `/app/restaurants/:restaurantId/promotions` | `OwnerPromotionsView` | OK | `promotionService` CRUD + activate/deactivate implemented. |

**Owner cross-cutting (spec §4.4):**

| Done | Item | Notes |
|------|------|-------|
| [x] | Restaurant switcher UI | `RestaurantSwitcher` + `useRestaurantContextStore` wired in `AppLayout`; owner nav routes use active restaurant id. |
| [x] | “Registrar nuevo restaurante” | Implemented via create flow in `RestaurantsView` (modal-based). |

---

## Styling & integration (every new view)

| Done | Requirement | Status notes |
|------|-------------|--------------|
| [x] | `<script setup lang="ts">` wiring in views | 21/21 current views use this pattern. |
| [x] | Route logic in `views/scripts/<ViewName>.ts` | 21/21 current views import from `./scripts/`. |
| [x] | Scoped styles via `views/styles/<ViewName>.css` (or documented exception) | 21/21 current views use `<style src="./styles/..." scoped>`. |
| [ ] | Colours/radii from `globals.css` tokens | Not fully audited in this pass. |
| [x] | No `any`; DTOs from `@/types` | No `any` found in `src/views/scripts` and `src/views/*.vue`. |
| [x] | Copy in es-AR or `vue-i18n` keys | Views are wired to i18n keys (`t(...)`). |
| [ ] | Errors via `HttpError` / toasts (`useToast`) | Mixed handling (toasts in many views, inline error text in others). |

---

## Router & guards (cross-cutting)

| Done | Item | Status notes |
|------|------|--------------|
| [x] | `meta.public` vs `meta.requiresAuth` on all routes | Public/auth shells are explicitly marked in `src/router/index.ts`. |
| [x] | Role-based redirects (`CUSTOMER` vs owner) | Implemented in `src/router/guards.ts` with redirect paths by role. |
| [x] | SPA fallback / catch-all does not swallow new routes | Catch-all exists and redirects to `/`. |

---

## Extra note

- `src/views/PlaceholderView.vue` exists but is currently not routed. Keep it out of route-level counts until linked from router.

---

*Keep this file updated when the spec adds or renames views, or when route parity changes.*
