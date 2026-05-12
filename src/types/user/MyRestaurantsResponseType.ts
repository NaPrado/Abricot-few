import type { RestaurantType } from '../restaurant'
import type { PaginatedResponseType } from '../common'

export type MyRestaurantsResponseType = RestaurantType[] | PaginatedResponseType<RestaurantType>
