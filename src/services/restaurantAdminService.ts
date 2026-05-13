import { http } from './http'
import type {
  ApiId,
  RestaurantAdmin,
  RestaurantAdminAddRequest,
  RestaurantAdminListResponse,
} from '@/types'

export const restaurantAdminService = {
  listByRestaurant: (restaurantId: ApiId) =>
    http.get<RestaurantAdminListResponse>(`/restaurants/${restaurantId}/admins`),
  assign: (restaurantId: ApiId, payload: RestaurantAdminAddRequest) =>
    http.post<RestaurantAdmin>(`/restaurants/${restaurantId}/admins`, payload),
  remove: (restaurantId: ApiId, userId: ApiId) =>
    http.delete<void>(`/restaurants/${restaurantId}/admins/${userId}`),
}
