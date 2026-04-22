import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/authStore'
import { notificationPreferenceService } from '@/services'
import { useToast } from '@/composables/useToast'
import { BaseSpinner, EmptyState } from '@/components/base'
import type { NotificationPreference, UpdateNotificationPreferenceRequest } from '@/types'

type PreferenceToggleField = keyof UpdateNotificationPreferenceRequest

export function useNotificationPreferencesView() {
  const { t } = useI18n()
  const auth = useAuthStore()
  const toast = useToast()

  const prefs = ref<NotificationPreference[]>([])
  const loading = ref(false)
  const savingId = ref<string | null>(null)

  onMounted(() => void load())

  async function load(): Promise<void> {
    if (!auth.user) return
    loading.value = true
    try {
      prefs.value = await notificationPreferenceService.listByUser(auth.user.id)
    } catch {
      toast.show(t('errors.generic'), 'error')
    } finally {
      loading.value = false
    }
  }

  function toPayload(pref: NotificationPreference): UpdateNotificationPreferenceRequest {
    return {
      receivePromotions: pref.receivePromotions,
      receiveOrderUpdates: pref.receiveOrderUpdates,
      receiveReservationReminders: pref.receiveReservationReminders,
    }
  }

  async function updatePref(restaurantId: string, payload: UpdateNotificationPreferenceRequest): Promise<boolean> {
    if (!auth.user) return false
    savingId.value = restaurantId
    try {
      await notificationPreferenceService.updateByRestaurant(auth.user.id, restaurantId, payload)
      toast.show(t('notifications.toast.ok'), 'success')
      return true
    } catch {
      toast.show(t('notifications.toast.error'), 'error')
      return false
    } finally {
      savingId.value = null
    }
  }

  async function togglePref(pref: NotificationPreference, field: PreferenceToggleField): Promise<void> {
    if (savingId.value || !auth.user) return

    const previousValue = pref[field]
    pref[field] = !previousValue

    const success = await updatePref(pref.restaurantId, toPayload(pref))
    if (!success) {
      pref[field] = previousValue
    }
  }

  return {
    t,
    prefs,
    loading,
    savingId,
    togglePref,
    EmptyState,
    BaseSpinner,
  }
}
