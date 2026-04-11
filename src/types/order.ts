import type { MenuItem } from './menu'

export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED'

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
