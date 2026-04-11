import { http } from './http'
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types'

export const authService = {
  login:    (payload: LoginRequest)    => http.post<AuthResponse>('/auth/login', payload),
  register: (payload: RegisterRequest) => http.post<AuthResponse>('/auth/register', payload),
}
