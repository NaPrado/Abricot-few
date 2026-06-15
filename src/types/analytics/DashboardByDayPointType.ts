import type { IsoDateType, MoneyAmountType, NonNegativeIntType } from '../scalar'

export type DashboardDaySourceType = 'snapshot' | 'live'

export interface DashboardByDayPointType {
  date: IsoDateType
  source: DashboardDaySourceType
  orders: NonNegativeIntType
  reservations: NonNegativeIntType
  revenue: MoneyAmountType
}
