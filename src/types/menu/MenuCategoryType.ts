import type { ApiIdType } from '../common'
import type { NonNegativeIntType } from '../scalar'

export interface MenuCategoryType {
  id: ApiIdType
  menuId: ApiIdType
  name: string
  displayOrder: NonNegativeIntType
  isActive: boolean
}
