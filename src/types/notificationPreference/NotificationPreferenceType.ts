import type { ApiIdType } from '../common'

export interface NotificationPreferenceType {
  restaurantId: ApiIdType
  restaurantName: string
  receivePromotions: boolean
  receiveOrderUpdates: boolean
  receiveReservationReminders: boolean
}
