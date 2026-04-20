import type { CreateOrderRequestItemType } from './CreateOrderRequestItemType'

export interface CreateOrderRequestType {
  items: CreateOrderRequestItemType[]
  notes?: string
}
