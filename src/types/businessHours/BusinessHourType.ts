import type { ApiIdType } from '../common'
import type { IsoTimeType } from '../scalar'

export interface BusinessHourType {
  id: ApiIdType
  /** Some payloads include the owning restaurant id. */
  restaurantId?: ApiIdType
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6
  /** Optional human-friendly day label; derived client-side when the backend omits it. */
  dayName?: string
  opensAt: IsoTimeType | null
  closesAt: IsoTimeType | null
  isClosed: boolean
}
