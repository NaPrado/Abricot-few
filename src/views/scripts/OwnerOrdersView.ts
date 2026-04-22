import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { orderService } from '@/services'
import { useToast } from '@/composables/useToast'
import { BaseButton, BaseInput, BaseSelect, BaseSpinner, EmptyState, StatusBadge } from '@/components/base'
import type { Order, OrderStatus } from '@/types'

export function useOwnerOrdersView() {
  const { t } = useI18n()
  const route = useRoute()
  const toast = useToast()

  const restaurantId = computed(() => route.params.restaurantId as string)

  const orders = ref<Order[]>([])
  const loading = ref(false)
  const statusFilter = ref('')

  const selectedOrder = ref<Order | null>(null)
  const showDrawer = ref(false)
  const newStatus = ref<OrderStatus | ''>('')
  const estimatedReady = ref('')
  const saving = ref(false)

  const statusOptions = computed(() => [
    { value: 'PENDING', label: t('ownerOrders.status.PENDING') },
    { value: 'CONFIRMED', label: t('ownerOrders.status.CONFIRMED') },
    { value: 'IN_PREPARATION', label: t('ownerOrders.status.IN_PREPARATION') },
    { value: 'READY', label: t('ownerOrders.status.READY') },
    { value: 'COMPLETED', label: t('ownerOrders.status.COMPLETED') },
    { value: 'CANCELLED', label: t('ownerOrders.status.CANCELLED') },
  ])

  const statusFilterOptions = computed(() => [{ value: '', label: t('common.all') }, ...statusOptions.value])

  onMounted(() => void load())
  watch(statusFilter, () => void load())

  async function load(): Promise<void> {
    if (!restaurantId.value) return
    loading.value = true
    try {
      const query = statusFilter.value ? { status: statusFilter.value as OrderStatus } : undefined
      const res = await orderService.getByRestaurant(restaurantId.value, query)
      orders.value = res.data
    } catch {
      toast.show(t('errors.generic'), 'error')
    } finally {
      loading.value = false
    }
  }

  function openDetail(order: Order): void {
    selectedOrder.value = order
    newStatus.value = order.status
    estimatedReady.value = order.estimatedReadyAt ?? ''
    showDrawer.value = true
  }

  function closeDetail(): void {
    showDrawer.value = false
    selectedOrder.value = null
  }

  async function submitStatusUpdate(): Promise<void> {
    if (!selectedOrder.value || !newStatus.value) return
    saving.value = true
    try {
      await orderService.updateStatus(selectedOrder.value.id, {
        status: newStatus.value,
        estimatedReadyAt: estimatedReady.value || undefined,
      })
      toast.show(t('ownerOrders.toast.statusOk'), 'success')
      closeDetail()
      await load()
    } catch {
      toast.show(t('ownerOrders.toast.error'), 'error')
    } finally {
      saving.value = false
    }
  }

  return {
    t,
    orders,
    loading,
    statusFilter,
    statusFilterOptions,
    statusOptions,
    selectedOrder,
    newStatus,
    estimatedReady,
    openDetail,
    closeDetail,
    submitStatusUpdate,
    StatusBadge,
    BaseButton,
    BaseInput,
    BaseSelect,
    BaseSpinner,
    EmptyState,
  }
}
