import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  restaurantService,
  analyticsService,
  reservationService,
  orderService,
} from '@/services'
import type { Restaurant, OccupancyAnalyticsResponse, OrdersAnalyticsResponse, Reservation, Order } from '@/types'

const TODAY = new Date().toISOString().split('T')[0] as string
const SEVEN_DAYS_AGO = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] as string

export function useOwnerRestaurantDashboardView() {
  const route = useRoute()
  const restaurantId = route.params.restaurantId as string

  const restaurant = ref<Restaurant | null>(null)
  const occupancy = ref<OccupancyAnalyticsResponse | null>(null)
  const orders = ref<OrdersAnalyticsResponse | null>(null)
  const recentReservations = ref<Reservation[]>([])
  const recentOrders = ref<Order[]>([])
  const loading = ref(true)

  const revenueMax = computed(() => {
    if (!orders.value?.revenueByDay.length) return 1
    return Math.max(...orders.value.revenueByDay.map(d => Number(d.revenue)), 1)
  })

  const occupancyPct = computed(() => {
    if (!occupancy.value?.occupancyByDay.length) return 0
    const avg = occupancy.value.occupancyByDay.reduce((s, d) => s + d.occupancyRate, 0) / occupancy.value.occupancyByDay.length
    return Math.round(avg * 100)
  })

  function formatMoney(n: string | number): string {
    const v = Number(n)
    if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`
    if (v >= 1000) return `$${Math.round(v / 1000)}k`
    return `$${Math.round(v)}`
  }

  function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  }

  onMounted(async () => {
    loading.value = true
    try {
      const [rest, occ, ord, reservRes, ordRes] = await Promise.all([
        restaurantService.getById(restaurantId),
        analyticsService.getOccupancy(restaurantId, { start: SEVEN_DAYS_AGO, end: TODAY }),
        analyticsService.getOrders(restaurantId, { start: SEVEN_DAYS_AGO, end: TODAY }),
        reservationService.getByRestaurant(restaurantId, { page: 1, perPage: 5 }),
        orderService.getByRestaurant(restaurantId, { page: 1, perPage: 5 }),
      ])
      restaurant.value = rest
      occupancy.value = occ
      orders.value = ord
      recentReservations.value = reservRes.data
      recentOrders.value = ordRes.data
    } catch {
      // silently degrade — show empty states
    } finally {
      loading.value = false
    }
  })

  return {
    restaurant,
    occupancy,
    orders,
    recentReservations,
    recentOrders,
    loading,
    revenueMax,
    occupancyPct,
    formatMoney,
    formatTime,
  }
}
