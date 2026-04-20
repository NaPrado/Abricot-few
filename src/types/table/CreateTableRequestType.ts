import type { PositiveIntType, ShortLabelType } from '../scalar'

export interface CreateTableRequestType {
  number: PositiveIntType
  capacity: PositiveIntType
  name?: ShortLabelType
  isJoinable?: boolean
  isActive?: boolean
}
