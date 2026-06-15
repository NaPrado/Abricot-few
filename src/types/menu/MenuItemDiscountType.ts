import type { ApiIdType } from '../common'
import type { MoneyAmountType, PromotionTitleType } from '../scalar'
import type { DiscountTypeType } from '../promotion'

/** Active-promo metadata the backend attaches to a menu item. Null on the item when no active promo. */
export interface MenuItemDiscountType {
  promotionId: ApiIdType
  title: PromotionTitleType
  discountType: DiscountTypeType
  discountValue: MoneyAmountType
}
