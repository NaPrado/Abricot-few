import type { Reservation } from '@/types/index'

const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: '1',
    customerName: 'Valentina Gómez',
    date: '2026-04-07',
    time: '20:00',
    guests: 4,
    status: 'CONFIRMED',
  },
  {
    id: '2',
    customerName: 'Matías Fernández',
    date: '2026-04-07',
    time: '21:00',
    guests: 2,
    status: 'PENDING',
  },
  {
    id: '3',
    customerName: 'Lucía Ramírez',
    date: '2026-04-08',
    time: '13:00',
    guests: 6,
    status: 'CONFIRMED',
  },
  {
    id: '4',
    customerName: 'Tomás Herrera',
    date: '2026-04-08',
    time: '14:30',
    guests: 3,
    status: 'PENDING',
  },
]

export function fetchReservations(): Promise<Reservation[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_RESERVATIONS), 800)
  })
}
