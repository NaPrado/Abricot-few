import { http } from './http'
import type { ApiId, AvailabilityQuery, AvailabilityResponse } from '@/types'

export const availabilityService = {
  getByRestaurant: (restaurantId: ApiId, query: AvailabilityQuery) =>
    http.get<AvailabilityResponse>(`/restaurants/${restaurantId}/availability`, { query }),
}
