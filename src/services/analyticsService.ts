import { http } from './http'
import type {
  AnalyticsQuery,
  ApiId,
  MetricsAnalyticsResponse,
  OrdersAnalyticsResponse,
} from '@/types'

type AnalyticsPeriodQuery = AnalyticsQuery

export const analyticsService = {
  getOrders: (restaurantId: ApiId, query: AnalyticsPeriodQuery) =>
    http.get<OrdersAnalyticsResponse>(`/restaurants/${restaurantId}/analytics`, {
      query: { ...query, report: 'orders' },
    }),
  getMetrics: (restaurantId: ApiId, query: AnalyticsPeriodQuery) =>
    http.get<MetricsAnalyticsResponse>(`/restaurants/${restaurantId}/analytics`, {
      query: { ...query, report: 'metrics' },
    }),
}
