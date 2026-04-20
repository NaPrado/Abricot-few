import type { NonNegativeIntType } from '../scalar'

export interface CreateMenuCategoryRequestType {
  name: string
  displayOrder?: NonNegativeIntType
  isActive?: boolean
}
