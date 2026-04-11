export interface User {
  id: number
  email: string
  name: string
  surname: string
  createdAt: string
}

export interface AuthResponse {
  accessToken: string
  user: User
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  surname: string
}
