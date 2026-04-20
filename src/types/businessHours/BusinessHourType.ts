import type { ApiIdType } from '../common'
import type { IsoTimeType } from '../scalar'

export interface BusinessHourType {
  id: ApiIdType
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6
  dayName: string
  opensAt: IsoTimeType | null
  closesAt: IsoTimeType | null
  isClosed: boolean
}
