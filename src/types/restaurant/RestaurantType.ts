import type { ApiIdType } from '../common'
import type { EmailType, IsoDateTimeType, LongTextType, NonNegativeIntType, PhoneType, PositiveIntType, RestaurantNameType } from '../scalar'
import type { RestaurantCityType } from './RestaurantCityType'
import type { RestaurantCuisineTypeType } from './RestaurantCuisineTypeType'
import type { RestaurantNeighbourhoodType } from './RestaurantNeighbourhoodType'
import type { RestaurantPriceRangeType } from './RestaurantPriceRangeType'

/**
 * Swagger `RestaurantResponse` returns flat IDs only (cityId, neighbourhoodId, priceRangeId,
 * cuisineTypeIds). The optional nested objects (`city`, `neighbourhood`, `priceRange`,
 * `cuisineTypes`) are populated client-side by the lookup store so list/detail UI can render
 * labels without a roundtrip per row.
 */
export interface RestaurantType {
  id: ApiIdType
  name: RestaurantNameType
  address: string
  phone: PhoneType
  email: EmailType | null
  description: LongTextType | null
  photoUrl: string | null
  allowTableJoining?: boolean
  defaultSlotDurationMinutes?: PositiveIntType
  createdAt: IsoDateTimeType

  /** Swagger flat IDs (authoritative). */
  cityId: ApiIdType
  neighbourhoodId: ApiIdType | null
  priceRangeId: ApiIdType | null
  cuisineTypeIds: ApiIdType[]

  /** Client-hydrated nested objects (optional; resolved via lookup store). */
  city?: RestaurantCityType
  neighbourhood?: RestaurantNeighbourhoodType | null
  priceRange?: RestaurantPriceRangeType | null
  cuisineTypes?: RestaurantCuisineTypeType[]

  /** Average score 1–5, two decimals; `null` when there are no reviews. */
  averageScore: number | null
  /** Number of reviews for this restaurant. */
  reviewCount: NonNegativeIntType
}
