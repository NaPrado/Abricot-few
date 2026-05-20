import { http } from './http'
import type {
  ApiId,
  MyRestaurantsResponse,
  ProvisionUserResponse,
  UpdatePasswordRequest,
  UpdatePasswordResponse,
  UpdateUserMeRequest,
  UserProfileResponse,
} from '@/types'
import type { AccountTypeChoice } from '@/utils/onboardingRedirect'

export const userService = {
  provision: (accountType?: AccountTypeChoice) =>
    http.post<ProvisionUserResponse>(
      '/users',
      accountType ? { accountType } : undefined,
      { authMode: 'id' },
    ),

  refreshLocalUser: () =>
    http.post<ProvisionUserResponse>('/users', undefined, { authMode: 'id' }),

  getById: (userId: ApiId) =>
    http.get<UserProfileResponse>(`/users/${userId}`),
  update: (userId: ApiId, payload: UpdateUserMeRequest) =>
    http.put<UserProfileResponse>(`/users/${userId}`, payload),
  updatePassword: (userId: ApiId, payload: UpdatePasswordRequest) =>
    http.put<UpdatePasswordResponse>(`/users/${userId}/password`, payload),
  listRestaurants: (userId: ApiId) =>
    http.get<MyRestaurantsResponse>(`/users/${userId}/restaurants`),
}

/** @deprecated Use userService.provision */
export const provisionFromCognito = userService.provision
