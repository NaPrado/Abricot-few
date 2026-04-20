import type { ApiIdType } from '../common'
import type { IsoDateType, IsoDateTimeType, IsoTimeType, PositiveIntType, ReservationNoteType } from '../scalar'
import type { ReservationSourceType } from './ReservationSourceType'
import type { ReservationStatusType } from './ReservationStatusType'
import type { ReservationTableType } from './ReservationTableType'

export interface ReservationType {
  id: ApiIdType
  restaurantId: ApiIdType
  restaurantName: string
  userId: ApiIdType | null
  guestName: string | null
  guestPhone: string | null
  guestEmail: string | null
  source: ReservationSourceType
  partySize: PositiveIntType
  date: IsoDateType
  timeSlot: IsoTimeType
  status: ReservationStatusType
  notes: ReservationNoteType | null
  confirmationCode: string
  createdAt: IsoDateTimeType
  tables: ReservationTableType[]
}
