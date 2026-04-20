import type { IsoTimeType } from '../scalar'
import type { TableAssignmentType } from './TableAssignmentType'

export interface AvailabilitySlotType {
  timeSlot: IsoTimeType
  isAvailable: boolean
  tableAssignment: TableAssignmentType | null
}
