import type { ApiIdType } from '../common'
import type { PositiveIntType } from '../scalar'

export interface TableAssignmentType {
  tableIds: ApiIdType[]
  tableNumbers: PositiveIntType[]
  totalCapacity: PositiveIntType
  isJoined: boolean
}
