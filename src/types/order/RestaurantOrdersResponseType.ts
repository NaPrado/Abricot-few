import type { PaginatedResponseType } from '../common'
import type { OrderType } from './OrderType'

export type RestaurantOrdersResponseType = PaginatedResponseType<OrderType>
