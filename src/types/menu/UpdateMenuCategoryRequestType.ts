import type { NonNegativeIntType } from '../scalar'

export interface UpdateMenuCategoryRequestType {
  name: string
  displayOrder: NonNegativeIntType
  isActive: boolean
}
