import { http } from './http'
import type {
  MyRestaurantsResponse,
  UpdatePasswordRequest,
  UpdatePasswordResponse,
  UpdateUserMeRequest,
  UserProfileResponse,
} from '@/types'

export const userService = {
  getMe: () =>
    http.get<UserProfileResponse>('/users/me'),
  updateMe: (payload: UpdateUserMeRequest) =>
    http.put<UserProfileResponse>('/users/me', payload),
  updatePassword: (payload: UpdatePasswordRequest) =>
    http.put<UpdatePasswordResponse>('/users/me/password', payload),
  getMyRestaurants: () =>
    http.get<MyRestaurantsResponse>('/users/me/restaurants/'),
}