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
