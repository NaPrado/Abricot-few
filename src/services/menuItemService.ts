import { http } from './http'
import type {
  ApiId,
  CreateMenuItemRequest,
  MenuItem,
  UpdateMenuItemRequest,
} from '@/types'

export const menuItemService = {
  getByCategory: (restaurantId: ApiId, menuId: ApiId, categoryId: ApiId) =>
    http.get<MenuItem[]>(
      `/restaurants/${restaurantId}/menus/${menuId}/categories/${categoryId}/items`,
    ),
  create: (
    restaurantId: ApiId,
    menuId: ApiId,
    categoryId: ApiId,
    payload: CreateMenuItemRequest,
  ) =>
    http.post<MenuItem>(
      `/restaurants/${restaurantId}/menus/${menuId}/categories/${categoryId}/items`,
      payload,
    ),
  getById: (restaurantId: ApiId, menuId: ApiId, categoryId: ApiId, itemId: ApiId) =>
    http.get<MenuItem>(
      `/restaurants/${restaurantId}/menus/${menuId}/categories/${categoryId}/items/${itemId}`,
    ),
  update: (
    restaurantId: ApiId,
    menuId: ApiId,
    categoryId: ApiId,
    itemId: ApiId,
    payload: UpdateMenuItemRequest,
  ) =>
    http.put<MenuItem>(
      `/restaurants/${restaurantId}/menus/${menuId}/categories/${categoryId}/items/${itemId}`,
      payload,
    ),
  delete: (restaurantId: ApiId, menuId: ApiId, categoryId: ApiId, itemId: ApiId) =>
    http.delete<void>(
      `/restaurants/${restaurantId}/menus/${menuId}/categories/${categoryId}/items/${itemId}`,
    ),
}
