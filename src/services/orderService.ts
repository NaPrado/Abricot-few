import { http } from './http'
import type {
  ApiId,
  CreateOrderRequest,
  Order,
  RestaurantOrderPatchRequest,
  RestaurantOrdersQuery,
  RestaurantOrdersResponse,
  UpdateOrderStatusRequest,
} from '@/types'

export const orderService = {
  create: (restaurantId: ApiId, payload: CreateOrderRequest) =>
    http.post<Order>(`/restaurants/${restaurantId}/orders/`, payload),
  /** Admin list: `data[]` may omit `items`; use `getInRestaurant` for line items. */
  getByRestaurant: (restaurantId: ApiId, query?: RestaurantOrdersQuery) =>
    http.get<RestaurantOrdersResponse>(`/restaurants/${restaurantId}/orders`, { query }),
  getInRestaurant: (restaurantId: ApiId, orderId: ApiId) =>
    http.get<Order>(`/restaurants/${restaurantId}/orders/${orderId}`),
  patchInRestaurant: (restaurantId: ApiId, orderId: ApiId, body: RestaurantOrderPatchRequest) =>
    http.patch<Order>(`/restaurants/${restaurantId}/orders/${orderId}`, body),
  /** Customer / legacy single-order fetch (if backend still exposes it). */
  getById: (orderId: ApiId) => http.get<Order>(`/orders/${orderId}`),
  updateStatus: (orderId: ApiId, payload: UpdateOrderStatusRequest) =>
    http.patch<Order>(`/orders/${orderId}/status`, payload),
  cancel: (orderId: ApiId) => http.patch<Order>(`/orders/${orderId}/cancel`),
  listByUser: (userId: ApiId, query?: RestaurantOrdersQuery) =>
    http.get<RestaurantOrdersResponse>(`/users/${userId}/orders/`, { query }),
}