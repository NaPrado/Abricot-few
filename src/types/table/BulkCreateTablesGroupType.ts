import type { PositiveIntType } from '../scalar'

export interface BulkCreateTablesGroupType {
  quantity: PositiveIntType
  capacity: PositiveIntType
  isJoinable?: boolean
}
