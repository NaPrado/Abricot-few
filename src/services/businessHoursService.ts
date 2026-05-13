import { http } from './http'
import type { ApiId, BusinessHour, UpdateBusinessHoursRequest } from '@/types'

interface BusinessHoursResponse {
  data: BusinessHour[]
  total: number
  page: number
  perPage: number
}

export const businessHoursService = {
  getByRestaurant: async (restaurantId: ApiId): Promise<BusinessHour[]> => {
    const response = await http.get<BusinessHoursResponse>(`/restaurants/${restaurantId}/business-hours`)
    return response.data
  },
  updateByRestaurant: async (restaurantId: ApiId, payload: UpdateBusinessHoursRequest): Promise<BusinessHour[]> => {
    const response = await http.put<BusinessHoursResponse>(`/restaurants/${restaurantId}/business-hours`, payload)
    return response.data
  },
}
