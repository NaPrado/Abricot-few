import type { ApiIdType } from '../common'
import type { IsoDateTimeType, MoneyAmountType } from '../scalar'
import type { MenuItemDiscountType } from './MenuItemDiscountType'

export interface MenuItemType {
  id: ApiIdType
  categoryId: ApiIdType
  name: string
  description?: string | null
  price: MoneyAmountType
  /** Effective price under the active promo; null when no active promo. FREE_ITEM yields "0.00". */
  discountedPrice?: MoneyAmountType | null
  /** Active-promo metadata; null when no active promo. */
  discount?: MenuItemDiscountType | null
  photoUrl?: string | null
  isAvailable: boolean
  createdAt: IsoDateTimeType
}
