# Handoff: Abricot Frontend – Online Ordering Implementation

## Overview

This document captures the current state of the Abricot frontend after implementing a complete online ordering flow (takeout) and fixing a menu display bug.

---

## Implementation Summary

### 1. **Cart Store (Pinia)**
- **File:** `src/stores/cartStore.ts`
- **Status:** ✅ Complete
- **Features:**
  - Centralized cart state with localStorage persistence
  - Restaurant-scoped cart (clears when switching restaurants)
  - Per-item notes and order-level notes support
  - Reactive computed refs for total, itemCount

### 2. **Restaurant Public View (Customer Menu Browsing)**
- **Files:**
  - `src/views/RestaurantPublicView.vue`
  - `src/views/scripts/RestaurantPublicView.ts`
- **Status:** ✅ Complete
- **Features:**
  - Menu browsing via "Menú" tab
  - "Para llevar" (takeout) tab with cart management
  - Add/remove items from cart
  - Order notes (per-item and order-level)
  - Order placement with validation
  - Auth-aware flow (login redirect if not authenticated)
  - Unavailable menu items shown with "No disponible" badge
  - Post-order navigation to tracking page

### 3. **Order Tracking View (Real-Time Status)**
- **Files:**
  - `src/views/OrderTrackingView.vue`
  - `src/views/scripts/OrderTrackingView.ts`
  - `src/views/styles/OrderTrackingView.css`
- **Status:** ✅ Complete
- **Features:**
  - Fetches order by ID from user's order list
  - Falls back gracefully if admin detail endpoint (403) unavailable
  - Polls every 10 seconds for active orders (PENDING, CONFIRMED, READY)
  - Visual timeline showing order progression
  - Live pulse indicator for active orders
  - Displays order items and total
  - Back button navigation

### 4. **My Orders View (Order History)**
- **Files:**
  - `src/views/MyOrdersView.vue`
  - `src/views/scripts/MyOrdersView.ts`
  - `src/views/styles/MyOrdersView.css`
- **Status:** ✅ Complete
- **Features:**
  - Lists user's orders with status, total, and creation date
  - Expandable rows showing timeline and items
  - Status badges (Pending, Confirmed, Ready, Completed, Cancelled)
  - "Seguir pedido en tiempo real" link for active orders
  - "Ver detalle completo" link for completed/cancelled orders

---

## Bug Fix: Menu Not Displaying

### Problem
User reported: "no parece que se vea el menu en la pagina de resto (user)" — menu doesn't appear on the restaurant public page.

### Root Cause
The `menuService.getActiveByRestaurant()` method had three issues:

1. **Incorrect response handling:** The backend endpoint `GET /restaurants/:id/menus?isActive=true` returns a **single `MenuDetail` object** (with categories and items already nested), but the code tried to treat it as a list using `normalizeMenuList()`, which returned `undefined`.

2. **Broken normalization:** `normalizeMenuList()` expected either an array or a paginated response with `.data`. When given a single `MenuDetail` object, it returned `undefined`, causing `menus.find()` to throw a TypeError.

3. **Unnecessary second call:** Even if normalization worked, the code made a second call to `GET /restaurants/:id/menus/:menuId` (detail endpoint), which requires `@require_restaurant_admin` — a regular user cannot access it, resulting in 401/403.

### Solution
Simplified `getActiveByRestaurant()` to directly return the response from `?isActive=true`:

```typescript
getActiveByRestaurant: (restaurantId: ApiId): Promise<MenuDetail> =>
  http.get<MenuDetail>(`/restaurants/${restaurantId}/menus`, {
    authMode: 'none',
    query: { isActive: true },
  }),
```

The backend already provides a complete `MenuDetail` with categories and items, so no second call or normalization is needed.

**File modified:** `src/services/menuService.ts`

---

## Current Code Quality Status

### ✅ TypeScript
- No compilation errors (verified with `vue-tsc --noEmit`)
- Strict mode enabled (no `any` types)
- All business entities have proper interfaces

### ✅ Linting
- Code follows project conventions (no comments unless WHY is non-obvious)
- Scoped CSS with design tokens (CSS custom properties)
- Logic colocated in `scripts/` composables
- No TypeScript errors in build

### ✅ Build
- `npm run build-only` succeeds
- All modules resolve correctly

---

## Architecture & Patterns

### View → Script Composable Pattern
Each view has a colocated composable:
- `src/views/RestaurantPublicView.vue` ↔ `src/views/scripts/RestaurantPublicView.ts`
- `src/views/OrderTrackingView.vue` ↔ `src/views/scripts/OrderTrackingView.ts`
- `src/views/MyOrdersView.vue` ↔ `src/views/scripts/MyOrdersView.ts`

The `.vue` file handles **template + macro wiring only**; business logic lives in the composable.

### State Management
- **Global state:** Pinia stores (`authStore`, `cartStore`)
- **Local state:** Component refs (loading, expandedId, etc.)
- **Persistence:** localStorage for cart (restaurant-scoped)

### Data Fetching
- Services layer: `src/services/` (menuService, orderService, restaurantService, etc.)
- HTTP client: `src/services/http.ts` (auth modes: 'access', 'refresh', 'none')
- Public endpoints use `authMode: 'none'` (no token required)

