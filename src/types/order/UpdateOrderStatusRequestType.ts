import type { IsoDateTimeType } from '../scalar'
import type { OrderStatusType } from './OrderStatusType'

export interface UpdateOrderStatusRequestType {
  status: OrderStatusType
  estimatedReadyAt?: IsoDateTimeType
}
