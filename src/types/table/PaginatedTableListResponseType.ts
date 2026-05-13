import type { PositiveIntType } from '../scalar'
import type { TableType } from './TableType'

export interface PaginatedTableListResponseType {
  data: TableType[]
  total: PositiveIntType
  page: PositiveIntType
  perPage: PositiveIntType
}
