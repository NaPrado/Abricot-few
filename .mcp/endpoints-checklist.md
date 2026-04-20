# Abricot API Endpoints Checklist

Source: .mcp/abricot_frontend_guide.md
Total unique endpoints: 77

## Auth (3)
- [x] POST /auth/register
- [x] POST /auth/login
- [x] POST /auth/refresh

## Lookup Data (6)
- [x] GET /cuisines/
- [x] GET /price-ranges/
- [x] GET /countries/
- [x] GET /countries/{countryId}/provinces/
- [x] GET /provinces/{provinceId}/cities/
- [x] GET /cities/{cityId}/neighbourhoods/

## Restaurants (6)
- [x] GET /restaurants/
- [x] POST /restaurants/
- [x] GET /restaurants/{restaurantId}
- [x] PUT /restaurants/{restaurantId}
- [x] DELETE /restaurants/{restaurantId}
- [x] POST /restaurants/{restaurantId}/photo

## Tables (6)
- [x] GET /restaurants/{restaurantId}/tables/
- [x] POST /restaurants/{restaurantId}/tables/
- [x] POST /restaurants/{restaurantId}/tables/bulk
- [x] GET /restaurants/{restaurantId}/tables/{tableId}
- [x] PUT /restaurants/{restaurantId}/tables/{tableId}
- [x] DELETE /restaurants/{restaurantId}/tables/{tableId}

## Business Hours (2)
- [x] GET /restaurants/{restaurantId}/business-hours/
- [x] PUT /restaurants/{restaurantId}/business-hours/

## Availability (1)
- [x] GET /restaurants/{restaurantId}/availability/

## Reservations (10)
- [x] POST /restaurants/{restaurantId}/reservations/
- [x] POST /restaurants/{restaurantId}/reservations/admin
- [x] GET /restaurants/{restaurantId}/reservations/
- [x] GET /reservations/{reservationId}
- [x] GET /reservations/lookup
- [x] PATCH /reservations/{reservationId}/cancel
- [x] PATCH /reservations/{reservationId}/reassign-tables
- [x] PATCH /reservations/{reservationId}/complete
- [x] PATCH /reservations/{reservationId}/no-show
- [x] GET /users/me/reservations/

## Menus (6)
- [x] GET /restaurants/{restaurantId}/menus/
- [x] POST /restaurants/{restaurantId}/menus/
- [x] GET /restaurants/{restaurantId}/menus/{menuId}
- [x] PUT /restaurants/{restaurantId}/menus/{menuId}
- [x] DELETE /restaurants/{restaurantId}/menus/{menuId}
- [x] PATCH /restaurants/{restaurantId}/menus/{menuId}/activate

## Menu Categories (5)
- [x] GET /menus/{menuId}/categories/
- [x] POST /menus/{menuId}/categories/
- [x] PUT /menus/{menuId}/categories/{categoryId}
- [x] DELETE /menus/{menuId}/categories/{categoryId}
- [x] PATCH /menus/{menuId}/categories/reorder

## Menu Items (7)
- [x] GET /categories/{categoryId}/items/
- [x] POST /categories/{categoryId}/items/
- [x] GET /items/{itemId}
- [x] PUT /items/{itemId}
- [x] DELETE /items/{itemId}
- [x] POST /items/{itemId}/photo
- [x] PATCH /items/{itemId}/availability

## Orders (6)
- [x] POST /restaurants/{restaurantId}/orders/
- [x] GET /restaurants/{restaurantId}/orders/
- [x] GET /orders/{orderId}
- [x] PATCH /orders/{orderId}/status
- [x] PATCH /orders/{orderId}/cancel
- [x] GET /users/me/orders/

## Promotions (8)
- [x] GET /restaurants/{restaurantId}/promotions/
- [x] GET /promotions/feed
- [x] POST /restaurants/{restaurantId}/promotions/
- [x] GET /restaurants/{restaurantId}/promotions/{promotionId}
- [x] PUT /restaurants/{restaurantId}/promotions/{promotionId}
- [x] PATCH /restaurants/{restaurantId}/promotions/{promotionId}/deactivate
- [x] PATCH /restaurants/{restaurantId}/promotions/{promotionId}/activate
- [x] DELETE /restaurants/{restaurantId}/promotions/{promotionId}

## User Profile (4)
- [x] GET /users/me
- [x] PUT /users/me
- [x] PUT /users/me/password
- [x] GET /users/me/restaurants/

## Notification Preferences (2)
- [x] GET /users/me/notification-preferences/
- [x] PUT /users/me/notification-preferences/{restaurantId}

## Analytics (5)
- [x] GET /restaurants/{restaurantId}/analytics/occupancy
- [x] GET /restaurants/{restaurantId}/analytics/orders
- [x] GET /restaurants/{restaurantId}/analytics/popular-items
- [x] GET /restaurants/{restaurantId}/analytics/promotions
- [x] GET /restaurants/{restaurantId}/analytics/peak-hours
