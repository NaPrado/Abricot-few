import { http } from './http'
import type { ApiId, CreateMenuRequest, Menu, MenuDetail, PaginatedResponse, UpdateMenuRequest } from '@/types'

type ActiveMenuResponse = MenuDetail | MenuDetail[] | { data: MenuDetail[] | MenuDetail } | null | undefined
type MenuListResponse = Menu[] | PaginatedResponse<Menu>

function normalizeMenuList(response: MenuListResponse): Menu[] {
  if (Array.isArray(response)) return response
  return response.data
}

function normalizeActiveMenu(response: ActiveMenuResponse): MenuDetail | null {
  if (!response) return null

  if (Array.isArray(response)) {
    return response[0] ?? null
  }

  if ('data' in response) {
    const { data } = response
    if (Array.isArray(data)) return data[0] ?? null
    return data ?? null
  }

  return response
}

export const menuService = {
  /** Admin list: requires JWT. */
  getByRestaurant: (restaurantId: ApiId) =>
    http
      .get<MenuListResponse>(`/restaurants/${restaurantId}/menus`)
      .then(normalizeMenuList),
  getActiveByRestaurant: (restaurantId: ApiId) =>
    http
      .get<ActiveMenuResponse>(`/restaurants/${restaurantId}/menus`, {
        authMode: 'none',
        query: { isActive: true, include: 'categories,items' },
      })
      .then(normalizeActiveMenu),
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
