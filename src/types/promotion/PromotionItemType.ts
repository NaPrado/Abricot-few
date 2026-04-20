import type { ApiIdType } from '../common'
import type { MoneyAmountType } from '../scalar'

export interface PromotionItemType {
  id: ApiIdType
  categoryId: ApiIdType
  name: string
  price: MoneyAmountType
}
