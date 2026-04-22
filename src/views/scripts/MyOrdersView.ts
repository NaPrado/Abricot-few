import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/authStore'
import { orderService } from '@/services'
import { useToast } from '@/composables/useToast'
import { BaseSelect, BaseSpinner, EmptyState, StatusBadge } from '@/components/base'
import type { OrderStatus, OrderType } from '@/types'

export function useMyOrdersView() {
  const { t } = useI18n()
  const auth = useAuthStore()
  const toast = useToast()

  const orders = ref<OrderType[]>([])
  const loading = ref(false)
  const statusFilter = ref('')

  const statusFilterOptions = computed(() => [
    { value: '', label: t('common.all') },
    { value: 'PENDING', label: t('myOrders.status.PENDING') },
    { value: 'CONFIRMED', label: t('myOrders.status.CONFIRMED') },
    { value: 'IN_PREPARATION', label: t('myOrders.status.IN_PREPARATION') },
    { value: 'READY', label: t('myOrders.status.READY') },
    { value: 'COMPLETED', label: t('myOrders.status.COMPLETED') },
    { value: 'CANCELLED', label: t('myOrders.status.CANCELLED') },
  ])

  onMounted(() => void load())
  watch(statusFilter, () => void load())

  async function load(): Promise<void> {
    if (!auth.user) return
    loading.value = true
    try {
      const query = statusFilter.value ? { status: statusFilter.value as OrderStatus } : undefined
      const res = await orderService.listByUser(auth.user.id, query)
      orders.value = res.data
    } catch {
      toast.show(t('errors.generic'), 'error')
    } finally {
      loading.value = false
    }
  }

  return {
    t,
    orders,
    loading,
    statusFilter,
    statusFilterOptions,
    StatusBadge,
    BaseSelect,
    BaseSpinner,
    EmptyState,
    RouterLink,
  }
}
