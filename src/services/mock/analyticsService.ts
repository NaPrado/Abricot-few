import type { AnalyticsData } from '@/types/index'

const MOCK_ANALYTICS: AnalyticsData = {
  revenue: 284500,
  occupancy: [
    { label: 'Lun', value: 62 },
    { label: 'Mar', value: 75 },
    { label: 'Mié', value: 58 },
    { label: 'Jue', value: 80 },
    { label: 'Vie', value: 95 },
    { label: 'Sáb', value: 100 },
    { label: 'Dom', value: 88 },
  ],
  peakHours: [
    { label: '19:00', value: 40 },
    { label: '20:00', value: 72 },
    { label: '21:00', value: 98 },
    { label: '22:00', value: 85 },
    { label: '23:00', value: 55 },
  ],
}

export function fetchAnalytics(): Promise<AnalyticsData> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_ANALYTICS), 800)
  })
}
