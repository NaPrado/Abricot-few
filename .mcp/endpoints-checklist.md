# Abricot API Endpoints Checklist

Source: .mcp/abricot_frontend_guide.md
Total unique endpoints: 77

## Auth (3)
- [ ] POST /auth/register
- [ ] POST /auth/login
- [ ] POST /auth/refresh

## Lookup Data (6)
- [ ] GET /cuisines/
- [ ] GET /price-ranges/
- [ ] GET /countries/
- [ ] GET /countries/{countryId}/provinces/
- [ ] GET /provinces/{provinceId}/cities/
- [ ] GET /cities/{cityId}/neighbourhoods/

## Restaurants (6)
- [ ] GET /restaurants/
- [ ] POST /restaurants/
- [ ] GET /restaurants/{restaurantId}
- [ ] PUT /restaurants/{restaurantId}
- [ ] DELETE /restaurants/{restaurantId}
- [ ] POST /restaurants/{restaurantId}/photo

## Tables (6)
- [ ] GET /restaurants/{restaurantId}/tables/
- [ ] POST /restaurants/{restaurantId}/tables/
- [ ] POST /restaurants/{restaurantId}/tables/bulk
- [ ] GET /restaurants/{restaurantId}/tables/{tableId}
- [ ] PUT /restaurants/{restaurantId}/tables/{tableId}
- [ ] DELETE /restaurants/{restaurantId}/tables/{tableId}

## Business Hours (2)
- [ ] GET /restaurants/{restaurantId}/business-hours/
- [ ] PUT /restaurants/{restaurantId}/business-hours/

## Availability (1)
- [ ] GET /restaurants/{restaurantId}/availability/

## Reservations (10)
- [ ] POST /restaurants/{restaurantId}/reservations/
- [ ] POST /restaurants/{restaurantId}/reservations/admin
- [ ] GET /restaurants/{restaurantId}/reservations/
- [ ] GET /reservations/{reservationId}
- [ ] GET /reservations/lookup
- [ ] PATCH /reservations/{reservationId}/cancel
- [ ] PATCH /reservations/{reservationId}/reassign-tables
- [ ] PATCH /reservations/{reservationId}/complete
- [ ] PATCH /reservations/{reservationId}/no-show
- [ ] GET /users/me/reservations/

## Menus (6)
- [ ] GET /restaurants/{restaurantId}/menus/
- [ ] POST /restaurants/{restaurantId}/menus/
- [ ] GET /restaurants/{restaurantId}/menus/{menuId}
- [ ] PUT /restaurants/{restaurantId}/menus/{menuId}
- [ ] DELETE /restaurants/{restaurantId}/menus/{menuId}
- [ ] PATCH /restaurants/{restaurantId}/menus/{menuId}/activate

## Menu Categories (5)
- [ ] GET /menus/{menuId}/categories/
- [ ] POST /menus/{menuId}/categories/
- [ ] PUT /menus/{menuId}/categories/{categoryId}
- [ ] DELETE /menus/{menuId}/categories/{categoryId}
- [ ] PATCH /menus/{menuId}/categories/reorder

## Menu Items (7)
- [ ] GET /categories/{categoryId}/items/
- [ ] POST /categories/{categoryId}/items/
- [ ] GET /items/{itemId}
- [ ] PUT /items/{itemId}
- [ ] DELETE /items/{itemId}
- [ ] POST /items/{itemId}/photo
- [ ] PATCH /items/{itemId}/availability

## Orders (6)
- [ ] POST /restaurants/{restaurantId}/orders/
- [ ] GET /restaurants/{restaurantId}/orders/
- [ ] GET /orders/{orderId}
- [ ] PATCH /orders/{orderId}/status
- [ ] PATCH /orders/{orderId}/cancel
- [ ] GET /users/me/orders/

## Promotions (8)
- [ ] GET /restaurants/{restaurantId}/promotions/
- [ ] GET /promotions/feed
- [ ] POST /restaurants/{restaurantId}/promotions/
- [ ] GET /restaurants/{restaurantId}/promotions/{promotionId}
- [ ] PUT /restaurants/{restaurantId}/promotions/{promotionId}
- [ ] PATCH /restaurants/{restaurantId}/promotions/{promotionId}/deactivate
- [ ] PATCH /restaurants/{restaurantId}/promotions/{promotionId}/activate
- [ ] DELETE /restaurants/{restaurantId}/promotions/{promotionId}

## User Profile (4)
- [ ] GET /users/me
- [ ] PUT /users/me
- [ ] PUT /users/me/password
- [ ] GET /users/me/restaurants/

## Notification Preferences (2)
- [ ] GET /users/me/notification-preferences/
- [ ] PUT /users/me/notification-preferences/{restaurantId}

## Analytics (5)
- [ ] GET /restaurants/{restaurantId}/analytics/occupancy
- [ ] GET /restaurants/{restaurantId}/analytics/orders
- [ ] GET /restaurants/{restaurantId}/analytics/popular-items
- [ ] GET /restaurants/{restaurantId}/analytics/promotions
- [ ] GET /restaurants/{restaurantId}/analytics/peak-hours
