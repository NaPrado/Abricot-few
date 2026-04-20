import type { ApiIdType } from '../common'
import type { IsoDateTimeType } from '../scalar'

export interface MenuType {
  id: ApiIdType
  restaurantId: ApiIdType
  name: string
  isActive: boolean
  createdAt: IsoDateTimeType
}
