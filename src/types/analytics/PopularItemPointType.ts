import type { ApiIdType } from '../common'
import type { MoneyAmountType, NonNegativeIntType, PositiveIntType } from '../scalar'

export interface PopularItemPointType {
  menuItemId: ApiIdType
  name: string
  quantitySold: NonNegativeIntType
  revenue: MoneyAmountType
  rank: PositiveIntType
}
