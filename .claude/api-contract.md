# API Contract (as the frontend actually calls it)

**Source of truth = the deployed backend** (dispatcher `lambdas/{service}/handler.py` +
API GW route map `infra/locals.tf`, in `Abricot-be`). This file documents what the
**frontend code** sends today, cross-checked against the verified known-good set.
`.mcp/` is DEPRECATED; §"Flagged divergences" lists where `.mcp/` is wrong.

Base URL: `VITE_API_BASE_URL` (API Gateway HTTP API). Auth column:
- **access** = Cognito access JWT (`Authorization: Bearer`, default `authMode`)
- **id** = Cognito ID token (provisioning only)
- **public** = no token (`authMode: 'none'`)

## Restaurants — `restaurantService.ts`
| Method | HTTP | Auth | Notes |
|---|---|---|---|
| `getAll` | `GET /restaurants/` | public | list; includes `averageScore`, `reviewCount` |
| `getById` | `GET /restaurants/{id}` | public | flat lookup IDs; nested labels hydrated client-side |
| `putReview` | `PUT /restaurants/{id}/reviews/{userId}` | access | `{ score }` |
| `create` | `POST /restaurants` | access | |
| `update` | `PUT /restaurants/{id}` | access | |
| `delete` | `DELETE /restaurants/{id}` | access | |
| `uploadPhoto` | `POST /restaurants/{id}/photo` | access | **multipart, field `file`**; returns updated `Restaurant` w/ presigned `photoUrl` 🚩 see below |

## Restaurant admins — `restaurantAdminService.ts`
| `listByRestaurant` | `GET /restaurants/{id}/admins` | access |
| `assign` | `POST /restaurants/{id}/admins` | access |
| `remove` | `DELETE /restaurants/{id}/admins/{userId}` | access |

## Menus — `menuService.ts`  ✅ verified canonical set
| Method | HTTP | Auth | Notes |
|---|---|---|---|
| `getByRestaurant` | `GET /restaurants/{id}/admin/menus` | access | **owner list incl. drafts** (`isActive=false`) |
| `getActiveByRestaurant` | `GET /restaurants/{id}/menus?isActive=true` | public | **customer active-only**; returns a single `MenuDetail` |
| `create` | `POST /restaurants/{id}/menus` | access | creates a **draft** |
| `getById` | `GET /restaurants/{id}/menus/{menuId}` | access | by-id, no active filter; `/admin/menus/{menuId}` is identical |
| `update` | `PUT /restaurants/{id}/menus/{menuId}` | access | |
| `delete` | `DELETE /restaurants/{id}/menus/{menuId}` | access | |
| `activate` | `PATCH /restaurants/{id}/menus/{menuId}` `{ isActive: true }` | access | **no `/activate` route** 🚩 |
| `deactivate` | `PATCH /restaurants/{id}/menus/{menuId}` `{ isActive: false }` | access | |

## Menu categories — `menuCategoryService.ts`
| `getByMenu` | `GET /restaurants/{id}/menus/{menuId}/categories` | access |
| `create` | `POST .../categories` | access |
| `getById` | `GET .../categories/{categoryId}` | access | `MenuCategoryWithItems` |
| `update` | `PUT .../categories/{categoryId}` | access |
| `delete` | `DELETE .../categories/{categoryId}` | access |

## Menu items — `menuItemService.ts`
| `getByCategory` | `GET .../categories/{categoryId}/items` | access |
| `create` | `POST .../categories/{categoryId}/items` | access |
| `getById` | `GET .../items/{itemId}` | access |
| `update` | `PUT .../items/{itemId}` | access |
| `delete` | `DELETE .../items/{itemId}` | access |

