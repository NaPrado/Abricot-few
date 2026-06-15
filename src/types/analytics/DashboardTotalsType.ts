import type { MoneyAmountType, NonNegativeIntType } from '../scalar'

export interface DashboardTotalsType {
  orders: NonNegativeIntType
  reservations: NonNegativeIntType
  revenue: MoneyAmountType
}
