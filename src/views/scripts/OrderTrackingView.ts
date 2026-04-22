import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { RefreshCw } from 'lucide-vue-next'
import { orderService } from '@/services'
import { useToast } from '@/composables/useToast'
import { BaseButton, BaseSpinner } from '@/components/base'
import type { OrderItemType, OrderType } from '@/types'

export function useOrderTrackingView() {
  const { t } = useI18n()
  const route = useRoute()
  const router = useRouter()
  const toast = useToast()

  const order = ref<OrderType | null>(null)
  const loading = ref(false)
  const showCancelModal = ref(false)

  const statusLabel = computed(() => {
    if (!order.value) return ''
    const key = `orderTracking.status.${order.value.status}` as Parameters<typeof t>[0]
    return t(key)
  })

  const statusClass = computed(() => {
    if (!order.value) return ''
    if (order.value.status === 'READY') return 'order-tracking-view-status-banner--ready'
    if (order.value.status === 'CANCELLED') return 'order-tracking-view-status-banner--cancelled'
    return ''
  })

  onMounted(() => void load())

  async function load(): Promise<void> {
    loading.value = true
    try {
      order.value = await orderService.getById(route.params.orderId as string)
    } catch {
      order.value = null
    } finally {
      loading.value = false
    }
  }

  async function refresh(): Promise<void> {
    await load()
  }

  function openCancel(): void {
    showCancelModal.value = true
  }

  function closeCancel(): void {
    showCancelModal.value = false
  }

  function lineSubtotal(item: OrderItemType): string {
    const unit = Number(item.unitPrice)
    if (!Number.isFinite(unit)) return '0.00'
    return (unit * item.quantity).toFixed(2)
  }

  async function confirmCancel(): Promise<void> {
    if (!order.value) return
    try {
      await orderService.cancel(order.value.id)
      toast.show(t('orderTracking.toast.cancelOk'), 'success')
      closeCancel()
      await router.push('/me/orders')
    } catch {
      toast.show(t('orderTracking.toast.error'), 'error')
    }
  }

  return {
    t,
    order,
    loading,
    showCancelModal,
    openCancel,
    closeCancel,
    confirmCancel,
    refresh,
    statusLabel,
    statusClass,
    lineSubtotal,
    BaseButton,
    BaseSpinner,
    RouterLink,
    RefreshCw,
  }
}
