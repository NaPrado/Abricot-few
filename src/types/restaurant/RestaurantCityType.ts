import type { ApiIdType } from '../common'
import type { RestaurantProvinceType } from './RestaurantProvinceType'

export interface RestaurantCityType {
  id: ApiIdType
  name: string
  province: RestaurantProvinceType
}
