import { http } from './http'
import type { AuthResponse, LoginRequest, RefreshTokenResponse, RegisterRequest } from '@/types'

export const authService = {
  login: (payload: LoginRequest) =>
    http.post<AuthResponse>('/auth/login', payload, { authMode: 'none' }),
  register: (payload: RegisterRequest) =>
    http.post<AuthResponse>('/auth/register', payload, { authMode: 'none' }),
  refresh: () =>
    http.post<RefreshTokenResponse>('/auth/refresh', undefined, { authMode: 'refresh' }),
}
