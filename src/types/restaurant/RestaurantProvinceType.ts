import type { ApiIdType } from '../common'
import type { RestaurantCountryType } from './RestaurantCountryType'

export interface RestaurantProvinceType {
  id: ApiIdType
  name: string
  country: RestaurantCountryType
}
