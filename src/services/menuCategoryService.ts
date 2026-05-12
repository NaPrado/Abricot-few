import { http } from './http'
import type {
  ApiId,
  CreateMenuCategoryRequest,
  MenuCategory,
  MenuCategoryWithItems,
  UpdateMenuCategoryRequest,
} from '@/types'

export const menuCategoryService = {
  getByMenu: (restaurantId: ApiId, menuId: ApiId) =>
    http.get<MenuCategory[]>(`/restaurants/${restaurantId}/menus/${menuId}/categories`),
  create: (restaurantId: ApiId, menuId: ApiId, payload: CreateMenuCategoryRequest) =>
    http.post<MenuCategory>(`/restaurants/${restaurantId}/menus/${menuId}/categories`, payload),
  getById: (restaurantId: ApiId, menuId: ApiId, categoryId: ApiId) =>
    http.get<MenuCategoryWithItems>(
      `/restaurants/${restaurantId}/menus/${menuId}/categories/${categoryId}`,
    ),
  update: (
    restaurantId: ApiId,
    menuId: ApiId,
    categoryId: ApiId,
    payload: UpdateMenuCategoryRequest,
  ) =>
    http.put<MenuCategory>(
      `/restaurants/${restaurantId}/menus/${menuId}/categories/${categoryId}`,
      payload,
    ),
  delete: (restaurantId: ApiId, menuId: ApiId, categoryId: ApiId) =>
    http.delete<void>(`/restaurants/${restaurantId}/menus/${menuId}/categories/${categoryId}`),
}
