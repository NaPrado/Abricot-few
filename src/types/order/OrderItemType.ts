import type { ApiIdType } from '../common'
import type { MoneyAmountType, PositiveIntType } from '../scalar'

export interface OrderItemType {
  id: ApiIdType
  /** Some payloads include the parent order id alongside line items. */
  orderId?: ApiIdType
  menuItemId: ApiIdType
  /** Display name (optional — admin payloads omit it; UI must hydrate from the active menu). */
  menuItemName?: string
  quantity: PositiveIntType
  unitPrice: MoneyAmountType
  notes?: string | null
}
