import { http } from './http'
import type {
  ApiId,
  CreatePromotionRequest,
  Promotion,
  PromotionFeedQuery,
  PromotionFeedResponse,
  UpdatePromotionRequest,
} from '@/types'

export const promotionService = {
  getByRestaurant: (restaurantId: ApiId) =>
    http.get<Promotion[]>(`/restaurants/${restaurantId}/promotions/`, { authMode: 'none' }),
  getFeed: (query?: PromotionFeedQuery) =>
    http.get<PromotionFeedResponse>('/promotions/feed', { authMode: 'none', query }),
  create: (restaurantId: ApiId, payload: CreatePromotionRequest) =>
    http.post<Promotion>(`/restaurants/${restaurantId}/promotions/`, payload),
  getById: (restaurantId: ApiId, promotionId: ApiId) =>
    http.get<Promotion>(`/restaurants/${restaurantId}/promotions/${promotionId}`, { authMode: 'none' }),
  update: (restaurantId: ApiId, promotionId: ApiId, payload: UpdatePromotionRequest) =>
    http.put<Promotion>(`/restaurants/${restaurantId}/promotions/${promotionId}`, payload),
  deactivate: (restaurantId: ApiId, promotionId: ApiId) =>
    http.patch<Promotion>(`/restaurants/${restaurantId}/promotions/${promotionId}/deactivate`),
  activate: (restaurantId: ApiId, promotionId: ApiId) =>
    http.patch<Promotion>(`/restaurants/${restaurantId}/promotions/${promotionId}/activate`),
  delete: (restaurantId: ApiId, promotionId: ApiId) =>
    http.delete<void>(`/restaurants/${restaurantId}/promotions/${promotionId}`),
}