import type { ApiIdType } from '../common'
import type { AnalyticsPeriodType } from './AnalyticsPeriodType'
import type { PopularItemPointType } from './PopularItemPointType'

export interface PopularItemsAnalyticsResponseType {
  restaurantId: ApiIdType
  period: AnalyticsPeriodType
  items: PopularItemPointType[]
}
