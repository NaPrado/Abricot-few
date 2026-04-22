# UI Recovery Implementation Checklist

Date: 2026-04-22
Owner: Copilot implementation pass
Verification commands (`npm run build-only`, `npm run lint`) will be executed by user at the end.

## 1) Theme and scale reset
- [x] Mute orange accent tokens and remove glow-heavy defaults.
- [x] Reduce accent usage in base button/input controls.
- [x] Reduce accent usage in shared app shell navigation.
- [x] Increase readability/density defaults for larger monitors.

## 2) Finder redesign
- [x] Rebuild explore view layout to sidebar filters + results area.
- [x] Add functional filters (name, cuisine, price range) wired to API query.
- [x] Improve card hierarchy and spacing for desktop readability.
- [x] Add robust loading/empty/error/retry states in finder flow.

## 3) Expanded restaurant detail view
- [x] Build split-detail layout with media/info + side reservation panel.
- [x] Load and render menu details, promotions, and business hours.
- [x] Add availability query UI with resilient empty/error handling.
- [x] Add section-level empty states so partial failures do not collapse the page.

## 4) Error hardening and app stability
- [x] Replace hard redirect-on-401 behavior with centralized expired-session event.
- [x] Add app-level error safety net and route/runtime error handlers.
- [x] Mount global toast container at app root.
- [x] Harden auth guard parsing against malformed storage data.
- [x] Remove fragile auto-save watcher loop in notification preferences.

## 5) Wrap-up
- [x] Document all implemented changes in this checklist as completed.
- [x] Leave build/lint execution to user.

## Implementation Notes
- Explore finder now supports API-backed search + cuisine/price filters, sorting, responsive sidebar behavior, and retries.
- Restaurant public detail now loads hero data, menus, promotions, hours, and availability with independent section error states.
- Global stability now relies on event-based 401 handling, root/runtime error guards, global toasts, and safer auth parsing.
