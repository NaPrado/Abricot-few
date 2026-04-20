import type { MoneyAmountType } from '../scalar'

export interface CreateMenuItemRequestType {
  name: string
  description?: string
  price: MoneyAmountType
  isAvailable?: boolean
}
