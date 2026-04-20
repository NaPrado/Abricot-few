import type { ApiIdType } from '../common'
import type { NonNegativeIntType } from '../scalar'

export interface PriceRangeType {
  id: ApiIdType
  slug: string
  label: string
  description: string
  sortOrder: NonNegativeIntType
}
