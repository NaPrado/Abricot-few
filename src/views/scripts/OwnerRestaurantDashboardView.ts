import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  restaurantService,
  analyticsService,
  reservationService,
  orderService,
} from '@/services'
import { debugError, debugSection } from '@/utils/debug'
import type { Restaurant, MetricsAnalyticsResponse, OrdersAnalyticsResponse, Reservation, Order } from '@/types'

const TODAY = new Date().toISOString().split('T')[0] as string
const SEVEN_DAYS_AGO = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] as string

function settledDebug(result: PromiseSettledResult<unknown>): Record<string, unknown> {
  if (result.status === 'fulfilled') {
    return { status: result.status, value: result.value }
  }

  return { status: result.status, reason: result.reason }
}

export function useOwnerRestaurantDashboardView() {
  const route = useRoute()
  const restaurantId = route.params.restaurantId as string

  const restaurant = ref<Restaurant | null>(null)
  const metrics = ref<MetricsAnalyticsResponse | null>(null)
  const orders = ref<OrdersAnalyticsResponse | null>(null)
  const recentReservations = ref<Reservation[]>([])
  const recentOrders = ref<Order[]>([])
  const loading = ref(true)

  const revenueMax = computed(() => {
    const days = orders.value?.revenueByDay
    if (!days?.length) return 1
    return Math.max(...days.map(d => Number(d.revenue)), 1)
  })

  function formatMoney(n: string | number): string {
    const v = Number(n)
    if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`
    if (v >= 1000) return `$${Math.round(v / 1000)}k`
    return `$${Math.round(v)}`
  }

  function formatTime(iso: string): string {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return '—'
    return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  }

  onMounted(async () => {
    loading.value = true
    debugSection('owner-dashboard', 'loading dashboard', {
      restaurantId,
      start: SEVEN_DAYS_AGO,
      end: TODAY,
    })
    try {
      const [rest, met, ord, reservRes, ordRes] = await Promise.allSettled([
        restaurantService.getById(restaurantId),
        analyticsService.getMetrics(restaurantId, { start: SEVEN_DAYS_AGO, end: TODAY }),
        analyticsService.getOrders(restaurantId, { start: SEVEN_DAYS_AGO, end: TODAY }),
        reservationService.getByRestaurant(restaurantId, { page: 1, perPage: 5 }),
        orderService.getByRestaurant(restaurantId, { page: 1, perPage: 5 }),
      ])
      debugSection('owner-dashboard', 'dashboard requests settled', {
        restaurant: settledDebug(rest),
        metrics: settledDebug(met),
        orders: settledDebug(ord),
        reservations: settledDebug(reservRes),
        recentOrders: settledDebug(ordRes),
      })

      if (rest.status === 'fulfilled') restaurant.value = rest.value
      if (met.status === 'fulfilled') metrics.value = met.value
      if (ord.status === 'fulfilled') orders.value = ord.value
      if (reservRes.status === 'fulfilled') {
        recentReservations.value = Array.isArray(reservRes.value.data) ? reservRes.value.data : []
      }
      if (ordRes.status === 'fulfilled') {
        recentOrders.value = Array.isArray(ordRes.value.data) ? ordRes.value.data : []
      }
    } catch (error) {
      debugError('owner-dashboard', 'unexpected dashboard load failure', {
        error,
        restaurantId,
      })
      // silently degrade — show empty states
    } finally {
      loading.value = false
    }
  })

  return {
    restaurant,
    metrics,
    orders,
    recentReservations,
    recentOrders,
    loading,
    revenueMax,
    formatMoney,
    formatTime,
  }
}
