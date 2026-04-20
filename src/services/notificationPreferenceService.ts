import { http } from './http'
import type {
  ApiId,
  NotificationPreference,
  UpdateNotificationPreferenceRequest,
} from '@/types'

export const notificationPreferenceService = {
  getMyPreferences: () =>
    http.get<NotificationPreference[]>('/users/me/notification-preferences/'),
  updateByRestaurant: (restaurantId: ApiId, payload: UpdateNotificationPreferenceRequest) =>
    http.put<NotificationPreference>(`/users/me/notification-preferences/${restaurantId}`, payload),
}