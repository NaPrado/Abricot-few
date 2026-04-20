import type { PaginationQueryType } from '../common'
import type { OrderStatusType } from './OrderStatusType'

export interface RestaurantOrdersQueryType extends PaginationQueryType {
  status?: OrderStatusType
}
