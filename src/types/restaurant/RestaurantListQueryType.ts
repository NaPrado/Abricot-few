import type { ApiIdType, PaginationQueryType } from '../common'

export interface RestaurantListQueryType extends PaginationQueryType {
  name?: string
  country_id?: ApiIdType
  province_id?: ApiIdType
  city_id?: ApiIdType
  neighbourhood_id?: ApiIdType
  price_range_id?: ApiIdType
  cuisine_type_id?: ApiIdType | ApiIdType[]
}
