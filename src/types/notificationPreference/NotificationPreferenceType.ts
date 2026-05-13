import type { ApiIdType } from '../common'

export interface NotificationPreferenceType {
  /** Some payloads include the row id (UUID). */
  id?: ApiIdType
  /** Some payloads include the owning user id (UUID). */
  userId?: ApiIdType
  restaurantId: ApiIdType
  /** Optional client-side enrichment; swagger does not return it. */
  restaurantName?: string
  receivePromotions: boolean
  receiveOrderUpdates: boolean
  receiveReservationReminders: boolean
}
