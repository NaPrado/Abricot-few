import type { IsoDateType, PositiveIntType } from '../scalar'

export interface AnalyticsQueryType {
  start: IsoDateType
  end: IsoDateType
  limit?: PositiveIntType
}
