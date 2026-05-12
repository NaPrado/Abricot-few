import type { IsoDateType, IsoTimeType, PositiveIntType, ReservationNoteType } from '../scalar'

export interface CreateReservationRequestType {
  partySize: PositiveIntType
  date: IsoDateType
  timeSlot: IsoTimeType
  source?: 'ONLINE'
  notes?: ReservationNoteType
}
