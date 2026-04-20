import type { ApiIdType } from '../common'
import type { IsoDateTimeType, MoneyAmountType } from '../scalar'
import type { OrderItemType } from './OrderItemType'
import type { OrderStatusType } from './OrderStatusType'

export interface OrderType {
  id: ApiIdType
  restaurantId: ApiIdType
  restaurantName: string
  userId: ApiIdType
  status: OrderStatusType
  totalAmount: MoneyAmountType
  notes?: string | null
  estimatedReadyAt?: IsoDateTimeType | null
  createdAt: IsoDateTimeType
  items: OrderItemType[]
}
