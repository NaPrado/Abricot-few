import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { orderService } from '@/services'
import { useAuthStore } from '@/stores/authStore'
import { useRestaurantNames } from '@/composables'
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
const STATUS_ES: Record<string, string> = {
  PENDING: 'Recibimos tu pedido',
  CONFIRMED: 'El restaurante lo confirmó',
  READY: '¡Tu pedido está listo!',
  COMPLETED: 'Pedido entregado',
}
const ACTIVE_STATUSES = new Set(['PENDING', 'CONFIRMED', 'READY'])

export function useMyOrdersView() {
  const authStore = useAuthStore()
  const restaurantNames = useRestaurantNames()
  const router = useRouter()

  const orders = ref<Order[]>([])
  const loading = ref(true)
  const expandedId = ref<string | null>(null)

  function statusLabel(s: string): string {
    return STATUS_LABEL[s] ?? s
  }

  function isActive(s: string): boolean {
    return ACTIVE_STATUSES.has(s)
  }

  function statusStepIndex(s: string): number {
    return STATUS_STEPS.indexOf(s as typeof STATUS_STEPS[number])
  }

  function stepDescription(step: string): string {
    return STATUS_ES[step] ?? step
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
    const v = Number(n)
    return `$${Math.round(v).toLocaleString('es-AR')}`
  }

  function toggle(id: string) {
    expandedId.value = expandedId.value === id ? null : id
  }

  function restaurantNameFor(order: Order): string {
    return order.restaurantName ?? restaurantNames.nameFor(order.restaurantId)
  }

  function viewOrder(orderId: string) {
    void router.push(`/me/orders/${orderId}`)
  }

  onMounted(async () => {
    if (!authStore.user) return
    try {
      const res = await orderService.listByUser(authStore.user.id, { page: 1, perPage: 50 })
      orders.value = res.data
      await restaurantNames.ensureMany(res.data.map(o => o.restaurantId))
    } catch {
      // silently degrade
    } finally {
      loading.value = false
    }
  })

  return {
    orders,
    loading,
    expandedId,
    steps: STATUS_STEPS,
    statusLabel,
    isActive,
    statusStepIndex,
    stepDescription,
    formatDateTime,
    formatMoney,
    toggle,
    restaurantNameFor,
    itemName: orderItemDisplayName,
    viewOrder,
  }
}
