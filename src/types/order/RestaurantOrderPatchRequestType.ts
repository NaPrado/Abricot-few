import type { IsoDateTimeType } from '../scalar'
import type { OrderStatusType } from './OrderStatusType'

/** Admin PATCH `/restaurants/{id}/orders/{orderId}` (takeout / kitchen). */
export interface RestaurantOrderPatchRequestType {
  status: OrderStatusType
  estimatedReadyAt?: IsoDateTimeType | null
}
