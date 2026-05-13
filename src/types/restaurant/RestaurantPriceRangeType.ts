import type { ApiIdType } from '../common'
import type { NonNegativeIntType } from '../scalar'

export interface RestaurantPriceRangeType {
  id: ApiIdType
  slug?: string
  label: string
  description?: string
  sortOrder?: NonNegativeIntType
}
