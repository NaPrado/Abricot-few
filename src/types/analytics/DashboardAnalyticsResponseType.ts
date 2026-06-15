import type { ApiIdType } from '../common'
import type { AnalyticsPeriodType } from './AnalyticsPeriodType'
import type { DashboardByDayPointType } from './DashboardByDayPointType'
import type { DashboardTotalsType } from './DashboardTotalsType'

export interface DashboardAnalyticsResponseType {
  restaurantId: ApiIdType
  period: AnalyticsPeriodType
  totals: DashboardTotalsType
  byDay: DashboardByDayPointType[]
}
