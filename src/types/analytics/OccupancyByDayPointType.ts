import type { IsoDateType, NonNegativeIntType } from '../scalar'

export interface OccupancyByDayPointType {
  date: IsoDateType
  reservations: NonNegativeIntType
  covers: NonNegativeIntType
  occupancyRate: number
}
