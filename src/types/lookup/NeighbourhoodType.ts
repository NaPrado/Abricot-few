import type { ApiIdType } from '../common'

export interface NeighbourhoodType {
  id: ApiIdType
  name: string
  cityId?: ApiIdType
}
