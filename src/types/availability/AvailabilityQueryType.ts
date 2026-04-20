import type { IsoDateType, PositiveIntType } from '../scalar'

export interface AvailabilityQueryType {
  date: IsoDateType
  party_size: PositiveIntType
}
