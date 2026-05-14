import { http } from './http'
import type { ApiId, CreateMenuRequest, Menu, MenuDetail, PaginatedResponse, UpdateMenuRequest } from '@/types'

type MenuListResponse = Menu[] | PaginatedResponse<Menu>

function normalizeMenuList(response: MenuListResponse): Menu[] {
  if (Array.isArray(response)) return response
  return response.data
}

export const menuService = {
  /** Admin list: requires JWT. */
  getByRestaurant: (restaurantId: ApiId) =>
    http
      .get<MenuListResponse>(`/restaurants/${restaurantId}/menus`)
      .then(normalizeMenuList),
  getActiveByRestaurant: (restaurantId: ApiId): Promise<MenuDetail> =>
    http.get<MenuDetail>(`/restaurants/${restaurantId}/menus`, {
      authMode: 'none',
      query: { isActive: true },
    }),
  create: (restaurantId: ApiId, payload: CreateMenuRequest) =>
    http.post<Menu>(`/restaurants/${restaurantId}/menus`, payload),
  getById: (restaurantId: ApiId, menuId: ApiId) =>
    http.get<MenuDetail>(`/restaurants/${restaurantId}/menus/${menuId}`),
  update: (restaurantId: ApiId, menuId: ApiId, payload: UpdateMenuRequest) =>
    http.put<Menu>(`/restaurants/${restaurantId}/menus/${menuId}`, payload),
  delete: (restaurantId: ApiId, menuId: ApiId) =>
    http.delete<void>(`/restaurants/${restaurantId}/menus/${menuId}`),
  activate: (restaurantId: ApiId, menuId: ApiId) =>
    http.patch<Menu>(`/restaurants/${restaurantId}/menus/${menuId}`, { isActive: true }),
  deactivate: (restaurantId: ApiId, menuId: ApiId) =>
    http.patch<Menu>(`/restaurants/${restaurantId}/menus/${menuId}`, { isActive: false }),
}
