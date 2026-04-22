# Abricot frontend — compliance audit (guide + practices)

**References:** `.mcp/FRONTEND_PRACTICES.md` (styling §4, script co-location §5), `.mcp/V0_ABRICOT_FULL_SPEC.md` (structure §2 / styling), `CLAUDE.md` (project rules).

Audit date: generated with the “views CSS extraction” pass.

---

## Styling — FRONTEND_PRACTICES §4

| Rule | Status | Notes |
|------|--------|--------|
| Design tokens from `src/assets/globals.css` (`var(--*)`) | **OK** in migrated views | Login, Register, Restaurants, Explore, RestaurantPublic, Placeholder, Landing use tokens |
| **Never** `<style scoped>` inline in SFC — use **`<style src="./styles/ViewName.css" scoped></style>`** | **Fixed** | All route views under `src/views/` now use `views/styles/*.css` |
| Keyframes only in `globals.css` | **OK** | View CSS references vars only |
| Inline `style=""` only for truly dynamic values | **OK** | Landing hero glow uses CSS vars bound to mouse position (acceptable dynamic pattern) |
| Tailwind for layout utilities sparingly | **Mixed** | Most views use plain CSS + tokens; acceptable |

---

## Script logic — FRONTEND_PRACTICES §5

| Rule | Status | Notes |
|------|--------|--------|
| No `<script setup src="...">` (Vue 3.5+ compiler error) | **OK** | Logic in `views/scripts/*.ts` and `components/**/scripts/*.ts` as `use…()` composables; SFCs keep macros + wiring |
| `defineProps` / `defineEmits` / `defineOptions` / `defineExpose` only in `.vue` | **OK** | Matches §5 split |
| Cross-imports from `scripts/` use `@/` for SFCs | **OK** | e.g. `AppLayout` → `@/components/shared/RestaurantSwitcher.vue` |

---

## Internationalisation — FRONTEND_PRACTICES §11

| Rule | Status | Notes |
|------|--------|--------|
| User-visible strings via `vue-i18n` (`useI18n`, `t(...)`) | **Improved** | Login session banner uses `auth.sessionExpired`. Explore / restaurant public / placeholder use `explore.*`, `restaurantPublic.*`, `placeholder.*` |
| `es.ts` / `en.ts` stay in sync (`MessageSchema`) | **OK** | New keys added to both |
| Spanish (Argentina) as source in `es.ts` | **OK** | |

---

## Architecture — practices §1–§2, V0 spec §2

| Rule | Status | Notes |
|------|--------|--------|
| Views = orchestration, thin | **OK** | View logic in `views/scripts/` composables; SFCs are template + short `<script setup>` |
| Services = fetch only, no Pinia | **OK** | |
| No `any` | **OK** | Strict TS |

---

## Gaps / follow-ups (not fixed in this pass)

| Item | Severity | Reference |
|------|----------|-----------|
| `RestaurantsView` uses `window.confirm` for delete | Low–medium | FRONTEND_PRACTICES recommends `useConfirm` + modal |
| Router vs V0 spec (e.g. `/explore`, `/me/*`, role guards) | Medium | V0 spec §4.3, `views-checklist-from-v0-spec.md` |
| `abricot_frontend_guide.md` not grep-matched from workspace for styling rules | — | If the canonical guide adds rules, mirror them here |
| Some **components** (not views) may still use `<style scoped>` blocks instead of `styles/*.css` | Low | Same practice applies; grep `src/components` when touching those files |

---

## Files touched (CSS extraction + i18n + scripts co-location)

- `src/views/scripts/*.ts`, `src/components/base/scripts/*.ts`, `src/components/shared/scripts/*.ts`, `src/components/restaurant/scripts/*.ts` — `use…()` composables per SFC
- `src/views/styles/LoginView.css`, `RegisterView.css`, `RestaurantsView.css`, `ExploreView.css`, `RestaurantPublicView.css`, `PlaceholderView.css` (**new**)
- Matching `*.vue` files: external `<style src="..." scoped>`
- `src/locales/es.ts`, `src/locales/en.ts`: `explore`, `restaurantPublic`, `placeholder`; fixed `auth.errors.login` encoding in `es.ts`
- `src/services/http.ts`: `HttpRequestOptions.query` typed as `object` so typed query DTOs assign cleanly under strict TS
- `src/stores/restaurantStore.ts`: `Object.assign` for partial photo URL update after upload

---

*Re-run this audit after large UI merges or v0 drops.*
