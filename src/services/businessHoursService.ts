import { http } from './http'
import type { ApiId, BusinessHour, UpdateBusinessHoursRequest } from '@/types'

export const businessHoursService = {
  getByRestaurant: (restaurantId: ApiId) =>
    http.get<BusinessHour[]>(`/restaurants/${restaurantId}/business-hours/`, { authMode: 'none' }),
  updateByRestaurant: (restaurantId: ApiId, payload: UpdateBusinessHoursRequest) =>
    http.put<BusinessHour[]>(`/restaurants/${restaurantId}/business-hours/`, payload),
}