## Tables — `tableService.ts`
| `getByRestaurant` | `GET /restaurants/{id}/tables` | access | paginated |
| `create` | `POST /restaurants/{id}/tables` | access |
| `bulkCreate` | `POST /restaurants/{id}/tables` | access | bulk-group payload |
| `getById` | `GET /restaurants/{id}/tables/{tableId}` | access |
| `update` | `PUT .../tables/{tableId}` | access |
| `delete` | `DELETE .../tables/{tableId}` | access |

## Business hours — `businessHoursService.ts`
| `getByRestaurant` | `GET /restaurants/{id}/business-hours` | access | unwraps `{ data }` |
| `updateByRestaurant` | `PUT /restaurants/{id}/business-hours` | access |

## Availability — `availabilityService.ts`
| `getByRestaurant` | `GET /restaurants/{id}/availability?date&partySize` | access | normalizes `available`→`isAvailable` |
| `getPublicByRestaurant` | `GET /restaurants/{id}/public-availability` | public |

## Reservations — `reservationService.ts`
| Method | HTTP | Auth | Notes |
|---|---|---|---|
| `create` | `POST /restaurants/{id}/reservations` | access | injects `source:'ONLINE'`; **403 if SNS email not confirmed** |
| `createPublic` | `POST /restaurants/{id}/public-reservations` | public | widget |
| `createAdmin` | `POST /restaurants/{id}/reservations` | access | admin-entered |
| `getByRestaurant` | `GET /restaurants/{id}/reservations` | access | owner list |
| `getById` | `GET /reservations/{reservationId}` | access | |
| `updateStatus`/`cancel`/`complete`/`noShow` | `PATCH /reservations/{reservationId}` `{ status, reason? }` | access | status ∈ `CANCELLED`/`COMPLETED`/`NO_SHOW` |
| `listByUser` | `GET /users/{userId}/reservations` | access | customer |

## Orders — `orderService.ts`
| `create` | `POST /restaurants/{id}/orders` | access | `{ items[], notes? }` |
| `getByRestaurant` | `GET /restaurants/{id}/orders` | access | list may omit `items` |
| `getInRestaurant` | `GET /restaurants/{id}/orders/{orderId}` | access | full, with line items |
| `patchInRestaurant` | `PATCH /restaurants/{id}/orders/{orderId}` | access | status transitions |
| `listByUser` | `GET /users/{userId}/orders` | access | customer |

Order lifecycle: `PENDING → CONFIRMED → READY → COMPLETED`; `CANCELLED` terminal.

## Promotions — `promotionService.ts`
| `listByRestaurant` | `GET /restaurants/{id}/promotions` | access | incl. inactive |
| `create` | `POST /restaurants/{id}/promotions` | access |
| `getById` | `GET /restaurants/{id}/promotions/{promotionId}` | access |
| `delete` | `DELETE /restaurants/{id}/promotions/{promotionId}` | access | 204 |

## Users — `userService.ts`
| Method | HTTP | Auth | Notes |
|---|---|---|---|
| `provision` | `POST /users` `{ accountType? }` | **id** | provisions local user from Cognito identity |
| `refreshLocalUser` | `POST /users` | **id** | re-reads profile incl. `snsSubscriptionStatus` |
| `getById` | `GET /users/{userId}` | access | |
| `update` | `PUT /users/{userId}` | access | |
| `updatePassword` | `PUT /users/{userId}/password` | access | |
| `listRestaurants` | `GET /users/{userId}/restaurants` | access | owner's restaurants |

## Notification preferences — `notificationPreferenceService.ts`
| `listByUser` | `GET /users/{userId}/notification-preferences` | access | unwraps paginated → array |
| `getByRestaurant` | `GET /users/{userId}/notification-preferences/{restaurantId}` | access |
| `updateByRestaurant` | `PUT /users/{userId}/notification-preferences/{restaurantId}` | access |

## Analytics — `analyticsService.ts`
| `getOrders` | `GET /restaurants/{id}/analytics?report=orders&start&end` | access |
| `getMetrics` | `GET /restaurants/{id}/analytics?report=metrics&start&end` | access |
| `getDashboard` | `GET /restaurants/{id}/analytics?report=dashboard&start&end` | access |

