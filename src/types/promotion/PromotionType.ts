import type { ApiIdType } from '../common'
import type { IsoDateType, IsoDateTimeType, LongTextType, MoneyAmountType, PromotionTitleType } from '../scalar'
import type { DiscountTypeType } from './DiscountTypeType'
import type { PromotionItemType } from './PromotionItemType'

export interface PromotionType {
  id: ApiIdType
  restaurantId: ApiIdType
  /** Some public/feed payloads include this; admin list may omit it. */
  restaurantName?: string
  title: PromotionTitleType
  description?: LongTextType
  discountType: DiscountTypeType
  discountValue: MoneyAmountType
  startDate: IsoDateType
  endDate: IsoDateType
  isActive: boolean
  notifyUsers: boolean
  createdAt: IsoDateTimeType
  /** Admin list/detail: UUIDs of menu items in scope (may be absent on some payloads). */
  menuItemIds?: ApiIdType[]
  /** Optional enriched rows (e.g. public feed). */
  items?: PromotionItemType[]
}
