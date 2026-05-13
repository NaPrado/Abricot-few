import { http } from './http'
import type { ApiId, AvailabilityQuery, AvailabilityResponse } from '@/types'

type RawAvailabilityResponse = Omit<AvailabilityResponse, 'slots'> & {
  slots: Array<AvailabilityResponse['slots'][number] & { available?: boolean }>
}

function normalizeAvailability(response: RawAvailabilityResponse): AvailabilityResponse {
  return {
    ...response,
    slots: response.slots.map(slot => ({
      ...slot,
      isAvailable: slot.isAvailable ?? Boolean(slot.available),
    })),
  }
}

export const availabilityService = {
  getByRestaurant: (restaurantId: ApiId, query: AvailabilityQuery) =>
    http
      .get<RawAvailabilityResponse>(`/restaurants/${restaurantId}/availability`, { query })
      .then(normalizeAvailability),
  getPublicByRestaurant: (restaurantId: ApiId, query: AvailabilityQuery) =>
    http
      .get<RawAvailabilityResponse>(`/restaurants/${restaurantId}/public-availability`, {
        authMode: 'none',
        query,
      })
      .then(normalizeAvailability),
}
