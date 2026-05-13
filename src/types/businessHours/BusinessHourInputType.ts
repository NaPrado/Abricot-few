import type { BusinessHourRangeType } from './BusinessHourRangeType'

export interface BusinessHourInputType {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6
  isClosed: boolean
  ranges?: BusinessHourRangeType[]
}
