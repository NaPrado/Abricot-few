import type { ApiIdType } from '../common'
import type { IsoDateType, IsoDateTimeType, LongTextType, MoneyAmountType, PromotionTitleType } from '../scalar'
import type { DiscountTypeType } from './DiscountTypeType'
import type { PromotionItemType } from './PromotionItemType'

export interface PromotionType {
  id: ApiIdType
  restaurantId: ApiIdType
  restaurantName: string
  title: PromotionTitleType
  description?: LongTextType
  discountType: DiscountTypeType
  discountValue: MoneyAmountType
  startDate: IsoDateType
  endDate: IsoDateType
  isActive: boolean
  notifyUsers: boolean
  createdAt: IsoDateTimeType
  items: PromotionItemType[]
}
