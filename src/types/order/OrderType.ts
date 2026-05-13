import type { ApiIdType } from '../common'
import type { IsoDateTimeType, MoneyAmountType } from '../scalar'
import type { OrderItemType } from './OrderItemType'
import type { OrderStatusType } from './OrderStatusType'

export interface OrderType {
  id: ApiIdType
  restaurantId: ApiIdType
  /** Optional client-side enrichment; swagger admin/user list does not include it. */
  restaurantName?: string
  userId: ApiIdType
  status: OrderStatusType
  totalAmount: MoneyAmountType
  notes?: string | null
  estimatedReadyAt?: IsoDateTimeType | null
  createdAt: IsoDateTimeType
  /** Present on order detail; list endpoints may omit line items. */
  items?: OrderItemType[]
}
