import { api } from "./api"
import type { Restaurant, RestaurantCreateRequest, RestaurantUpdateRequest } from "@/types"

export const restaurantService = {
  getAll: () => api.get<Restaurant[]>("/restaurants/"),
  getById: (id: number) => api.get<Restaurant>(`/restaurants/${id}`),
  create: (payload: RestaurantCreateRequest) => api.post<Restaurant>("/restaurants/", payload),
  update: (id: number, payload: RestaurantUpdateRequest) =>
    api.put<Restaurant>(`/restaurants/${id}`, payload),
  delete: (id: number) => api.delete<void>(`/restaurants/${id}`),
  uploadPhoto: (id: number, file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    return api.postForm<Restaurant>(`/restaurants/${id}/photo`, formData)
  },
}
