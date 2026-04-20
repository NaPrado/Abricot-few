import { http } from './http'
import type {
  ApiId,
  Restaurant,
  RestaurantCreateRequest,
  RestaurantListQuery,
  RestaurantListResponse,
  RestaurantPhotoUploadResponse,
  RestaurantUpdateRequest,
} from '@/types'

export const restaurantService = {
  getAll: (query?: RestaurantListQuery) =>
    http.get<RestaurantListResponse>('/restaurants/', { authMode: 'none', query }),
  getById: (id: ApiId) =>
    http.get<Restaurant>(`/restaurants/${id}`, { authMode: 'none' }),
  create: (payload: RestaurantCreateRequest) =>
    http.post<Restaurant>('/restaurants/', payload),
  update: (id: ApiId, payload: RestaurantUpdateRequest) =>
    http.put<Restaurant>(`/restaurants/${id}`, payload),
  delete: (id: ApiId) =>
    http.delete<void>(`/restaurants/${id}`),
  uploadPhoto: (id: ApiId, file: File) => {
    const formData = new FormData()
    formData.append('photo', file)
    return http.postForm<RestaurantPhotoUploadResponse>(`/restaurants/${id}/photo`, formData)
  },
}
