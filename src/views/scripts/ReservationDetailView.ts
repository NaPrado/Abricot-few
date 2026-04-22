import { onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { reservationService } from '@/services'
import { useToast } from '@/composables/useToast'
import { BaseInput, BaseButton, BaseSpinner, StatusBadge } from '@/components/base'
import type { ReservationType } from '@/types'

export function useReservationDetailView() {
  const { t } = useI18n()
  const route = useRoute()
  const router = useRouter()
  const toast = useToast()

  const reservation = ref<ReservationType | null>(null)
  const loading = ref(false)
  const showCancelModal = ref(false)
  const cancelReason = ref('')

  onMounted(() => void load())

  async function load(): Promise<void> {
    loading.value = true
    try {
      reservation.value = await reservationService.getById(route.params.id as string)
    } catch {
      reservation.value = null
    } finally {
      loading.value = false
    }
  }

  function openCancel(): void {
    cancelReason.value = ''
    showCancelModal.value = true
  }

  function closeCancel(): void {
    showCancelModal.value = false
    cancelReason.value = ''
  }

  async function confirmCancel(): Promise<void> {
    if (!reservation.value) return
    try {
      await reservationService.cancel(reservation.value.id, { reason: cancelReason.value || undefined })
      toast.show(t('reservationDetail.toast.cancelOk'), 'success')
      closeCancel()
      await router.push('/me/reservations')
    } catch {
      toast.show(t('reservationDetail.toast.error'), 'error')
    }
  }

  return {
    t,
    reservation,
    loading,
    showCancelModal,
    cancelReason,
    openCancel,
    closeCancel,
    confirmCancel,
    StatusBadge,
    BaseInput,
    BaseButton,
    BaseSpinner,
    RouterLink,
  }
}
