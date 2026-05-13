import type {
  EmailType,
  GuestNameType,
  IsoDateType,
  IsoTimeType,
  PhoneType,
  PositiveIntType,
  ReservationNoteType,
} from '../scalar'

export interface CreateReservationRequestType {
  partySize: PositiveIntType
  date: IsoDateType
  timeSlot: IsoTimeType
  source?: 'ONLINE'
  guestName?: GuestNameType
  guestEmail?: EmailType
  guestPhone?: PhoneType
  notes?: ReservationNoteType
}
