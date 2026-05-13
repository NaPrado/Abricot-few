import { http } from './http'
import type {
  ApiId,
  CancelReservationRequest,
  CreateAdminReservationRequest,
  CreateReservationRequest,
  PaginationQuery,
  Reservation,
  ReservationStatus,
  RestaurantReservationsQuery,
  RestaurantReservationsResponse,
} from '@/types'

type MyReservationsQuery = PaginationQuery & {
  status?: ReservationStatus
}

interface UpdateReservationStatusRequest {
  status: Extract<ReservationStatus, 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'>
  reason?: string
}

function updateReservationStatus(
  reservationId: ApiId,
  payload: UpdateReservationStatusRequest,
): Promise<Reservation> {
  return http.patch<Reservation>(`/reservations/${reservationId}`, payload)
}

export const reservationService = {
  create: (restaurantId: ApiId, payload: CreateReservationRequest) =>
    http.post<Reservation>(`/restaurants/${restaurantId}/reservations`, {
      ...payload,
      source: 'ONLINE',
    }),
  createPublic: (restaurantId: ApiId, payload: CreateReservationRequest) =>
    http.post<Reservation>(
      `/restaurants/${restaurantId}/public-reservations`,
      {
        ...payload,
        source: 'ONLINE',
      },
      { authMode: 'none' },
    ),
  createAdmin: (restaurantId: ApiId, payload: CreateAdminReservationRequest) =>
    http.post<Reservation>(`/restaurants/${restaurantId}/reservations`, payload),
  getByRestaurant: (restaurantId: ApiId, query?: RestaurantReservationsQuery) =>
    http.get<RestaurantReservationsResponse>(`/restaurants/${restaurantId}/reservations`, { query }),
  getById: (reservationId: ApiId) =>
    http.get<Reservation>(`/reservations/${reservationId}`),
  updateStatus: (reservationId: ApiId, payload: UpdateReservationStatusRequest) =>
    updateReservationStatus(reservationId, payload),
  cancel: (reservationId: ApiId, payload?: CancelReservationRequest) =>
    updateReservationStatus(reservationId, {
      status: 'CANCELLED',
      ...(payload?.reason ? { reason: payload.reason } : {}),
    }),
  complete: (reservationId: ApiId) =>
    updateReservationStatus(reservationId, { status: 'COMPLETED' }),
  noShow: (reservationId: ApiId) =>
    updateReservationStatus(reservationId, { status: 'NO_SHOW' }),
  listByUser: (userId: ApiId, query?: MyReservationsQuery) =>
    http.get<RestaurantReservationsResponse>(`/users/${userId}/reservations`, { query }),
}
