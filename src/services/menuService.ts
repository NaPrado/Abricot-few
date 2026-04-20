import { http } from './http'
import type { ApiId, CreateMenuRequest, Menu, MenuDetail, UpdateMenuRequest } from '@/types'

export const menuService = {
  getByRestaurant: (restaurantId: ApiId) =>
    http.get<Menu[]>(`/restaurants/${restaurantId}/menus/`, { authMode: 'none' }),
  create: (restaurantId: ApiId, payload: CreateMenuRequest) =>
    http.post<Menu>(`/restaurants/${restaurantId}/menus/`, payload),
  getById: (restaurantId: ApiId, menuId: ApiId) =>
    http.get<MenuDetail>(`/restaurants/${restaurantId}/menus/${menuId}`, { authMode: 'none' }),
  update: (restaurantId: ApiId, menuId: ApiId, payload: UpdateMenuRequest) =>
    http.put<Menu>(`/restaurants/${restaurantId}/menus/${menuId}`, payload),
  delete: (restaurantId: ApiId, menuId: ApiId) =>
    http.delete<void>(`/restaurants/${restaurantId}/menus/${menuId}`),
  activate: (restaurantId: ApiId, menuId: ApiId) =>
    http.patch<Menu>(`/restaurants/${restaurantId}/menus/${menuId}/activate`),
}