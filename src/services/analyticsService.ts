import { http } from './http'
import type {
  AnalyticsQuery,
  ApiId,
  DashboardAnalyticsResponse,
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
  /** Snapshot-backed owner dashboard. start/end required. */
  getDashboard: (restaurantId: ApiId, query: AnalyticsPeriodQuery) =>
    http.get<DashboardAnalyticsResponse>(`/restaurants/${restaurantId}/analytics`, {
      query: { ...query, report: 'dashboard' },
    }),
}
