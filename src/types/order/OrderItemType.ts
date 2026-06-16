import type { ApiIdType } from '../common'
import type { MoneyAmountType, PositiveIntType } from '../scalar'

export interface OrderItemType {
  id: ApiIdType
  /** Some payloads include the parent order id alongside line items. */
  orderId?: ApiIdType
  menuItemId: ApiIdType
  /**
   * Name snapshotted onto the line at order creation. The rebuilt backend may emit it
   * under any of these camelCase keys depending on the serializer; resolve via
   * `orderItemDisplayName`, which falls back to the id only when ALL are absent.
   */
  menuItemName?: string
  itemName?: string
  name?: string
  quantity: PositiveIntType
  unitPrice: MoneyAmountType
  notes?: string | null
}
