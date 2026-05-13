import type { BusinessHourRangeType } from './BusinessHourRangeType'

export interface BusinessHourType {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6
  dayName?: string
  isClosed: boolean
  ranges: BusinessHourRangeType[]
}
