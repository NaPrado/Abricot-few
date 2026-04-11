import { http } from './http'
import type { Restaurant, RestaurantCreateRequest, RestaurantUpdateRequest } from '@/types'

export const restaurantService = {
  getAll:  ()                                        => http.get<Restaurant[]>('/restaurants/'),
  getById: (id: number)                              => http.get<Restaurant>(`/restaurants/${id}`),
  create:  (payload: RestaurantCreateRequest)        => http.post<Restaurant>('/restaurants/', payload),
  update:  (id: number, payload: RestaurantUpdateRequest) =>
                                                        http.put<Restaurant>(`/restaurants/${id}`, payload),
  delete:  (id: number)                              => http.delete<void>(`/restaurants/${id}`),
  uploadPhoto: (id: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return http.postForm<Restaurant>(`/restaurants/${id}/photo`, formData)
  },
}
