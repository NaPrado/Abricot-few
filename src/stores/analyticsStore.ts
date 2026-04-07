import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AnalyticsData } from '@/types/index'
import { fetchAnalytics } from '@/services/mock/analyticsService'

export const useAnalyticsStore = defineStore('analytics', () => {
  const metrics = ref<AnalyticsData | null>(null)
  const isLoading = ref(false)

  async function loadAnalytics(): Promise<void> {
    isLoading.value = true
    metrics.value = await fetchAnalytics()
    isLoading.value = false
  }

  return { metrics, isLoading, loadAnalytics }
})
