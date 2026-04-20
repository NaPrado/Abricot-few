import { http } from './http'
import type {
  AnalyticsQuery,
  ApiId,
  OccupancyAnalyticsResponse,
  OrdersAnalyticsResponse,
  PeakHoursAnalyticsResponse,
  PopularItemsAnalyticsResponse,
  PromotionsAnalyticsResponse,
} from '@/types'

type AnalyticsPeriodQuery = Omit<AnalyticsQuery, 'limit'>

export const analyticsService = {
  getOccupancy: (restaurantId: ApiId, query: AnalyticsPeriodQuery) =>
    http.get<OccupancyAnalyticsResponse>(`/restaurants/${restaurantId}/analytics/occupancy`, { query }),
  getOrders: (restaurantId: ApiId, query: AnalyticsPeriodQuery) =>
    http.get<OrdersAnalyticsResponse>(`/restaurants/${restaurantId}/analytics/orders`, { query }),
  getPopularItems: (restaurantId: ApiId, query: AnalyticsQuery) =>
    http.get<PopularItemsAnalyticsResponse>(`/restaurants/${restaurantId}/analytics/popular-items`, { query }),
  getPromotions: (restaurantId: ApiId, query: AnalyticsPeriodQuery) =>
    http.get<PromotionsAnalyticsResponse>(`/restaurants/${restaurantId}/analytics/promotions`, { query }),
  getPeakHours: (restaurantId: ApiId, query: AnalyticsPeriodQuery) =>
    http.get<PeakHoursAnalyticsResponse>(`/restaurants/${restaurantId}/analytics/peak-hours`, { query }),
}