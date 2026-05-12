import type { ApiIdType } from '../common'

export interface ProvinceType {
  id: ApiIdType
  name: string
  countryId?: ApiIdType
}
