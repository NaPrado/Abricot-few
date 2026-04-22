import { http } from './http'
import type {
  ApiId,
  CancelReservationRequest,
  CreateAdminReservationRequest,
  CreateReservationRequest,
  PaginationQuery,
  Reservation,
  ReservationLookupQuery,
  ReservationStatus,
  RestaurantReservationsQuery,
  RestaurantReservationsResponse,
  ReassignReservationTablesRequest,
} from '@/types'

type MyReservationsQuery = PaginationQuery & {
  status?: ReservationStatus
}

export const reservationService = {
  create: (restaurantId: ApiId, payload: CreateReservationRequest) =>
    http.post<Reservation>(`/restaurants/${restaurantId}/reservations/`, payload),
  createAdmin: (restaurantId: ApiId, payload: CreateAdminReservationRequest) =>
    http.post<Reservation>(`/restaurants/${restaurantId}/reservations/admin`, payload),
  getByRestaurant: (restaurantId: ApiId, query?: RestaurantReservationsQuery) =>
    http.get<RestaurantReservationsResponse>(`/restaurants/${restaurantId}/reservations/`, { query }),
  getById: (reservationId: ApiId) =>
    http.get<Reservation>(`/reservations/${reservationId}`),
  lookup: (query: ReservationLookupQuery) =>
    http.get<Reservation>('/reservations/lookup', { authMode: 'none', query }),
  cancel: (reservationId: ApiId, payload?: CancelReservationRequest) =>
    http.patch<Reservation>(`/reservations/${reservationId}/cancel`, payload),
  reassignTables: (reservationId: ApiId, payload: ReassignReservationTablesRequest) =>
    http.patch<Reservation>(`/reservations/${reservationId}/reassign-tables`, payload),
  complete: (reservationId: ApiId) =>
    http.patch<Reservation>(`/reservations/${reservationId}/complete`),
  noShow: (reservationId: ApiId) =>
    http.patch<Reservation>(`/reservations/${reservationId}/no-show`),
  listByUser: (userId: ApiId, query?: MyReservationsQuery) =>
    http.get<RestaurantReservationsResponse>(`/users/${userId}/reservations/`, { query }),
}