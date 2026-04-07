import { api } from "./api"
import type { AuthResponse, LoginRequest, RegisterRequest } from "@/types"

export const authService = {
  login: (payload: LoginRequest) => api.post<AuthResponse>("/auth/login", payload),
  register: (payload: RegisterRequest) => api.post<AuthResponse>("/auth/register", payload),
}
