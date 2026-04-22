# Abricot Project Guidelines

## Tech Stack
- Frontend Framework: Vue 3 (Composition API, `<script setup>`).
- Build Tool: Vite.
- Language: TypeScript (Strict mode).
- State Management: Pinia (If needed for the SPA demo).
- Routing: Vue Router.
- Styling: Tailwind CSS (or defined UI library).
- Backend/Cloud: (DEMO phase) Mocked API services simulating Cloud Serverless functions/Database, preparing for eventual real Cloud integration.

## Project Context: Abricot (B2B SaaS for Restaurants)
Abricot is a platform that simplifies and centralizes online orders and reservations for restaurants. The system is designed to be a Cloud-native SaaS to handle elastic demand efficiently without manual intervention from restaurant staff.

## Core Business Features
1. **Real-Time Dashboard:** Admin panel for restaurant owners to configure schedules, tables, and capacity. Prevents overbooking.
2. **Self-Service Booking Engine:** Embeddable widget for clients. Validates capacity and confirms automatically.
3. **Online Orders & Payments:** Digital menu and cart system. Integrates with payment gateways (e.g., Mercado Pago) and sends orders straight to the kitchen.
4. **Automated Notifications:** State changes ("Preparing", "Ready") sent to clients to reduce operational overhead.
5. **Demand Analytics:** Dashboard for historical data, peak hours identification, and predictive resource allocation.

## Current Project Status
- **Frontend:** Initial Vite + Vue 3 setup completed. 
- **Phase:** Structuring the DEMO. Focusing on building the SPA views and mocking the backend interactions to showcase the cloud-value proposition.

## Development Rules
- **Architecture:** SPA optimized for a DEMO showcase. Keep component logic modular to allow easy migration to real cloud endpoints later. For **views** and **components**, put non-trivial `<script setup>` logic in a colocated **`scripts/`** module (`useViewName` / `useComponentName`) and keep the `.vue` file to template, macros, and wiring — see `.mcp/FRONTEND_PRACTICES.md` §5 (Vue 3.5+ forbids `<script setup src="...">`).
- **Strict TypeScript:** No `any`. Define interfaces for all business entities (Reservations, Orders, Restaurants, Menu Items).
- **Clean Code:** Use early returns, functional programming where possible, and descriptive variables.
- **Language:** Code and comments in English. UI text and mock data in Spanish (Argentina).

## Token Efficiency & Workflow (Strict CLI Rules)
- DO NOT generate automated tests (Jest/Cypress/Vitest) unless explicitly requested.
- Do not generate huge boilerplate without asking for confirmation first.
- Use `sed` or targeted edits for minor changes instead of rewriting whole files.
- Limit context: Only read the specific `.vue` or `.ts` files needed for the current task.

## Verification (non-negotiable)
- Do NOT report success unless:
  - TypeScript compilation passes (`npm run build-only` or `vue-tsc --noEmit`).
  - Linter passes (`npm run lint`).
- Fix ALL errors before responding.

## Code Quality
- Leverage Vue's Composition API and composables (`useReservation`, `useOrders`) to separate business logic from UI components.
- Do not apply quick fixes or patches. If architecture is flawed, refactor it.
- Write code a senior engineer would approve.
