import type { IsoDateType, MoneyAmountType, NonNegativeIntType } from '../scalar'

export interface RevenueByDayPointType {
  date: IsoDateType
  revenue: MoneyAmountType
  orders: NonNegativeIntType
}
