import type { ApiIdType } from '../common'
import type { CountryIsoCodeType } from '../scalar'

export interface RestaurantCountryType {
  id: ApiIdType
  name: string
  isoCode?: CountryIsoCodeType
}
