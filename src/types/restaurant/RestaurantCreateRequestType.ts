import type { ApiIdType } from '../common'
import type { AddressType, EmailType, LongTextType, PhoneType, PositiveIntType, RestaurantNameType } from '../scalar'

export interface RestaurantCreateRequestType {
  name: RestaurantNameType
  address: AddressType
  cityId: ApiIdType
  neighbourhoodId?: ApiIdType
  priceRangeId?: ApiIdType
  cuisineTypeIds?: ApiIdType[]
  phone: PhoneType
  email?: EmailType
  description?: LongTextType
  allowTableJoining?: boolean
  defaultSlotDurationMinutes?: PositiveIntType
}
