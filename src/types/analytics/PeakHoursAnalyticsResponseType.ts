import type { ApiIdType } from '../common'
import type { AnalyticsPeriodType } from './AnalyticsPeriodType'
import type { PeakHourCountPointType } from './PeakHourCountPointType'

export interface PeakHoursAnalyticsResponseType {
  restaurantId: ApiIdType
  period: AnalyticsPeriodType
  reservationsByHour: PeakHourCountPointType[]
  ordersByHour: PeakHourCountPointType[]
}