`report=dashboard` →
`{ restaurantId, period, totals{orders,reservations,revenue}, byDay[{ date, source:'snapshot'|'live', orders, reservations, revenue }] }`.
`start`/`end` required.

## Lookups — `lookupService.ts`
| `getLookup` | `GET /lookups?type=…&parentId=…` | public | `type` ∈ `country`/`province`/`city`/`neighbourhood`/`price-range`/`cuisine-type`; returns `{ data }` |

## Auth / infra
| `cognitoAuthService.authTest` | `GET /auth-test` | access | claims echo / smoke test |
| http internal refresh | `POST /access-tokens` | refresh | Bearer refresh token → new access token |
| Cognito Hosted UI redirect | API GW `/callback` | — | exchanges code, 302s to SPA `/auth/callback#tokens` |

---

## Image rule
`photoUrl` on `Restaurant` / `MenuItem` is a **presigned URL the API returns**. Render it
directly. **Never build S3 URLs client-side** — they expire and bucket layout is backend-owned.

## Menu draft/active model
`create` → **draft** (`isActive=false`) → owner reads drafts via
`GET /restaurants/{id}/admin/menus` → `activate` (`PATCH … {isActive:true}`) →
customers see active-only via `GET /restaurants/{id}/menus?isActive=true`.

## Reservation SNS gate
The public restaurant page blocks booking until `user.snsSubscriptionStatus === 'CONFIRMED'`
(`RestaurantPublicView.ts:66`). It shows a "Ya confirmé, verificar" button that calls
`refreshLocalUser()` to re-poll status. The backend also enforces this: `POST .../reservations`
returns **403** if unconfirmed, and the UI re-syncs the user on 403 (`RestaurantPublicView.ts:184`).

---

## 🚩 Flagged divergences — `.mcp/` is WRONG, deployed backend is right

| Topic | `.mcp/` claims | Reality (deployed + frontend) |
|---|---|---|
| **Menu activate** | `PATCH .../menus/{menuId}/activate` (`endpoints-checklist.md:62`, `abricot_frontend_guide.md:1420`, `V0_ABRICOT_FULL_SPEC.md:428`) | **No `/activate` route.** `PATCH .../menus/{menuId}` `{ isActive }` (`menuService.ts:30`) |
| **Photo field name** | multipart field **`photo`** (`V0_ABRICOT_FULL_SPEC.md:322`) | field **`file`** (`restaurantService.ts:28`); route only exists since the dispatcher got a `/photo` branch |
| **Owner menu list** | `GET /restaurants/{id}/menus/` as the list (`V0_ABRICOT_FULL_SPEC.md:423`) | owner/draft list is `GET /restaurants/{id}/admin/menus`; un-suffixed `?isActive=true` is customer active-only and returns one `MenuDetail` |
| **Menu item photo** | `POST /items/{itemId}/photo` (`endpoints-checklist.md:77`, `V0_ABRICOT_FULL_SPEC.md:453`) | **frontend implements no item-photo upload** (`menuItemService.ts` has no photo method); `MenuItemPhotoUploadResponseType` exists but is unused — do not assume wired |
| **Promotion activate/deactivate** | `PATCH .../promotions/{id}/activate` & `/deactivate` (`endpoints-checklist.md:94-95`) | `promotionService` only does list/create/getById/delete — **no activate/deactivate calls** |
| **Category reorder** | `PATCH .../categories/reorder` (`V0_ABRICOT_FULL_SPEC.md:442`) | `menuCategoryService` has **no reorder method** (`ReorderMenuCategoriesRequestType` exists, unused) |

When adding/changing a call: verify the route against the dispatcher + `locals.tf` in
`Abricot-be`, not against any table above blindly — this file tracks the frontend and can
itself drift. The deployed backend is final.
