import type { ApiIdType } from '../common'
import type { NonNegativeIntType } from '../scalar'
import type { AnalyticsPeriodType } from './AnalyticsPeriodType'
import type { OccupancyByDayPointType } from './OccupancyByDayPointType'

export interface OccupancyAnalyticsResponseType {
  restaurantId: ApiIdType
  period: AnalyticsPeriodType
  totalReservations: NonNegativeIntType
  totalCovers: NonNegativeIntType
  occupancyByDay: OccupancyByDayPointType[]
}
