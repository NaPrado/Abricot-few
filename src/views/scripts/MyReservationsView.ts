import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/authStore'
import { reservationService } from '@/services'
import { useToast } from '@/composables/useToast'
import { BaseInput, BaseSelect, BaseButton, BaseSpinner, EmptyState, StatusBadge } from '@/components/base'
import type { ReservationStatus, ReservationType } from '@/types'

export function useMyReservationsView() {
  const { t } = useI18n()
  const auth = useAuthStore()
  const toast = useToast()

  const reservations = ref<ReservationType[]>([])
  const loading = ref(false)
  const statusFilter = ref('')

  const showCancelModal = ref(false)
  const cancelingId = ref<string | null>(null)
  const cancelReason = ref('')

  const statusFilterOptions = computed(() => [
    { value: '', label: t('common.all') },
    { value: 'CONFIRMED', label: t('myReservations.status.CONFIRMED') },
    { value: 'CANCELLED', label: t('myReservations.status.CANCELLED') },
    { value: 'COMPLETED', label: t('myReservations.status.COMPLETED') },
    { value: 'NO_SHOW', label: t('myReservations.status.NO_SHOW') },
  ])

  onMounted(() => void load())
  watch(statusFilter, () => void load())

  async function load(): Promise<void> {
    if (!auth.user) return
    loading.value = true
    try {
      const query = statusFilter.value ? { status: statusFilter.value as ReservationStatus } : undefined
      const res = await reservationService.listByUser(auth.user.id, query)
      reservations.value = res.data
    } catch {
      toast.show(t('errors.generic'), 'error')
    } finally {
      loading.value = false
    }
  }

  function openCancel(id: string): void {
    cancelingId.value = id
    cancelReason.value = ''
    showCancelModal.value = true
  }

  function closeCancel(): void {
    showCancelModal.value = false
    cancelingId.value = null
    cancelReason.value = ''
  }

  async function confirmCancel(): Promise<void> {
    if (!cancelingId.value) return
    try {
      await reservationService.cancel(cancelingId.value, { reason: cancelReason.value || undefined })
      toast.show(t('myReservations.toast.cancelOk'), 'success')
      closeCancel()
      await load()
    } catch {
      toast.show(t('myReservations.toast.error'), 'error')
    }
  }

  return {
    t,
    reservations,
    loading,
    statusFilter,
    cancelingId,
    cancelReason,
    showCancelModal,
    statusFilterOptions,
    openCancel,
    closeCancel,
    confirmCancel,
    StatusBadge,
    BaseSelect,
    BaseInput,
    BaseButton,
    BaseSpinner,
    EmptyState,
    RouterLink,
  }
}
