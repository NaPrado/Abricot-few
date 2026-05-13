import type { ApiIdType } from '../common'
import type { AnalyticsPeriodType } from './AnalyticsPeriodType'
import type { PromotionAnalyticsPointType } from './PromotionAnalyticsPointType'

export interface PromotionsAnalyticsResponseType {
  restaurantId: ApiIdType
  period: AnalyticsPeriodType
  promotions: PromotionAnalyticsPointType[]
}
