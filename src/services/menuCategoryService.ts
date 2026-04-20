import { http } from './http'
import type {
  ApiId,
  CreateMenuCategoryRequest,
  MenuCategory,
  ReorderMenuCategoriesRequest,
  UpdateMenuCategoryRequest,
} from '@/types'

export const menuCategoryService = {
  getByMenu: (menuId: ApiId) =>
    http.get<MenuCategory[]>(`/menus/${menuId}/categories/`, { authMode: 'none' }),
  create: (menuId: ApiId, payload: CreateMenuCategoryRequest) =>
    http.post<MenuCategory>(`/menus/${menuId}/categories/`, payload),
  update: (menuId: ApiId, categoryId: ApiId, payload: UpdateMenuCategoryRequest) =>
    http.put<MenuCategory>(`/menus/${menuId}/categories/${categoryId}`, payload),
  delete: (menuId: ApiId, categoryId: ApiId) =>
    http.delete<void>(`/menus/${menuId}/categories/${categoryId}`),
  reorder: (menuId: ApiId, payload: ReorderMenuCategoriesRequest) =>
    http.patch<MenuCategory[]>(`/menus/${menuId}/categories/reorder`, payload),
}