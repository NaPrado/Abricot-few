import type { ApiIdType } from '../common'
import type { MoneyAmountType, PositiveIntType } from '../scalar'

export interface OrderItemType {
  id: ApiIdType
  menuItemId: ApiIdType
  menuItemName: string
  quantity: PositiveIntType
  unitPrice: MoneyAmountType
  notes?: string | null
}
