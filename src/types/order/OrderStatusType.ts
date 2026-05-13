/** Swagger flow: PENDING -> CONFIRMED -> READY -> COMPLETED. CANCELLED is terminal. */
export type OrderStatusType =
  | 'PENDING'
  | 'CONFIRMED'
  | 'READY'
  | 'COMPLETED'
  | 'CANCELLED'
