import type { ApiIdType } from '../common'
import type { MoneyAmountType, NonNegativeIntType } from '../scalar'
import type { AnalyticsPeriodType } from './AnalyticsPeriodType'
import type { OrdersByStatusPointType } from './OrdersByStatusPointType'
import type { RevenueByDayPointType } from './RevenueByDayPointType'

export interface OrdersAnalyticsResponseType {
  restaurantId: ApiIdType
  period: AnalyticsPeriodType
  totalOrders: NonNegativeIntType
  totalRevenue: MoneyAmountType
  averageOrderValue: MoneyAmountType
  ordersByStatus: OrdersByStatusPointType[]
  revenueByDay: RevenueByDayPointType[]
}
