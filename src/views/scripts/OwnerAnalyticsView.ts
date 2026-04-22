import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { analyticsService } from '@/services'
import { useToast } from '@/composables/useToast'
import { BaseButton, BaseInput, BaseSpinner } from '@/components/base'
import type {
  OccupancyAnalyticsResponse,
  OrdersAnalyticsResponse,
  PopularItemsAnalyticsResponse,
  PromotionsAnalyticsResponse,
  PeakHoursAnalyticsResponse,
} from '@/types'

export function useOwnerAnalyticsView() {
  const { t } = useI18n()
  const route = useRoute()
  const toast = useToast()

  const restaurantId = computed(() => route.params.restaurantId as string)

  const loading = ref(false)

  const defaultEnd = new Date().toISOString().split('T')[0]
  const defaultStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const dateFrom = ref(defaultStart)
  const dateTo = ref(defaultEnd)

  const occupancy = ref<OccupancyAnalyticsResponse | null>(null)
  const orders = ref<OrdersAnalyticsResponse | null>(null)
  const popularItems = ref<PopularItemsAnalyticsResponse | null>(null)
  const promotions = ref<PromotionsAnalyticsResponse | null>(null)
  const peakHours = ref<PeakHoursAnalyticsResponse | null>(null)

  async function load(): Promise<void> {
    if (!restaurantId.value || !dateFrom.value || !dateTo.value) return
    loading.value = true
    const query = { start: dateFrom.value, end: dateTo.value }
    const [occRes, ordRes, popRes, promoRes, peakRes] = await Promise.allSettled([
      analyticsService.getOccupancy(restaurantId.value, query),
      analyticsService.getOrders(restaurantId.value, query),
      analyticsService.getPopularItems(restaurantId.value, { ...query, limit: 10 }),
      analyticsService.getPromotions(restaurantId.value, query),
      analyticsService.getPeakHours(restaurantId.value, query),
    ])
    if (occRes.status === 'fulfilled') occupancy.value = occRes.value
    else toast.show(t('errors.generic'), 'error')
    if (ordRes.status === 'fulfilled') orders.value = ordRes.value
    if (popRes.status === 'fulfilled') popularItems.value = popRes.value
    if (promoRes.status === 'fulfilled') promotions.value = promoRes.value
    if (peakRes.status === 'fulfilled') peakHours.value = peakRes.value
    loading.value = false
  }

  return {
    t,
    loading,
    dateFrom,
    dateTo,
    occupancy,
    orders,
    popularItems,
    promotions,
    peakHours,
    loadAnalytics: load,
    BaseButton,
    BaseInput,
    BaseSpinner,
  }
}
