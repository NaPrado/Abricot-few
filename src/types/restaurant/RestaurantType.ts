import type { ApiIdType } from '../common'
import type { EmailType, IsoDateTimeType, LongTextType, NonNegativeIntType, PhoneType, PositiveIntType, RestaurantNameType } from '../scalar'
import type { RestaurantCityType } from './RestaurantCityType'
import type { RestaurantCuisineTypeType } from './RestaurantCuisineTypeType'
import type { RestaurantNeighbourhoodType } from './RestaurantNeighbourhoodType'
import type { RestaurantPriceRangeType } from './RestaurantPriceRangeType'

export interface RestaurantType {
  id: ApiIdType
  name: RestaurantNameType
  address: string
  phone: PhoneType
  email: EmailType | null
  description: LongTextType | null
  photoUrl: string | null
  allowTableJoining: boolean
  defaultSlotDurationMinutes: PositiveIntType
  createdAt: IsoDateTimeType
  city: RestaurantCityType
  neighbourhood: RestaurantNeighbourhoodType | null
  priceRange: RestaurantPriceRangeType | null
  cuisineTypes: RestaurantCuisineTypeType[]
  /** Average score 1–5, two decimals; `null` when there are no reviews. */
  averageScore: number | null
  /** Number of reviews for this restaurant. */
  reviewCount: NonNegativeIntType
}
