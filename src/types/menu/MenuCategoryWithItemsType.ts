import type { MenuCategoryType } from './MenuCategoryType'
import type { MenuItemType } from './MenuItemType'

export interface MenuCategoryWithItemsType extends MenuCategoryType {
  items: MenuItemType[]
}
