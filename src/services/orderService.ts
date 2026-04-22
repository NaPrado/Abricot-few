import { http } from './http'
import type {
  ApiId,
  CreateOrderRequest,
  Order,
  RestaurantOrdersQuery,
  RestaurantOrdersResponse,
  UpdateOrderStatusRequest,
} from '@/types'

export const orderService = {
  create: (restaurantId: ApiId, payload: CreateOrderRequest) =>
    http.post<Order>(`/restaurants/${restaurantId}/orders/`, payload),
  getByRestaurant: (restaurantId: ApiId, query?: RestaurantOrdersQuery) =>
    http.get<RestaurantOrdersResponse>(`/restaurants/${restaurantId}/orders/`, { query }),
  getById: (orderId: ApiId) =>
    http.get<Order>(`/orders/${orderId}`),
  updateStatus: (orderId: ApiId, payload: UpdateOrderStatusRequest) =>
    http.patch<Order>(`/orders/${orderId}/status`, payload),
  cancel: (orderId: ApiId) =>
    http.patch<Order>(`/orders/${orderId}/cancel`),
  listByUser: (userId: ApiId, query?: RestaurantOrdersQuery) =>
    http.get<RestaurantOrdersResponse>(`/users/${userId}/orders/`, { query }),
}