import { http } from './http'
import type {
  ApiId,
  CreatePromotionRequest,
  PaginationQuery,
  Promotion,
  PromotionListResponse,
} from '@/types'

export const promotionService = {
  /** Admin: all promotions for the restaurant (incl. inactive); requires JWT. */
  listByRestaurant: (restaurantId: ApiId, query?: PaginationQuery) =>
    http.get<PromotionListResponse>(`/restaurants/${restaurantId}/promotions`, { query }),

  create: (restaurantId: ApiId, payload: CreatePromotionRequest) =>
    http.post<Promotion>(`/restaurants/${restaurantId}/promotions`, payload),

  getById: (restaurantId: ApiId, promotionId: ApiId) =>
    http.get<Promotion>(`/restaurants/${restaurantId}/promotions/${promotionId}`),

  /** 204 No Content on success. */
  delete: (restaurantId: ApiId, promotionId: ApiId) =>
    http.delete<void>(`/restaurants/${restaurantId}/promotions/${promotionId}`),
}
