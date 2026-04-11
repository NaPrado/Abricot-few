export interface AnalyticsData {
  revenue: number
  occupancy: { label: string; value: number }[]
  peakHours: { label: string; value: number }[]
}
