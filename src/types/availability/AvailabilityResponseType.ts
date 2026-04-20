import type { IsoDateType, PositiveIntType } from '../scalar'
import type { AvailabilitySlotType } from './AvailabilitySlotType'

export interface AvailabilityResponseType {
  date: IsoDateType
  partySize: PositiveIntType
  allowTableJoining: boolean
  slots: AvailabilitySlotType[]
}
