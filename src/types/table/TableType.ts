import type { ApiIdType } from '../common'
import type { PositiveIntType, ShortLabelType } from '../scalar'

export interface TableType {
  id: ApiIdType
  restaurantId: ApiIdType
  number: PositiveIntType
  capacity: PositiveIntType
  name?: ShortLabelType | null
  isJoinable: boolean
  isActive: boolean
}
