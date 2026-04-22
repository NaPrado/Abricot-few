import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { businessHoursService } from '@/services'
import { useToast } from '@/composables/useToast'
import { BaseButton, BaseSpinner } from '@/components/base'
import type { BusinessHour, BusinessHourInput } from '@/types'

type HourRow = BusinessHourInput

const DAY_KEYS = [
  'ownerHours.days.d0',
  'ownerHours.days.d1',
  'ownerHours.days.d2',
  'ownerHours.days.d3',
  'ownerHours.days.d4',
  'ownerHours.days.d5',
  'ownerHours.days.d6',
] as const

export function useOwnerBusinessHoursView() {
  const { t } = useI18n()
  const route = useRoute()
  const toast = useToast()

  const restaurantId = () => route.params.restaurantId as string

  const loading = ref(false)
  const saving = ref(false)
  const hours = ref<HourRow[]>([])

  const dayLabels = computed(() => DAY_KEYS.map((key) => t(key)))

  onMounted(() => void load())

  async function load(): Promise<void> {
    const id = restaurantId()
    if (!id) return
    loading.value = true
    try {
      const data: BusinessHour[] = await businessHoursService.getByRestaurant(id)
      const sorted = [...data].sort((a, b) => a.dayOfWeek - b.dayOfWeek)
      hours.value = sorted.map((h) => ({
        dayOfWeek: h.dayOfWeek,
        opensAt: h.opensAt,
        closesAt: h.closesAt,
        isClosed: h.isClosed,
      }))
    } finally {
      loading.value = false
    }
  }

  async function save(): Promise<void> {
    const id = restaurantId()
    if (!id) return
    saving.value = true
    try {
      const payload: BusinessHourInput[] = hours.value.map((h) => ({
        dayOfWeek: h.dayOfWeek,
        opensAt: h.isClosed ? null : (h.opensAt ?? null),
        closesAt: h.isClosed ? null : (h.closesAt ?? null),
        isClosed: h.isClosed,
      }))
      await businessHoursService.updateByRestaurant(id, payload)
      toast.show(t('ownerHours.toast.ok'), 'success')
    } catch {
      toast.show(t('ownerHours.toast.error'), 'error')
    } finally {
      saving.value = false
    }
  }

  return {
    t,
    loading,
    saving,
    hours,
    dayLabels,
    save,
    BaseButton,
    BaseSpinner,
  }
}
