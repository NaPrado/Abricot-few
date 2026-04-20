import type { IsoTimeType } from '../scalar'

export interface BusinessHourInputType {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6
  opensAt?: IsoTimeType | null
  closesAt?: IsoTimeType | null
  isClosed: boolean
}
