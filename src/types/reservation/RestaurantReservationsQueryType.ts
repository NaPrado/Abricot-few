import type { PaginationQueryType } from '../common'
import type { IsoDateType } from '../scalar'
import type { ReservationSourceType } from './ReservationSourceType'
import type { ReservationStatusType } from './ReservationStatusType'

export interface RestaurantReservationsQueryType extends PaginationQueryType {
  date_from?: IsoDateType
  date_to?: IsoDateType
  status?: ReservationStatusType
  source?: ReservationSourceType
}
