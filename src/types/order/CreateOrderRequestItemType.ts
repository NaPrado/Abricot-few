import type { ApiIdType } from '../common'
import type { PositiveIntType } from '../scalar'

export interface CreateOrderRequestItemType {
  menuItemId: ApiIdType
  quantity: PositiveIntType
  notes?: string | null
}
