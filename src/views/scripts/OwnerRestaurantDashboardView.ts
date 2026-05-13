import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { HttpError } from '@/services/http'
import {
  restaurantService,
  analyticsService,
  reservationService,
  orderService,
} from '@/services'
import { useToast } from '@/composables'
import { useRestaurantContextStore } from '@/stores/restaurantContextStore'
import { debugError, debugSection } from '@/utils/debug'
import {
  ensureRestaurantLookupCatalogues,
  hydrateRestaurantWithLookups,
} from '@/utils/restaurantHydration'
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
  const router = useRouter()
  const restaurantId = route.params.restaurantId as string
  const toast = useToast()
  const contextStore = useRestaurantContextStore()

  const restaurant = ref<Restaurant | null>(null)
  const metrics = ref<MetricsAnalyticsResponse | null>(null)
  const orders = ref<OrdersAnalyticsResponse | null>(null)
  const recentReservations = ref<Reservation[]>([])
  const recentOrders = ref<Order[]>([])
  const loading = ref(true)
  const widgetCopied = ref(false)
  const photoUploading = ref(false)
  const deleteSubmitting = ref(false)

  const widgetUrl = computed(() => `${window.location.origin}/widgets/reservas/${restaurantId}`)
  const widgetIframeSnippet = computed(() => (
    `<iframe src="${widgetUrl.value}" width="100%" height="640" style="border:0;border-radius:8px" loading="lazy"></iframe>`
  ))

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

  async function copyWidgetSnippet(): Promise<void> {
    try {
      await navigator.clipboard.writeText(widgetIframeSnippet.value)
      widgetCopied.value = true
      window.setTimeout(() => {
        widgetCopied.value = false
      }, 2000)
    } catch {
      widgetCopied.value = false
    }
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

      if (rest.status === 'fulfilled') {
        await ensureRestaurantLookupCatalogues().catch(() => undefined)
        restaurant.value = hydrateRestaurantWithLookups(rest.value)
      }
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

  async function uploadPhoto(event: Event) {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    target.value = ''
    if (!file) return

    photoUploading.value = true
    try {
      const updated = await restaurantService.uploadPhoto(restaurantId, file)
      restaurant.value = hydrateRestaurantWithLookups(updated)
      toast.show('Foto actualizada.', 'success')
    } catch (e) {
      if (e instanceof HttpError && e.status === 413) {
        toast.show('La imagen es demasiado grande.', 'error')
      } else if (e instanceof HttpError && e.status === 415) {
        toast.show('Formato de imagen no soportado.', 'error')
      } else {
        toast.show('No pudimos subir la foto.', 'error')
      }
    } finally {
      photoUploading.value = false
    }
  }

  async function deleteRestaurant() {
    if (!window.confirm('¿Eliminar este restaurante? Esta acción es irreversible.')) return
    deleteSubmitting.value = true
    try {
      await restaurantService.delete(restaurantId)
      contextStore.clear()
      toast.show('Restaurante eliminado.', 'success')
      void router.push('/app/restaurants')
    } catch (e) {
      if (e instanceof HttpError && e.status === 409) {
        toast.show('No se puede eliminar: hay reservas u órdenes activas.', 'error')
        return
      }
      if (e instanceof HttpError && (e.status === 401 || e.status === 403)) {
        toast.show('No tenés permisos para eliminar este restaurante.', 'error')
        return
      }
      toast.show('No pudimos eliminar el restaurante.', 'error')
    } finally {
      deleteSubmitting.value = false
    }
  }

  return {
    restaurant,
    metrics,
    orders,
    recentReservations,
    recentOrders,
    loading,
    widgetCopied,
    widgetUrl,
    widgetIframeSnippet,
    revenueMax,
    formatMoney,
    formatTime,
    copyWidgetSnippet,
    photoUploading,
    deleteSubmitting,
    uploadPhoto,
    deleteRestaurant,
  }
}
