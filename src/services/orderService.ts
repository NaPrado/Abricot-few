import { http } from './http'
import type {
  ApiId,
  CreateOrderRequest,
  Order,
  RestaurantOrderPatchRequest,
  RestaurantOrdersQuery,
  RestaurantOrdersResponse,
} from '@/types'

export const orderService = {
  create: (restaurantId: ApiId, payload: CreateOrderRequest) =>
    http.post<Order>(`/restaurants/${restaurantId}/orders`, payload),
  /** Admin list: `data[]` may omit `items`; use `getInRestaurant` for line items. */
  getByRestaurant: (restaurantId: ApiId, query?: RestaurantOrdersQuery) =>
    http.get<RestaurantOrdersResponse>(`/restaurants/${restaurantId}/orders`, { query }),
  getInRestaurant: (restaurantId: ApiId, orderId: ApiId) =>
    http.get<Order>(`/restaurants/${restaurantId}/orders/${orderId}`),
  patchInRestaurant: (restaurantId: ApiId, orderId: ApiId, body: RestaurantOrderPatchRequest) =>
    http.patch<Order>(`/restaurants/${restaurantId}/orders/${orderId}`, body),
  listByUser: (userId: ApiId, query?: RestaurantOrdersQuery) =>
    http.get<RestaurantOrdersResponse>(`/users/${userId}/orders`, { query }),
}
