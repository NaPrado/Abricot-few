import type { ApiIdType } from '../common'
import type { MoneyAmountType, NonNegativeIntType } from '../scalar'

export interface PromotionAnalyticsPointType {
  promotionId: ApiIdType
  title: string
  ordersWithPromotion: NonNegativeIntType
  revenueImpact: MoneyAmountType
  discountGiven: MoneyAmountType
}
