# Abricot — Project Documentation

## Overview

**Abricot** is a B2B SaaS platform for restaurants, designed to simplify and centralize online orders and reservations. It is being built as a Cloud-native SaaS to handle elastic demand without manual intervention from restaurant staff.

The current state is a **frontend-only SPA demo**, built with Vue 3, connecting to a real REST API backend. The frontend is the artifact intended to be deployed as a **static site on AWS S3** (served as a public website), while the API it consumes lives elsewhere (another cloud service, e.g., Lambda + API Gateway or an EC2/ECS instance).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Vue 3 (Composition API, `<script setup>`) |
| Build Tool | Vite 8 |
| Language | TypeScript (strict mode, no `any`) |
| State Management | Pinia |
| Routing | Vue Router 5 |
| Styling | Tailwind CSS v4 (via Vite plugin) |
| Icons | lucide-vue-next |
| Charts | Chart.js + vue-chartjs |
| Linting | oxlint + ESLint + Prettier |
| Node requirement | `^20.19.0 \|\| >=22.12.0` |

---

## Project Structure

```
abricot/
├── public/                   # Static assets (favicon, logo)
│   ├── abricot.png
│   └── favicon.ico
├── src/
│   ├── assets/
│   │   └── main.css          # Global Tailwind entry point
│   ├── components/
│   │   ├── AppLayout.vue         # Shell layout: sidebar + router-view
│   │   ├── SidebarNav.vue        # Authenticated navigation sidebar
│   │   ├── RestaurantModal.vue   # Create/Edit restaurant modal form
│   │   ├── RestaurantDetailModal.vue  # Read-only restaurant detail modal
│   │   └── ToastContainer.vue    # Global toast notification renderer
│   ├── composables/
│   │   └── useToast.ts           # Toast notification composable
│   ├── router/
│   │   └── index.ts              # Route definitions + auth guard
│   ├── services/
│   │   ├── api.ts                # Base fetch wrapper (auth headers, error handling)
│   │   ├── authService.ts        # login / register API calls
│   │   └── restaurantService.ts  # CRUD API calls for restaurants
│   ├── stores/
│   │   ├── authStore.ts          # Pinia: session state + login/register/logout
│   │   └── restaurantStore.ts    # Pinia: restaurant list + CRUD actions
│   ├── types/
│   │   └── index.ts              # All TypeScript interfaces (see below)
│   ├── views/
│   │   ├── LandingView.vue       # Public marketing/landing page
│   │   ├── LoginView.vue         # Login form
│   │   ├── RegisterView.vue      # Register form
│   │   └── RestaurantsView.vue   # Authenticated restaurant management
│   ├── App.vue                   # Root component
│   └── main.ts                   # App bootstrap (Pinia, Router, mount)
├── .env.example                  # Environment variable template
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Routing

All routing is handled client-side by Vue Router using `createWebHistory` (HTML5 history mode — **requires S3 + CloudFront redirect rules for SPA**).

| Path | Component | Auth required |
|---|---|---|
| `/` | `LandingView` | No |
| `/login` | `LoginView` | No (redirects to `/app` if already logged in) |
| `/register` | `RegisterView` | No (redirects to `/app` if already logged in) |
| `/app` | `AppLayout` (shell) | **Yes** |
| `/app/restaurants` | `RestaurantsView` | **Yes** |
| `/*` | — | Redirects to `/` |

Auth guard reads `access_token` from `localStorage`. If missing and route requires auth, redirects to `/login`.

---

## API Layer

### Base client — `src/services/api.ts`

- Wraps the native `fetch` API.
- Reads `VITE_API_BASE_URL` from environment at build time.
- Attaches `Authorization: Bearer <token>` on every request (token read from `localStorage`).
- On HTTP 401: clears session, redirects to `/login?expired=1`.
- On HTTP 204: returns `undefined` (no body).
- On any non-ok response: throws `ApiError(status, message)`.

### Services

#### `authService`
```
POST /auth/login      → AuthResponse { accessToken, user }
POST /auth/register   → AuthResponse { accessToken, user }
```

#### `restaurantService`
```
GET    /restaurants/        → Restaurant[]
GET    /restaurants/:id     → Restaurant
POST   /restaurants/        → Restaurant
PUT    /restaurants/:id     → Restaurant
DELETE /restaurants/:id     → 204 No Content
```

---

## TypeScript Domain Model (`src/types/index.ts`)

```ts
// Auth
User              { id, email, name, surname, createdAt }
AuthResponse      { accessToken, user }
LoginRequest      { email, password }
RegisterRequest   { email, password, name, surname }

// Restaurant
Restaurant              { id, name, address, phone, email?, description?, createdAt }
RestaurantCreateRequest { name, address, phone, email?, description? }
RestaurantUpdateRequest { name, address, phone, email?, description? }

// Reservations
ReservationStatus  'PENDING' | 'CONFIRMED' | 'CANCELLED'
Reservation        { id, customerName, date, time, guests, status }

// Orders
OrderStatus  'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED'
MenuItem     { id, name, description, price, category }
OrderItem    { menuItem, quantity }
Order        { id, items, total, status, createdAt }

// Other
Notification   { id, message, timestamp, read }
AnalyticsData  { revenue, occupancy[], peakHours[] }
```

---

## State Management (Pinia)

### `authStore`
- Hydrates from `localStorage` on page load.
- Exposes: `token`, `user`, `isAuthenticated` (computed).
- Actions: `login(payload)`, `register(payload)`, `logout()`.
- Persists token + user to `localStorage` on success.

### `restaurantStore`
- Exposes: `restaurants`, `isLoading`, `error`.
- Actions: `fetchAll()`, `create(payload)`, `update(id, payload)`, `remove(id)`.
- Optimistically updates local state on create/update/delete (no refetch needed).

---

## Environment Variables

Defined in `.env` (gitignored). Template in `.env.example`:

```
VITE_API_BASE_URL=http://localhost:5000
```

- Must be set at **build time** (Vite inlines `import.meta.env.VITE_*` into the bundle).
- For production (S3 deploy), set this to the real API base URL (e.g., API Gateway URL) before running `npm run build`.
- The built `dist/` folder is what gets uploaded to S3.

---

## Build & Scripts

```bash
npm run dev          # Vite dev server (hot reload)
npm run build        # Type-check + Vite production build → dist/
npm run build-only   # Vite build only (no type-check)
npm run type-check   # vue-tsc --build
npm run lint         # oxlint + eslint (with --fix)
npm run format       # Prettier on src/
npm run preview      # Serve the built dist/ locally
```

---

## AWS S3 Deployment — What Claude Needs to Know

### What gets deployed
`npm run build` produces a `dist/` folder with:
- `index.html` — SPA entry point
- `assets/` — hashed JS/CSS chunks
- Static files from `public/` (favicon, logo)

### S3 Static Website Hosting requirements

1. **Bucket must have static website hosting enabled** (`index.html` as index document).
2. **Public access must be unblocked** (Block Public Access settings off).
3. **Bucket policy** must grant `s3:GetObject` to `"*"` on all objects.
4. **CORS** may be needed if the SPA itself serves as a widget host.

### SPA routing issue (critical)
Vue Router uses HTML5 history mode (`createWebHistory`). Any direct URL hit to `/login`, `/app/restaurants`, etc., will return a **403/404 from S3** because those paths don't exist as real files.

**Solutions (choose one):**
- **Option A (recommended):** Put CloudFront in front of S3, and configure a **Custom Error Page** rule: `403 → /index.html (200)` and `404 → /index.html (200)`.
- **Option B:** Use `createWebHashHistory` instead (URLs become `/#/login`) — no server config needed but uglier URLs.

### CORS on the API
The SPA will make `fetch` requests from the S3/CloudFront domain to the API. The API must have **CORS headers** allowing the S3/CloudFront origin:
```
Access-Control-Allow-Origin: https://<your-cloudfront-or-s3-domain>
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

### Build-time env var
Before building for S3, create a `.env.production` file (or set the env var in CI):
```
VITE_API_BASE_URL=https://<your-api-gateway-or-backend-url>
```
Then run `npm run build`. The resulting `dist/` embeds that URL statically.

### Upload to S3
```bash
aws s3 sync dist/ s3://<your-bucket-name>/ --delete
```

### Suggested full architecture
```
User browser
    ↓ HTTPS
CloudFront (CDN + HTTPS + SPA redirect rules)
    ↓
S3 bucket (static files: dist/)
    ↓ (fetch from browser, not CloudFront)
API Gateway / Backend (CORS-enabled)
    ↓
Lambda / ECS / EC2 (application logic)
    ↓
Database (RDS / DynamoDB)
```

---

## Key Constraints for Claude

- The frontend is **purely static** after build — no Node.js server needed at runtime.
- `VITE_API_BASE_URL` must be the **full base URL** of the backend API (no trailing slash needed, services append paths like `/auth/login`).
- JWT tokens are stored in `localStorage` — not cookies. No CSRF concern, but XSS is the threat model to keep in mind.
- The app currently has one authenticated section: restaurant management. More views (reservations, orders, analytics) are typed but not yet routed/built.
