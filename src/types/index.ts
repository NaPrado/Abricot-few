// Auth
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

// Restaurant
export interface Restaurant {
  id: number
  name: string
  address: string
  phone: string
  email: string | null
  description: string | null
  photoUrl: string | null
  createdAt: string
}

export interface RestaurantCreateRequest {
  name: string
  address: string
  phone: string
  email?: string
  description?: string
}

export interface RestaurantUpdateRequest {
  name: string
  address: string
  phone: string
  email?: string
  description?: string
}

// Reservations / Orders / etc.
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED'

export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED'

export interface Reservation {
  id: string
  customerName: string
  date: string
  time: string
  guests: number
  status: ReservationStatus
}

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
}

export interface OrderItem {
  menuItem: MenuItem
  quantity: number
}

export interface Order {
  id: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  createdAt: string
}

export interface Notification {
  id: string
  message: string
  timestamp: Date
  read: boolean
}

export interface AnalyticsData {
  revenue: number
  occupancy: { label: string; value: number }[]
  peakHours: { label: string; value: number }[]
}
