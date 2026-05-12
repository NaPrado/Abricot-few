import { http } from './http'
import type { AuthResponse, LoginRequest, RefreshTokenResponse, RegisterRequest } from '@/types'

export const authService = {
  login: (payload: LoginRequest) =>
    http.post<AuthResponse>('/sessions', payload, { authMode: 'none' }),
  register: (payload: RegisterRequest) =>
    http.post<AuthResponse>('/users', payload, { authMode: 'none' }),
  refresh: () =>
    http.post<RefreshTokenResponse>('/access-tokens', undefined, { authMode: 'refresh' }),
}
