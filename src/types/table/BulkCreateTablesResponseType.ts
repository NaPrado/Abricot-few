import type { PositiveIntType } from '../scalar'
import type { TableType } from './TableType'

export interface BulkCreateTablesResponseType {
  created: PositiveIntType
  tables: TableType[]
}
