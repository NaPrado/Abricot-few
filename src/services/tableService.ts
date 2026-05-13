import { http } from './http'
import type {
  ApiId,
  BulkCreateTablesRequest,
  BulkCreateTablesResponse,
  CreateTableRequest,
  PaginatedTableListResponse,
  Table,
  UpdateTableRequest,
} from '@/types'

export const tableService = {
  getByRestaurant: (restaurantId: ApiId) =>
    http.get<PaginatedTableListResponse>(`/restaurants/${restaurantId}/tables`),
  create: (restaurantId: ApiId, payload: CreateTableRequest) =>
    http.post<Table>(`/restaurants/${restaurantId}/tables`, payload),
  bulkCreate: (restaurantId: ApiId, payload: BulkCreateTablesRequest) =>
    http.post<BulkCreateTablesResponse>(`/restaurants/${restaurantId}/tables`, payload),
  getById: (restaurantId: ApiId, tableId: ApiId) =>
    http.get<Table>(`/restaurants/${restaurantId}/tables/${tableId}`),
  update: (restaurantId: ApiId, tableId: ApiId, payload: UpdateTableRequest) =>
    http.put<Table>(`/restaurants/${restaurantId}/tables/${tableId}`, payload),
  delete: (restaurantId: ApiId, tableId: ApiId) =>
    http.delete<void>(`/restaurants/${restaurantId}/tables/${tableId}`),
}
