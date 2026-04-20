import type { ApiIdType } from '../common'
import type { EmailType, GuestNameType, IsoDateType, IsoTimeType, PhoneType, PositiveIntType } from '../scalar'

interface CreateAdminReservationBaseType {
  partySize: PositiveIntType
  date: IsoDateType
  timeSlot: IsoTimeType
  source: 'PHONE' | 'EVENT'
  guestPhone?: PhoneType
  guestEmail?: EmailType
  notes?: string
}

interface CreateAdminReservationWithUserType {
  userId: ApiIdType
  guestName?: GuestNameType | null
}

interface CreateAdminReservationWithGuestType {
  userId?: null
  guestName: GuestNameType
}

export type CreateAdminReservationRequestType = CreateAdminReservationBaseType
  & (CreateAdminReservationWithUserType | CreateAdminReservationWithGuestType)
