import type { ApiIdType } from '../common'
import type { CountryIsoCodeType } from '../scalar'

export interface CountryType {
  id: ApiIdType
  name: string
  isoCode: CountryIsoCodeType
}
