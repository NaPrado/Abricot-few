import { http } from './http'
import type {
  ApiId,
  CreateMenuItemRequest,
  MenuItem,
  MenuItemPhotoUploadResponse,
  UpdateMenuItemAvailabilityRequest,
  UpdateMenuItemRequest,
} from '@/types'

export const menuItemService = {
  getByCategory: (categoryId: ApiId) =>
    http.get<MenuItem[]>(`/categories/${categoryId}/items/`, { authMode: 'none' }),
  create: (categoryId: ApiId, payload: CreateMenuItemRequest) =>
    http.post<MenuItem>(`/categories/${categoryId}/items/`, payload),
  getById: (itemId: ApiId) =>
    http.get<MenuItem>(`/items/${itemId}`, { authMode: 'none' }),
  update: (itemId: ApiId, payload: UpdateMenuItemRequest) =>
    http.put<MenuItem>(`/items/${itemId}`, payload),
  delete: (itemId: ApiId) =>
    http.delete<void>(`/items/${itemId}`),
  uploadPhoto: (itemId: ApiId, file: File) => {
    const formData = new FormData()
    formData.append('photo', file)
    return http.postForm<MenuItemPhotoUploadResponse>(`/items/${itemId}/photo`, formData)
  },
  updateAvailability: (itemId: ApiId, payload: UpdateMenuItemAvailabilityRequest) =>
    http.patch<MenuItem>(`/items/${itemId}/availability`, payload),
}