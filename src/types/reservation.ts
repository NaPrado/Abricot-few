export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED'

export interface Reservation {
  id: string
  customerName: string
  date: string
  time: string
  guests: number
  status: ReservationStatus
}