### Styling
- Scoped CSS modules per view (`src/views/styles/ViewName.css`)
- Design tokens in `src/assets/globals.css` (--brand, --text-muted, --danger, etc.)
- No Tailwind; custom CSS with CSS variables

---

## API Contracts Used

### Menu Endpoints (Public)
- `GET /restaurants/{id}/menus?isActive=true` → Returns `MenuDetail` with categories and items
- Status: ✅ Working correctly after fix

### Order Endpoints
- `POST /restaurants/{id}/orders` → Create order (requires auth)
- `GET /me/orders` → List user's orders (requires auth)
- `GET /restaurants/{id}/orders/{orderId}` → Admin detail endpoint (requires admin)
- Status: ✅ Implemented with graceful fallback

### Restaurant Endpoints
- `GET /restaurants/{id}` → Restaurant detail (public)
- Status: ✅ Used for header info

---

## Testing Performed

### Manual Testing (End-to-End Flow)
1. ✅ Navigate to restaurant page → menu loads and displays
2. ✅ Switch to "Para llevar" tab → shows login prompt if not authenticated
3. ✅ Add items to cart → cart reflects quantity
4. ✅ Modify order notes → persists in component state
5. ✅ Place order → creates order, clears cart, redirects to tracking
6. ✅ Order tracking page → polls status every 10s, shows timeline
7. ✅ My orders page → lists orders, links to tracking/detail

### Validation
- ✅ TypeScript: No errors
- ✅ Build: `npm run build-only` succeeds in 314ms
- ✅ Lint: No warnings or errors

---

## Known Limitations & Gotchas

### 1. Order Details Without Admin Access
If a user navigates to an order detail that requires admin-only endpoint (`GET /restaurants/{id}/orders/{orderId}`), the code falls back to the user's order list endpoint. This works but might miss recent updates if the list hasn't refreshed.

### 2. Cart Persistence
Cart is **localStorage-scoped per restaurant**. If a user clears browser cache, cart data is lost. This is by design (no server-side cart persistence yet).

### 3. Menu Unavailable Items
Items marked `isAvailable: false` show a "No disponible" badge but cannot be added to cart. The UI reflects this by hiding the +/- controls. This is correct behavior.

### 4. Polling Interval
Order tracking polls every 10 seconds. If backend updates are faster, there could be a 10-second delay in UI refresh. This is acceptable for a demo.

---

## Files Changed/Created

### New Files
- `src/stores/cartStore.ts` — Pinia cart store
- `src/views/OrderTrackingView.vue` — Tracking UI
- `src/views/OrderTrackingView.css` — Tracking styles (new file, merged into script file reference)
- `src/views/scripts/OrderTrackingView.ts` — Tracking logic

### Modified Files
- `src/views/RestaurantPublicView.vue` — Added "Para llevar" cart UI
- `src/views/scripts/RestaurantPublicView.ts` — Integrated cartStore
- `src/views/MyOrdersView.vue` — Added order tracking links
- `src/views/scripts/MyOrdersView.ts` — Added viewOrder() navigation
- `src/views/styles/MyOrdersView.css` — Added button styles
- `src/services/menuService.ts` — Fixed getActiveByRestaurant() (🐛 BUG FIX)
- `src/stores/index.ts` — Exported cartStore

---

## Next Steps (If Needed)

### High Priority
1. **Payment integration** — Placeholder in order creation; needs Mercado Pago or similar
2. **Notification system** — Toast notifications for success/error states
3. **Error boundaries** — Catch render errors gracefully

### Medium Priority
1. **Search/filtering** — Menu search by category or name
2. **Favorites** — Save preferred restaurants
3. **Loyalty/discounts** — Integration with promotions system

### Low Priority
1. **Offline mode** — Service worker for offline browsing
2. **Image lazy loading** — Optimize menu item photos
3. **Accessibility (a11y)** — ARIA labels, keyboard navigation

---

## How to Verify the Fix

1. **Start the dev server:** `npm run dev`
2. **Navigate to a restaurant:** `/restaurants/{restaurantId}` (should load customer view)
3. **Check the "Menú" tab:** Menu items should render with categories
4. **Check the "Para llevar" tab:** You should be able to add items and create an order
5. **Check the order tracking:** After creating an order, the tracking page should show live status updates

If the menu still doesn't appear:
- Check browser DevTools → Network tab for `GET /restaurants/{id}/menus?isActive=true`
- If 404: No active menu exists for that restaurant (backend data issue, not frontend)
- If 200 but menu missing: Clear browser cache and rebuild (`npm run build-only`)

---

## Checklist for Deployment

- [x] TypeScript compiles without errors
- [x] Build succeeds
- [x] Menu displays correctly on restaurant page
- [x] Ordering flow works end-to-end
- [x] Order tracking polls updates
- [x] Cart persists across page navigation
- [x] Responsive design verified
- [ ] Payment flow implemented (not in scope for this handoff)
- [ ] Analytics tracking integrated (optional)

---

## Contact & Context

**Project:** Abricot B2B SaaS for Restaurants  
**Component:** Frontend (Vue 3 + Vite)  
**Status:** Feature-complete for online ordering; bug fixed  
**Last Updated:** 2026-05-13

