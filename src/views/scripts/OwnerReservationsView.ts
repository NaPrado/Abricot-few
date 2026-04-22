import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Plus } from 'lucide-vue-next'
import { availabilityService, reservationService } from '@/services'
import { useToast } from '@/composables/useToast'
import { BaseButton, BaseInput, BaseSelect, BaseSpinner, EmptyState, StatusBadge } from '@/components/base'
import type {
  Reservation,
  ReservationStatus,
  ReservationSource,
  RestaurantReservationsQuery,
  CreateAdminReservationRequest,
} from '@/types'

interface Filters {
  dateFrom: string
  dateTo: string
  status: string
  source: string
}

interface AdminForm {
  partySize: number | null
  date: string
  timeSlot: string
  source: 'PHONE' | 'EVENT'
  guestName: string
  guestPhone: string
  guestEmail: string
  notes: string
}

export function useOwnerReservationsView() {
  const { t } = useI18n()
  const route = useRoute()
  const toast = useToast()

  const restaurantId = computed(() => route.params.restaurantId as string)

  const reservations = ref<Reservation[]>([])
  const loading = ref(false)
  const saving = ref(false)

  const filters = reactive<Filters>({ dateFrom: '', dateTo: '', status: '', source: '' })

  const cancelTarget = ref<string | null>(null)
  const cancelReason = ref('')

  const showAdminForm = ref(false)
  const adminForm = reactive<AdminForm>({
    partySize: null,
    date: '',
    timeSlot: '',
    source: 'PHONE',
    guestName: '',
    guestPhone: '',
    guestEmail: '',
    notes: '',
  })

  const availableSlots = ref<{ timeSlot: string }[]>([])
  const loadingSlots = ref(false)

  const statusFilterOptions = computed(() => [
    { value: '', label: t('common.all') },
    { value: 'CONFIRMED', label: t('ownerReservations.status.CONFIRMED') },
    { value: 'CANCELLED', label: t('ownerReservations.status.CANCELLED') },
    { value: 'COMPLETED', label: t('ownerReservations.status.COMPLETED') },
    { value: 'NO_SHOW', label: t('ownerReservations.status.NO_SHOW') },
  ])

  const sourceFilterOptions = computed(() => [
    { value: '', label: t('common.all') },
    { value: 'ONLINE', label: t('ownerReservations.source.ONLINE') },
    { value: 'PHONE', label: t('ownerReservations.source.PHONE') },
    { value: 'EVENT', label: t('ownerReservations.source.EVENT') },
  ])

  const adminSourceOptions = computed(() => [
    { value: 'PHONE', label: t('ownerReservations.source.PHONE') },
    { value: 'EVENT', label: t('ownerReservations.source.EVENT') },
  ])

  onMounted(() => void load())
  watch(filters, () => void load(), { deep: true })

  async function load(): Promise<void> {
    if (!restaurantId.value) return
    loading.value = true
    try {
      const query: RestaurantReservationsQuery = {}
      if (filters.dateFrom) query.date_from = filters.dateFrom
      if (filters.dateTo) query.date_to = filters.dateTo
      if (filters.status) query.status = filters.status as ReservationStatus
      if (filters.source) query.source = filters.source as ReservationSource
      const res = await reservationService.getByRestaurant(restaurantId.value, query)
      reservations.value = res.data
    } catch {
      toast.show(t('errors.generic'), 'error')
    } finally {
      loading.value = false
    }
  }

  function openCancel(id: string): void {
    cancelTarget.value = id
    cancelReason.value = ''
  }

  function closeCancel(): void {
    cancelTarget.value = null
    cancelReason.value = ''
  }

  async function confirmCancel(): Promise<void> {
    if (!cancelTarget.value) return
    try {
      await reservationService.cancel(cancelTarget.value, { reason: cancelReason.value || undefined })
      toast.show(t('ownerReservations.toast.cancelOk'), 'success')
      closeCancel()
      await load()
    } catch {
      toast.show(t('ownerReservations.toast.error'), 'error')
    }
  }

  async function confirmComplete(id: string): Promise<void> {
    if (!confirm(t('ownerReservations.completeConfirm'))) return
    try {
      await reservationService.complete(id)
      toast.show(t('ownerReservations.toast.completeOk'), 'success')
      await load()
    } catch {
      toast.show(t('ownerReservations.toast.error'), 'error')
    }
  }

  async function confirmNoShow(id: string): Promise<void> {
    if (!confirm(t('ownerReservations.noShowConfirm'))) return
    try {
      await reservationService.noShow(id)
      toast.show(t('ownerReservations.toast.noShowOk'), 'success')
      await load()
    } catch {
      toast.show(t('ownerReservations.toast.error'), 'error')
    }
  }

  function openAdminForm(): void {
    adminForm.partySize = null
    adminForm.date = ''
    adminForm.timeSlot = ''
    adminForm.source = 'PHONE'
    adminForm.guestName = ''
    adminForm.guestPhone = ''
    adminForm.guestEmail = ''
    adminForm.notes = ''
    availableSlots.value = []
    showAdminForm.value = true
  }

  function closeAdminForm(): void {
    showAdminForm.value = false
  }

  async function checkSlots(): Promise<void> {
    if (!restaurantId.value || !adminForm.date || !adminForm.partySize) {
      toast.show(t('errors.generic'), 'error')
      return
    }
    loadingSlots.value = true
    availableSlots.value = []
    try {
      const res = await availabilityService.getByRestaurant(restaurantId.value, {
        date: adminForm.date,
        party_size: adminForm.partySize,
      })
      availableSlots.value = res.slots.filter((s) => s.isAvailable).map((s) => ({ timeSlot: s.timeSlot }))
    } catch {
      toast.show(t('errors.generic'), 'error')
    } finally {
      loadingSlots.value = false
    }
  }

  async function createAdminReservation(): Promise<void> {
    if (!restaurantId.value || !adminForm.partySize || !adminForm.date || !adminForm.timeSlot) return
    if (!adminForm.guestName.trim()) {
      toast.show(t('errors.generic'), 'error')
      return
    }
    saving.value = true
    try {
      const payload: CreateAdminReservationRequest = {
        partySize: adminForm.partySize,
        date: adminForm.date,
        timeSlot: adminForm.timeSlot,
        source: adminForm.source,
        guestName: adminForm.guestName.trim(),
        guestPhone: adminForm.guestPhone.trim() || undefined,
        guestEmail: adminForm.guestEmail.trim() || undefined,
        notes: adminForm.notes.trim() || undefined,
      }
      await reservationService.createAdmin(restaurantId.value, payload)
      toast.show(t('ownerReservations.toast.createOk'), 'success')
      closeAdminForm()
      await load()
    } catch {
      toast.show(t('ownerReservations.toast.error'), 'error')
    } finally {
      saving.value = false
    }
  }

  return {
    t,
    reservations,
    loading,
    filters,
    statusFilterOptions,
    sourceFilterOptions,
    adminSourceOptions,
    showAdminForm,
    adminForm,
    availableSlots,
    loadingSlots,
    cancelTarget,
    cancelReason,
    openAdminForm,
    closeAdminForm,
    checkSlots,
    createAdminReservation,
    openCancel,
    closeCancel,
    confirmCancel,
    confirmComplete,
    confirmNoShow,
    StatusBadge,
    BaseInput,
    BaseSelect,
    BaseButton,
    BaseSpinner,
    EmptyState,
    Plus,
  }
}
