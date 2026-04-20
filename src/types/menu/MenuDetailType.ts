import type { MenuType } from './MenuType'
import type { MenuCategoryWithItemsType } from './MenuCategoryWithItemsType'

export interface MenuDetailType extends MenuType {
  categories: MenuCategoryWithItemsType[]
}
