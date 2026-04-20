import type { ApiIdType } from '../common'
import type { IsoDateTimeType, MoneyAmountType } from '../scalar'

export interface MenuItemType {
  id: ApiIdType
  categoryId: ApiIdType
  name: string
  description?: string | null
  price: MoneyAmountType
  photoUrl?: string | null
  isAvailable: boolean
  createdAt: IsoDateTimeType
}
