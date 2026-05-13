import { http } from './http'
import type {
  ApiId,
  NotificationPreference,
  PaginatedResponse,
  PaginationQuery,
  UpdateNotificationPreferenceRequest,
} from '@/types'

type NotificationPreferenceListResponse =
  | NotificationPreference[]
  | PaginatedResponse<NotificationPreference>

function normalizeList(
  response: NotificationPreferenceListResponse,
): NotificationPreference[] {
  if (Array.isArray(response)) return response
  return response.data
}

export const notificationPreferenceService = {
  /** Swagger returns a paginated payload — we unwrap to a flat array for the UI. */
  listByUser: async (
    userId: ApiId,
    query?: PaginationQuery,
  ): Promise<NotificationPreference[]> => {
    const response = await http.get<NotificationPreferenceListResponse>(
      `/users/${userId}/notification-preferences`,
      { query },
    )
    return normalizeList(response)
  },
  getByRestaurant: (userId: ApiId, restaurantId: ApiId) =>
    http.get<NotificationPreference>(
      `/users/${userId}/notification-preferences/${restaurantId}`,
    ),
  updateByRestaurant: (
    userId: ApiId,
    restaurantId: ApiId,
    payload: UpdateNotificationPreferenceRequest,
  ) =>
    http.put<NotificationPreference>(
      `/users/${userId}/notification-preferences/${restaurantId}`,
      payload,
    ),
}
