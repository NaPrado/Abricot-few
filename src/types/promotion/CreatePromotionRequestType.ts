import type { ApiIdType } from '../common'
import type { IsoDateType, LongTextType, MoneyAmountType, PromotionTitleType } from '../scalar'
import type { DiscountTypeType } from './DiscountTypeType'

export interface CreatePromotionRequestType {
  title: PromotionTitleType
  description?: LongTextType
  discountType: DiscountTypeType
  discountValue: MoneyAmountType
  startDate: IsoDateType
  endDate: IsoDateType
  notifyUsers?: boolean
  menuItemIds?: ApiIdType[]
}
