# Vue 3 + Vite Best Practices — Abricot

A living reference for how this project should be structured and written.
Grounded in the actual codebase, not in generic tutorials.

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Proposed Architecture — Full Separation of Concerns](#2-proposed-architecture--full-separation-of-concerns)
3. [Component Hierarchy](#3-component-hierarchy-detail)
4. [Styling — Tailwind Done Right](#4-styling--tailwind-done-right)
5. [Composables vs Stores vs Services](#5-composables-vs-stores-vs-services)
6. [TypeScript Discipline](#6-typescript-discipline)
7. [Vue Template Rules](#7-vue-template-rules)
8. [Vite-Specific Practices](#8-vite-specific-practices)
9. [HTTP Client — No Axios](#9-http-client--no-axios)
10. [Internationalisation (i18n)](#10-internationalisation-i18n)
11. [What to Never Do](#11-what-to-never-do)

---

## 1. Project Structure

```
src/
├── assets/          # Static files imported by JS (fonts, global CSS)
├── components/
│   ├── base/        # Generic, reusable primitives: BaseInput, BaseButton, BaseModal
│   └── [feature]/   # Feature-specific components: restaurant/, reservations/
├── composables/     # Reusable stateful logic (useToast, useConfirm, useForm)
├── router/          # Route definitions only — no logic
├── services/        # Raw API calls. No state, no UI, no side-effects
├── stores/          # Pinia stores. State + mutations + async actions
├── types/           # All TypeScript interfaces and type aliases
└── views/           # One file per route. Orchestration only — minimal logic
```

### The rule of thumb

> If you find yourself copy-pasting a block of template or logic into a second file,
> it belongs in `components/base/` or `composables/`.

---

## 2. Proposed Architecture — Full Separation of Concerns

The current structure is a flat starter layout — fine for 3 views, painful at
10. This is the target architecture for the project as it grows.

### Directory tree

```
src/
│
├── assets/
│   └── main.css
│
├── components/
│   ├── base/                 ← Tier 1: atoms, no business logic
│   │   ├── BaseButton.vue
│   │   ├── BaseInput.vue
│   │   ├── BaseModal.vue
│   │   ├── BaseSpinner.vue
│   │   ├── BaseBadge.vue
│   │   └── index.ts          ← barrel: re-exports everything in base/
│   │
│   ├── restaurant/           ← Tier 2: domain-specific feature components
│   │   ├── RestaurantTable.vue
│   │   ├── RestaurantForm.vue
│   │   ├── RestaurantDetailModal.vue
│   │   └── index.ts
│   │
│   ├── reservation/
│   │   └── index.ts
│   │
│   └── shared/               ← cross-domain UI (layout, toasts, confirm dialog)
│       ├── AppLayout.vue
│       ├── SidebarNav.vue
│       ├── ToastContainer.vue
│       ├── ConfirmModal.vue
│       └── index.ts
│
├── composables/
│   ├── useToast.ts
│   ├── useConfirm.ts
│   ├── useForm.ts            ← generic reactive form + validation helper
│   └── index.ts
│
├── router/
│   ├── index.ts              ← creates the router instance
│   └── guards.ts             ← navigation guards (auth check, etc.)
│
├── locales/
│   ├── en.ts                 ← English strings
│   ├── es.ts                 ← Spanish (Argentina) strings
│   └── index.ts              ← creates and exports the vue-i18n instance
│
├── services/
│   ├── http.ts               ← native fetch wrapper, interceptors, token injection
│   ├── auth.ts
│   ├── restaurant.ts
│   ├── reservation.ts
│   └── index.ts
│
├── stores/
│   ├── auth.ts
│   ├── restaurant.ts
│   ├── reservation.ts
│   └── index.ts
│
├── types/
│   ├── auth.ts               ← User, AuthResponse, LoginRequest, RegisterRequest
│   ├── restaurant.ts         ← Restaurant, RestaurantCreateRequest, ...
│   ├── reservation.ts        ← Reservation, ReservationStatus, ...
│   ├── order.ts              ← Order, OrderItem, OrderStatus, ...
│   ├── analytics.ts          ← AnalyticsData, ...
│   └── index.ts              ← barrel: export * from each domain file
│
└── views/
    ├── LandingView.vue
    ├── LoginView.vue
    ├── RegisterView.vue
    ├── RestaurantsView.vue
    └── DashboardView.vue
```

### Why barrel files (`index.ts`) matter

A barrel is a file that re-exports everything from its directory. It creates
a clean, stable public API for each folder. Consumers import from the folder,
not from individual files — so you can reorganise internals without touching
every import site.

```ts
// src/types/index.ts  — the barrel
export * from './auth'
export * from './restaurant'
export * from './reservation'
export * from './order'
export * from './analytics'
```

```ts
// Anywhere in the app:
import type { Restaurant, Reservation, OrderStatus } from '@/types'
//                                                          ^^^^^^^
//                                     One import path for all domain types.
//                                     Not '@/types/restaurant', '@/types/order'...
```

```ts
// src/components/base/index.ts
export { default as BaseButton } from './BaseButton.vue'
export { default as BaseInput }  from './BaseInput.vue'
export { default as BaseModal }  from './BaseModal.vue'
```

```ts
// In any component:
import { BaseInput, BaseButton, BaseModal } from '@/components/base'
```

### Split `src/types/index.ts` by domain

The current single `types/index.ts` file will become unmanageable as the
project grows. Each domain gets its own file:

```ts
// src/types/restaurant.ts
export interface Restaurant {
  id: number
  name: string
  address: string
  phone: string
  email: string | null
  description: string | null
  photoUrl: string | null
  createdAt: string
}

export interface RestaurantCreateRequest {
  name: string
  address: string
  phone: string
  email?: string
  description?: string
}

export type RestaurantUpdateRequest = RestaurantCreateRequest
//          ^^^ identical shape — a type alias is cleaner than a duplicate interface
```

```ts
// src/types/reservation.ts
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED'

export interface Reservation {
  id: string
  customerName: string
  date: string
  time: string
  guests: number
  status: ReservationStatus
}
```

```ts
// src/types/index.ts  — just re-exports, nothing else
export * from './auth'
export * from './restaurant'
export * from './reservation'
export * from './order'
export * from './analytics'
```

### The layered dependency rule

Each layer may only depend on the layers below it. Never the other way around.

```
  Views
    ↓  (reads state, calls composables)
  Stores / Composables
    ↓  (calls service functions)
  Services
    ↓  (uses the HTTP client)
  http.ts  (native fetch wrapper)
    ↓
  Types  (imported by all layers, depends on nothing)
```

A service must never import from a store.
A store must never import from a view or component.
Types are the foundation — they import nothing.

### Where the current code diverges from this

| File | Issue | Fix |
|---|---|---|
| `src/types/index.ts` | One flat file for all domain types | Split by domain, re-export via barrel |
| `src/components/` | Flat — all components at root level | Organise into `base/`, `restaurant/`, `shared/` |
| `RestaurantModal.vue` | Repeated input class strings | Extract `BaseInput` component |
| `RestaurantsView.vue` | `window.confirm()` for delete | `useConfirm` composable + `ConfirmModal` |
| `RestaurantModal.vue` | Five individual `ref`s for form fields | Single `reactive` form object |

---

## 3. Component Hierarchy (detail)

There are three tiers. Each tier has a strict contract.

### Tier 1 — Base components (`components/base/`)

Purely presentational. No store access. No API calls. No business logic.
They accept props and emit events. That is their entire surface area.

```
BaseButton.vue
BaseInput.vue
BaseModal.vue
BaseSpinner.vue
BaseBadge.vue
```

These are the atoms of the UI. Every screen is built from them.

### Tier 2 — Feature components (`components/[feature]/`)

Composed from base components. May read from a store (never write directly —
they emit events upward). Know about domain types (`Restaurant`, `Reservation`).

```
restaurant/
  RestaurantTable.vue
  RestaurantForm.vue
  RestaurantDetailModal.vue
```

### Tier 3 — Views (`views/`)

One per route. Reads from stores, calls composables, passes data down.
Contains almost no template logic beyond layout and conditional rendering.
The view is the conductor — it should not play an instrument.

---

## 4. Styling — CSS Architecture

### Core rule: zero visual classes in templates

No Tailwind utility string belongs in a template. Every visual decision lives
in a CSS file. Templates hold only semantic class names.

```html
<!-- Wrong — visual decision in the template -->
<button class="px-4 py-2 bg-orange-500 hover:bg-orange-400 rounded-lg text-sm font-semibold">

<!-- Correct — semantic name, definition lives in CSS -->
<button class="restaurant-card-create-button">
```

This is not about preference. It is about maintainability: a class string in a
template can't be grepped, can't be found via "find usages", and forces you to
open every template to understand the design.

### Style folder structure

Every component directory has a `styles/` subfolder. Every component gets
exactly one CSS file named after it.

```
src/
├── components/
│   ├── base/
│   │   ├── BaseButton.vue
│   │   ├── BaseInput.vue
│   │   └── styles/
│   │       ├── BaseButton.css
│   │       └── BaseInput.css
│   ├── restaurant/
│   │   ├── RestaurantModal.vue
│   │   └── styles/
│   │       └── RestaurantModal.css
│   └── shared/
│       ├── SidebarNav.vue
│       └── styles/
│           └── SidebarNav.css
└── views/
    ├── LoginView.vue
    └── styles/
        └── LoginView.css
```

Each `.vue` file links to its CSS file via `<style src>`:

```vue
<!-- At the bottom of every .vue file — no content, just a reference -->
<style src="./styles/ComponentName.css" scoped></style>
```

`scoped` is non-negotiable. It prevents class names from leaking between
components even when two components happen to share a name like `form-label`.

### Verbose, semantic class names

Class names follow the pattern `[component]-[element]` with BEM-style
modifiers for state variants. Names must be verbose and self-documenting —
never abbreviated.

```css
/* Good — reads like a sentence, impossible to collide with another component */
.restaurant-modal-photo-hover-overlay  { ... }
.restaurant-card-action-btn--delete    { ... }
.sidebar-nav-logout-button             { ... }
.login-view-session-expired-banner     { ... }

/* Bad — too short, ambiguous, will collide */
.overlay  { ... }
.btn      { ... }
.label    { ... }
```

**Modifier convention:** `[component]-[element]--[modifier]`

```css
.toast-item            { /* base styles */ }
.toast-item--error     { /* red tones   */ }
.toast-item--success   { /* green tones */ }
.toast-item--info      { /* neutral     */ }
```

```css
.base-button              { /* shared base */ }
.base-button--primary     { /* orange fill  */ }
.base-button--secondary   { /* ghost/outline */ }
.base-button--danger      { /* red fill     */ }
```

### Compose with `@apply`, define with CSS variables

CSS files use two tools:

1. **`@apply`** to compose Tailwind utilities under a meaningful name — no
   utility string ever appears in a template.
2. **CSS custom properties** from `globals.css` for every design token —
   never hardcode a hex colour, pixel value, or easing function in a component
   file.

```css
/* Good */
.login-view-card {
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-2xl);
  padding: 2rem;
  box-shadow: var(--shadow-card);
}

/* Bad — magic values scattered across component files */
.login-view-card {
  background: #111111;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 24px;
}
```

`@apply` is the bridge between Tailwind's utility system and semantic names:

```css
.base-input {
  @apply w-full rounded-lg px-4 py-2.5 text-sm outline-none;
  background: var(--bg-input);
  border: 1px solid var(--border-default);
  color: var(--text-primary);
  transition: border-color var(--dur-base) var(--ease-out),
              box-shadow var(--dur-base) var(--ease-out);
}
```

### `globals.css` — the design token registry

All base values live in `src/assets/globals.css` as CSS custom properties on
`:root`. Components read from this registry; they never define their own
colour palette or motion values.

```css
/* src/assets/globals.css */
:root {
  /* Backgrounds */
  --bg-base:         #050505;
  --bg-surface:      #0f0f0f;
  --bg-card:         #111111;

  /* Brand */
  --brand:           #f97316;
  --brand-hover:     #fb923c;
  --brand-glow:      0 0 24px rgba(249, 115, 22, 0.18);

  /* Motion */
  --dur-base:    220ms;
  --ease-out:    cubic-bezier(0.0, 0.0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

  /* ... full list in src/assets/globals.css */
}
```

When a new token is needed, it is added to `globals.css` first, then
referenced in the component. Never the other way around.

### Keyframes belong in `globals.css`

Named keyframe animations are global by nature. Define them once in
`globals.css`, reference them anywhere:

```css
/* globals.css */
@keyframes fade-slide-up {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* RestaurantsView.css — just references the name */
.restaurant-card {
  animation: fade-slide-up var(--dur-slow) var(--ease-out) both;
}
```

### The only valid use of inline `style="..."`

Inline `style` attributes are forbidden for visual design. The single
exception is a **truly dynamic runtime value** that cannot be expressed as a
class — e.g. staggered animation delay driven by a loop index:

```html
<!-- Acceptable — the value is computed at runtime from array index -->
<div
  v-for="(r, i) in restaurants"
  class="restaurant-card"
  :style="{ animationDelay: `${i * 0.07}s` }"
>
```

Everything else — colours, borders, spacing, typography — goes in CSS.

### Passing layout constraints from parent to child

When a parent needs to control a generic child's width or positioning, pass
the class via Vue's automatic attribute inheritance:

```html
<!-- LoginView.vue — parent controls width -->
<BaseButton type="submit" class="w-full">
```

This is the one place where a layout utility class (`w-full`, `flex-1`) is
acceptable in a template — because it is a *structural* override from the
outside, not a visual definition from within.

Do not use this for colours, typography, or anything that belongs inside the
component's own CSS.

### Never use `<style>` without `scoped`

An unscoped style block leaks every selector into the global stylesheet. If
two components both define `.form-label`, the last one wins — silently.

Always: `<style src="./styles/ComponentName.css" scoped></style>`

---

## 5. Composables vs Stores vs Services

These three layers are frequently confused. Each has one job.

### Services (`src/services/`)

Talk to the network. Return data or throw. No Vue reactivity, no side-effects,
no knowledge that Vue exists.

```ts
// services/restaurantService.ts
export async function fetchRestaurants(): Promise<Restaurant[]> {
  const res = await api.get('/restaurants')
  return res.data
}
```

### Stores (`src/stores/`)

Hold application state. Call services. Expose reactive getters and async
actions. Views read from stores — they never write directly to store state
(always through an action).

```ts
// stores/restaurantStore.ts
export const useRestaurantStore = defineStore('restaurants', () => {
  const restaurants = ref<Restaurant[]>([])

  async function fetchAll() {
    restaurants.value = await restaurantService.fetchAll()
  }

  return { restaurants, fetchAll }
})
```

### Composables (`src/composables/`)

Encapsulate UI behaviour that needs to be shared across components but doesn't
belong in global state. Think of them as mixins done right.

```ts
// composables/useConfirm.ts  — replaces window.confirm()
export function useConfirm() {
  const pending = ref(false)
  const message = ref('')
  const resolve = ref<((v: boolean) => void) | null>(null)

  function confirm(msg: string): Promise<boolean> {
    message.value = msg
    pending.value = true
    return new Promise((res) => { resolve.value = res })
  }

  function accept() { resolve.value?.(true);  pending.value = false }
  function reject()  { resolve.value?.(false); pending.value = false }

  return { pending, message, confirm, accept, reject }
}
```

### Decision table

| Question | Where it goes |
|---|---|
| Does this data need to survive navigation? | Store |
| Does this data need to be shared between sibling components? | Store |
| Is this UI behaviour I want to reuse across components? | Composable |
| Is this a single API call with no reactive state? | Service |
| Is this logic only used in one component? | Keep it in the component |

---

## 6. TypeScript Discipline

### `src/types/index.ts` is the single source of truth

Never redefine `Restaurant` or `Reservation` inline in a component.
If a type is used in more than one place, it lives in `types/index.ts`.

### Prop types via generics, not runtime validators

```ts
// Correct — compile-time checked, zero runtime cost
defineProps<{
  restaurant: Restaurant
  loading?: boolean
}>()

// Wrong — Vue 2 style, weaker type inference
defineProps({
  restaurant: Object,
  loading: Boolean,
})
```

### Always type emits

Untyped emits are `any` in disguise.

```ts
const emit = defineEmits<{
  (e: 'save', payload: RestaurantCreateRequest, photo: File | null): void
  (e: 'close'): void
}>()
```

### No `as` casts except at DOM boundaries

```ts
// Acceptable — you know the event target is an input
const file = (event.target as HTMLInputElement).files?.[0]

// Not acceptable — this is lying to the compiler
const data = response.data as Restaurant
// Validate the shape or use a type guard instead
```

---

## 7. Vue Template Rules

### `v-if` vs `v-show`

| | `v-if` | `v-show` |
|---|---|---|
| DOM behaviour | Destroyed and recreated | `display: none` toggled |
| Use for | Rarely shown things, modals, error states | Frequently toggled things, tabs, dropdowns |
| Cost | Higher on mount/unmount | Higher on initial render |

Modals correctly use `v-if` in this project. Keep it that way.

### Event handlers

Short one-liners are fine inline. Anything with logic goes in `<script setup>`.

```html
<!-- Fine — single assignment -->
@click="viewingRestaurant = r"

<!-- Not fine — logic in template, untestable -->
@click="if (!loading) { store.delete(r.id); show('Eliminado') }"
```

### Avoid `window.confirm()`

`RestaurantsView.vue` currently calls `confirm()` for the delete action.
It's a browser dialog: unstyled, thread-blocking, inconsistent across browsers,
and impossible to test. Replace it with a `useConfirm` composable backed by a
`ConfirmModal` component.

### Key every `v-for`

Always `:key`. Always a stable unique ID, never the array index.

```html
<!-- Wrong — index causes wrong component reuse on reorder/delete -->
<tr v-for="(r, i) in restaurants" :key="i">

<!-- Correct -->
<tr v-for="r in restaurants" :key="r.id">
```

The existing code does this correctly — keep it up.

### Reactive form objects over individual refs

`RestaurantModal.vue` has five separate `ref`s for form fields. For any form
with more than two fields, a single `reactive` object is cleaner, easier to
reset, and easier to pass around:

```ts
// Instead of five individual refs:
const name = ref('')
const address = ref('')
// ...

// Use one reactive object that mirrors the request type:
const form = reactive<RestaurantCreateRequest>({
  name: '', address: '', phone: '', email: '', description: '',
})

// Resetting on prop change becomes one line:
watch(() => props.restaurant, (r) => {
  Object.assign(form, r ?? { name: '', address: '', phone: '', email: '', description: '' })
}, { immediate: true })

// And submission is just:
emit('save', { ...form }, photoFile.value)
```

---

## 8. Vite-Specific Practices

### Environment variables

Vite only exposes variables prefixed `VITE_` to client code.
**Never put secrets in `VITE_` variables** — they are bundled into the JS
and visible to anyone who opens DevTools.

```bash
# .env.example  (committed — tells teammates what vars are needed)
VITE_API_BASE_URL=http://localhost:3000

# .env.local    (gitignored — your actual values, never committed)
VITE_API_BASE_URL=http://localhost:8080
```

Add them to `env.d.ts` for type safety:

```ts
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
}
```

### Path aliases

The `@` alias to `src/` is configured. Use it everywhere. Never use relative
paths that climb more than one level.

```ts
// Wrong
import { useToast } from '../../../composables/useToast'

// Correct
import { useToast } from '@/composables/useToast'
```

### Lazy-load routes

Any view that isn't needed on first paint should be loaded on demand:

```ts
// router/index.ts
{
  path: '/analytics',
  // This chunk is only downloaded when the user navigates to /analytics
  component: () => import('@/views/AnalyticsView.vue'),
}
```

---

## 9. HTTP Client — No Axios

Axios had a supply-chain security incident in April 2026. Given this project's
security posture, we do not use it. The browser's native `fetch` API is
sufficient and has zero dependencies.

The pattern is a thin typed wrapper in `src/services/http.ts` that handles the
repetitive parts (base URL, auth header injection, JSON parsing, error
normalisation) so every service file stays clean.

```ts
// src/services/http.ts

const BASE_URL = import.meta.env.VITE_API_BASE_URL

class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('accessToken')

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new HttpError(res.status, body.message ?? res.statusText)
  }

  // 204 No Content — return undefined cast to T
  if (res.status === 204) return undefined as T

  return res.json() as Promise<T>
}

export const http = {
  get:    <T>(path: string)                       => request<T>(path, { method: 'GET' }),
  post:   <T>(path: string, body: unknown)        => request<T>(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown)        => request<T>(path, { method: 'PUT',    body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: unknown)        => request<T>(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: <T>(path: string)                       => request<T>(path, { method: 'DELETE' }),
}

export { HttpError }
```

Usage in a service file:

```ts
// src/services/restaurant.ts
import { http } from './http'
import type { Restaurant, RestaurantCreateRequest } from '@/types'

export const restaurantService = {
  fetchAll: ()                              => http.get<Restaurant[]>('/restaurants'),
  fetchOne: (id: number)                   => http.get<Restaurant>(`/restaurants/${id}`),
  create:   (body: RestaurantCreateRequest) => http.post<Restaurant>('/restaurants', body),
  update:   (id: number, body: RestaurantCreateRequest) =>
                                              http.put<Restaurant>(`/restaurants/${id}`, body),
  remove:   (id: number)                   => http.delete<void>(`/restaurants/${id}`),
}
```

The wrapper is ~40 lines, fully typed, and has no CVE surface area.
If you need request cancellation, use `AbortController` — it's built into `fetch`.

---

## 10. Internationalisation (i18n)

### Package

```bash
pnpm add vue-i18n@10
```

vue-i18n v10 is the Composition API-first release. Do not use v8 or earlier —
they predate `<script setup>` and have a fundamentally different API.

### File structure

```
src/locales/
├── en.ts          ← English
├── es.ts          ← Spanish (Argentina) — the default locale
└── index.ts       ← creates and exports the i18n instance
```

### Locale files — typed message schema

Define a TypeScript interface for your message schema so the compiler catches
missing or misspelled translation keys.

```ts
// src/locales/es.ts  (the source of truth — Spanish Argentina is the default)
const es = {
  common: {
    save:   'Guardar cambios',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    retry:  'Reintentar',
    loading: 'Cargando...',
  },
  restaurant: {
    title:       'Restaurantes',
    subtitle:    'Gestioná todos tus locales',
    new:         'Nuevo restaurante',
    edit:        'Editar restaurante',
    empty:       'Sin restaurantes aún',
    emptyHint:   'Creá tu primer local para comenzar',
    deleteConfirm: '¿Eliminar este restaurante? Esta acción no se puede deshacer.',
    savedOk:     'Restaurante guardado correctamente',
    deletedOk:   'Restaurante eliminado',
    fields: {
      name:        'Nombre',
      address:     'Dirección',
      phone:       'Teléfono',
      email:       'Email (opcional)',
      description: 'Descripción (opcional)',
      photo:       'Foto (opcional)',
    },
  },
  auth: {
    login:    'Iniciar sesión',
    logout:   'Cerrar sesión',
    register: 'Registrarse',
    email:    'Correo electrónico',
    password: 'Contraseña',
  },
  errors: {
    generic:  'Ocurrió un error inesperado.',
    notFound: 'No encontrado.',
    network:  'Error de red. Verificá tu conexión.',
  },
} as const

export default es
export type MessageSchema = typeof es   // ← the shared type contract
```

```ts
// src/locales/en.ts
import type { MessageSchema } from './es'

// TypeScript will error if any key present in es.ts is missing here
const en: MessageSchema = {
  common: {
    save:   'Save changes',
    cancel: 'Cancel',
    delete: 'Delete',
    retry:  'Retry',
    loading: 'Loading...',
  },
  restaurant: {
    title:       'Restaurants',
    subtitle:    'Manage all your locations',
    new:         'New restaurant',
    edit:        'Edit restaurant',
    empty:       'No restaurants yet',
    emptyHint:   'Create your first location to get started',
    deleteConfirm: 'Delete this restaurant? This action cannot be undone.',
    savedOk:     'Restaurant saved successfully',
    deletedOk:   'Restaurant deleted',
    fields: {
      name:        'Name',
      address:     'Address',
      phone:       'Phone',
      email:       'Email (optional)',
      description: 'Description (optional)',
      photo:       'Photo (optional)',
    },
  },
  auth: {
    login:    'Log in',
    logout:   'Log out',
    register: 'Register',
    email:    'Email address',
    password: 'Password',
  },
  errors: {
    generic:  'An unexpected error occurred.',
    notFound: 'Not found.',
    network:  'Network error. Check your connection.',
  },
}

export default en
```

### i18n instance

```ts
// src/locales/index.ts
import { createI18n } from 'vue-i18n'
import type { MessageSchema } from './es'
import es from './es'
import en from './en'

export const i18n = createI18n<[MessageSchema], 'es' | 'en'>({
  legacy: false,       // must be false to use Composition API
  locale: 'es',        // default — Spanish Argentina
  fallbackLocale: 'en',
  messages: { es, en },
})
```

```ts
// src/main.ts — register it once
import { createApp } from 'vue'
import { i18n } from '@/locales'
import App from './App.vue'

createApp(App).use(i18n).mount('#app')
```

### Using translations in components

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <h1>{{ t('restaurant.title') }}</h1>
  <p>{{ t('restaurant.subtitle') }}</p>
  <button>{{ t('common.save') }}</button>
</template>
```

The compiler knows every valid key from `MessageSchema`. Mistyping
`t('restaurant.tittle')` is a compile-time error, not a runtime blank string.

### Switching locale at runtime

```ts
// composables/useLocale.ts
import { useI18n } from 'vue-i18n'

export function useLocale() {
  const { locale } = useI18n()

  function setLocale(lang: 'es' | 'en') {
    locale.value = lang
    localStorage.setItem('locale', lang)
  }

  return { locale, setLocale }
}
```

### Rules

- **Spanish is the default** — the `es.ts` file is the source of truth and defines the `MessageSchema` type. English must satisfy that type exactly.
- **No hardcoded UI strings in components.** Every user-visible string goes through `t()`.
- **Mock data stays in Spanish** per the project's CLAUDE.md guidelines. `t()` is for UI chrome (labels, buttons, error messages), not for fixture data.
- **Add keys to both files at the same time.** TypeScript will enforce it, but don't rely on the fallback locale as a crutch.

---

## 11. What to Never Do

| Pattern | Why it's bad | What to do instead |
|---|---|---|
| `style="color: red"` inline attributes | Bypasses Tailwind, no breakpoints, no design system | CSS file via `<style scoped>` |
| Tailwind utility strings in templates | Visual decisions scattered across templates, can't be grepped | Named class in component CSS file with `@apply` |
| Hardcoded hex/px/easing in component CSS | Magic values scattered everywhere, impossible to theme | CSS custom property from `globals.css` |
| Defining a CSS custom property inside a component | Creates hidden token duplication | All tokens live in `globals.css` only |
| `<style src="...">` without `scoped` | Class names leak globally, silent style collisions | Always include `scoped` |
| Abbreviated class names (`.btn`, `.label`, `.overlay`) | Ambiguous, collide across components | Verbose `[component]-[element]--[modifier]` naming |
| Putting keyframe `@keyframes` in a component CSS file | Keyframes are global; components can't scope them | Define in `globals.css`, reference by name |
| Repeated Tailwind class strings across templates | Copy-paste maintenance hell | Extract a base component |
| Logic inside `<template>` expressions | Untestable, hard to read | Move to `<script setup>` |
| Direct store state mutation from a component | Bypasses actions, breaks devtools time-travel | Call a store action |
| `any` type | Defeats TypeScript entirely | Define the interface |
| Untyped `defineEmits()` | Silent `any` on all emitted events | Always use the generic form |
| `window.confirm()` / `window.alert()` | Unstyled, blocking, browser-inconsistent | Composable-backed modal |
| `<style>` without `scoped` | Leaks into every component in the app | `<style src="./styles/X.css" scoped>` |
| Array index as `v-for` key | Wrong component reuse on list mutation | Use a stable unique ID |
| Fetching data directly in `<template>` | Runs on every render, no error handling | `onMounted` or a router guard |
