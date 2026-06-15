import { http } from './http'
import type {
  ApiId,
  Restaurant,
  RestaurantCreateRequest,
  RestaurantListQuery,
  RestaurantListResponse,
  RestaurantMyReviewPutRequest,
  RestaurantMyReviewResponse,
  RestaurantUpdateRequest,
} from '@/types'

export const restaurantService = {
  /** Public: no token required (`averageScore`, `reviewCount` included). */
  getAll: (query?: RestaurantListQuery) =>
    http.get<RestaurantListResponse>('/restaurants/', { authMode: 'none', query }),
  getById: (id: ApiId) => http.get<Restaurant>(`/restaurants/${id}`, { authMode: 'none' }),
  putReview: (restaurantId: ApiId, userId: ApiId, body: RestaurantMyReviewPutRequest) =>
    http.put<RestaurantMyReviewResponse>(`/restaurants/${restaurantId}/reviews/${userId}`, body),
  create: (payload: RestaurantCreateRequest) =>
    http.post<Restaurant>('/restaurants', payload),
  update: (id: ApiId, payload: RestaurantUpdateRequest) =>
    http.put<Restaurant>(`/restaurants/${id}`, payload),
  delete: (id: ApiId) =>
    http.delete<void>(`/restaurants/${id}`),
  uploadPhoto: (id: ApiId, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return http.postForm<Restaurant>(`/restaurants/${id}/photo`, formData)
  },
}
