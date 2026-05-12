import type { ApiIdType, PaginationQueryType } from '../common'

export interface RestaurantListQueryType extends PaginationQueryType {
  name?: string
  countryId?: ApiIdType
  provinceId?: ApiIdType
  cityId?: ApiIdType
  neighbourhoodId?: ApiIdType
  priceRangeId?: ApiIdType
  cuisineTypeIds?: ApiIdType | ApiIdType[]
}
