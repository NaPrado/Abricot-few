import { http } from './http'
import type {
  ApiId,
  MyRestaurantsResponse,
  UpdatePasswordRequest,
  UpdatePasswordResponse,
  UpdateUserMeRequest,
  UserProfileResponse,
} from '@/types'

/** All paths use `{userId}` (UUID) from the authenticated user, e.g. `authStore.user.id`. */
export const userService = {
  getById: (userId: ApiId) =>
    http.get<UserProfileResponse>(`/users/${userId}`),
  update: (userId: ApiId, payload: UpdateUserMeRequest) =>
    http.put<UserProfileResponse>(`/users/${userId}`, payload),
  updatePassword: (userId: ApiId, payload: UpdatePasswordRequest) =>
    http.put<UpdatePasswordResponse>(`/users/${userId}/password`, payload),
  listRestaurants: (userId: ApiId) =>
    http.get<MyRestaurantsResponse>(`/users/${userId}/restaurants`),
}
