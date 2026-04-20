import type { ApiIdType } from '../common'
import type { PositiveIntType } from '../scalar'

export interface ReservationTableType {
  tableId: ApiIdType
  tableNumber: PositiveIntType
  capacity: PositiveIntType
}
