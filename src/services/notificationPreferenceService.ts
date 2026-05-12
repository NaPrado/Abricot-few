import { http } from './http'
import type {
  ApiId,
  NotificationPreference,
  UpdateNotificationPreferenceRequest,
} from '@/types'

export const notificationPreferenceService = {
  listByUser: (userId: ApiId) =>
    http.get<NotificationPreference[]>(`/users/${userId}/notification-preferences`),
  updateByRestaurant: (userId: ApiId, restaurantId: ApiId, payload: UpdateNotificationPreferenceRequest) =>
    http.put<NotificationPreference>(`/users/${userId}/notification-preferences/${restaurantId}`, payload),
}
