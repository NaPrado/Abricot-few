import type { ApiIdType } from '../common'
import type { MoneyAmountType, NonNegativeIntType } from '../scalar'
import type { AnalyticsPeriodType } from './AnalyticsPeriodType'

export interface MetricsAnalyticsResponseType {
  restaurantId: ApiIdType
  period: AnalyticsPeriodType
  totalOrders: NonNegativeIntType
  totalReservations: NonNegativeIntType
  totalRevenue: MoneyAmountType
  averageOrderValue?: MoneyAmountType
  totalCovers?: NonNegativeIntType
  completedReservations?: NonNegativeIntType
  cancelledReservations?: NonNegativeIntType
  noShowReservations?: NonNegativeIntType
}
