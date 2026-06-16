import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { orderService } from '@/services'
import { useAuthStore } from '@/stores/authStore'
import { useRestaurantNames } from '@/composables'
import { HttpError } from '@/services/http'
import type { Order, OrderItem } from '@/types'

/**
 * Resolve the name the backend snapshots onto an order line at creation. The rebuilt
 * backend may emit it under any of these camelCase keys; fall back to the id ONLY when
 * none is present (which would indicate a backend gap, not a frontend one).
 */
function orderItemDisplayName(item: OrderItem): string {
  const snapshot = item.menuItemName ?? item.itemName ?? item.name
  if (typeof snapshot === 'string' && snapshot.trim()) return snapshot.trim()
  return `Ítem ${String(item.menuItemId).slice(0, 8)}`
}

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'READY', 'COMPLETED'] as const
const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  READY: 'Listo para retirar',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
}
const STATUS_STEP_LABEL: Record<string, string> = {
  PENDING: 'Recibimos tu pedido',
  CONFIRMED: 'El restaurante lo confirmó',
  READY: '¡Tu pedido está listo!',
  COMPLETED: 'Pedido entregado',
}
const ACTIVE_STATUSES = new Set(['PENDING', 'CONFIRMED', 'READY'])
const POLL_INTERVAL_MS = 10_000

export function useOrderTrackingView() {
  const route = useRoute()
  const router = useRouter()
  const authStore = useAuthStore()
  const restaurantNames = useRestaurantNames()

  const orderId = route.params.orderId as string

  const order = ref<Order | null>(null)
  const loading = ref(true)
  const error = ref('')

  let pollTimer: ReturnType<typeof setTimeout> | null = null

  const isActive = computed(() =>
    order.value ? ACTIVE_STATUSES.has(order.value.status) : false,
  )

  const statusStepIndex = computed(() => {
    if (!order.value) return -1
    return STATUS_STEPS.indexOf(order.value.status as typeof STATUS_STEPS[number])
  })

  function statusLabel(s: string): string {
    return STATUS_LABEL[s] ?? s
  }

  function stepLabel(step: string): string {
    return STATUS_STEP_LABEL[step] ?? step
  }

  function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString('es-AR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function formatMoney(n: string | number): string {
    return `$${Math.round(Number(n)).toLocaleString('es-AR')}`
  }

  function formatEstimated(iso: string | null | undefined): string {
    if (!iso) return ''
    return new Date(iso).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function restaurantName(): string {
    if (!order.value) return ''
    return order.value.restaurantName ?? restaurantNames.nameFor(order.value.restaurantId)
  }

  async function fetchOrder() {
    if (!authStore.user) return
    try {
      // 1. Look up the order in the user's list to get restaurantId
      const listRes = await orderService.listByUser(authStore.user.id, { page: 1, perPage: 100 })
      const found = listRes.data.find(o => o.id === orderId)
      if (!found) {
        error.value = 'Pedido no encontrado.'
        loading.value = false
        return
      }

      // Hydrate restaurant name
      await restaurantNames.ensure(found.restaurantId)

      // 2. Try to fetch detail (with items) via the restaurant detail endpoint
      try {
        const detail = await orderService.getInRestaurant(found.restaurantId, orderId)
        order.value = {
          ...detail,
          restaurantName: restaurantNames.nameFor(found.restaurantId),
        }
      } catch (detailErr) {
        // Fall back to list data if detail endpoint is restricted
        if (detailErr instanceof HttpError && (detailErr.status === 403 || detailErr.status === 401)) {
          order.value = {
            ...found,
            restaurantName: restaurantNames.nameFor(found.restaurantId),
          }
        } else {
          throw detailErr
        }
      }
    } catch (e) {
      if (e instanceof HttpError && e.status === 401) {
        void router.push('/login')
        return
      }
      error.value = 'No se pudo cargar el pedido. Intentá de nuevo.'
    } finally {
      loading.value = false
    }
  }

  async function refresh() {
    if (!authStore.user || !order.value) return
    try {
      const detail = await orderService.getInRestaurant(order.value.restaurantId, orderId)
      order.value = {
        ...detail,
        restaurantName: restaurantNames.nameFor(order.value.restaurantId),
      }
    } catch (e) {
      if (e instanceof HttpError && (e.status === 403 || e.status === 401)) {
        // Fall back to list
        try {
          const listRes = await orderService.listByUser(authStore.user.id, {
            page: 1,
            perPage: 100,
          })
          const found = listRes.data.find(o => o.id === orderId)
          if (found) {
            order.value = {
              ...found,
              restaurantName: restaurantNames.nameFor(found.restaurantId),
            }
          }
        } catch {
          // ignore refresh errors
        }
      }
    }
  }

  function schedulePoll() {
    if (!isActive.value) return
    pollTimer = setTimeout(async () => {
      await refresh()
      schedulePoll()
    }, POLL_INTERVAL_MS)
  }

  function stopPoll() {
    if (pollTimer) {
      clearTimeout(pollTimer)
      pollTimer = null
    }
  }

  function goBack() {
    void router.push('/me/orders')
  }

  onMounted(async () => {
    if (!authStore.isAuthenticated) {
      void router.push('/login')
      return
    }
    await fetchOrder()
    schedulePoll()
  })

  onUnmounted(() => {
    stopPoll()
  })

  return {
    order,
    loading,
    error,
    isActive,
    statusStepIndex,
    steps: STATUS_STEPS,
    statusLabel,
    stepLabel,
    formatDateTime,
    formatMoney,
    formatEstimated,
    restaurantName,
    itemName: orderItemDisplayName,
    goBack,
  }
}
