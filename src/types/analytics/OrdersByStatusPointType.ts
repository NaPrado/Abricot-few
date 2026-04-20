import type { NonNegativeIntType } from '../scalar'
import type { OrderStatusType } from '../order'

export interface OrdersByStatusPointType {
  status: OrderStatusType
  count: NonNegativeIntType
}
