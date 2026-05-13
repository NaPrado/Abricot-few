import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { businessHoursService } from '@/services'
import type { BusinessHourRange } from '@/types'

const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] as const

interface DayState {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6
  dayName: string
  isClosed: boolean
  ranges: BusinessHourRange[]
}

function emptyRange(): BusinessHourRange {
  return { opensAt: '', closesAt: '' }
}

function defaultDays(): DayState[] {
  return DAY_NAMES.map((name, i) => ({
    dayOfWeek: i as DayState['dayOfWeek'],
    dayName: name,
    isClosed: true,
    ranges: [],
  }))
}

function toHHMM(value: string): string {
  return value ? value.slice(0, 5) : ''
}

function timeToMinutes(t: string): number {
  const [h = '0', m = '0'] = t.split(':')
  return parseInt(h) * 60 + parseInt(m)
}

function rangesOverlap(a: BusinessHourRange, b: BusinessHourRange): boolean {
  return timeToMinutes(a.closesAt) > timeToMinutes(b.opensAt)
}

function validateDay(day: DayState): string | null {
  if (day.isClosed) return null
  if (day.ranges.length === 0) return `${day.dayName}: agregá al menos un tramo horario`
  for (const r of day.ranges) {
    if (!r.opensAt || !r.closesAt) return `${day.dayName}: completá todos los horarios`
    if (timeToMinutes(r.closesAt) <= timeToMinutes(r.opensAt))
      return `${day.dayName}: el cierre debe ser posterior a la apertura`
  }
  const sorted = [...day.ranges].sort((a, b) => timeToMinutes(a.opensAt) - timeToMinutes(b.opensAt))
  for (let i = 0; i < sorted.length - 1; i++) {
    if (rangesOverlap(sorted[i]!, sorted[i + 1]!))
      return `${day.dayName}: los tramos se superponen`
  }
  return null
}

export function useOwnerBusinessHoursView() {
  const route = useRoute()
  const restaurantId = route.params.restaurantId as string

  const days = ref<DayState[]>(defaultDays())
  const loading = ref(true)
  const saving = ref(false)
  const success = ref(false)
  const loadError = ref('')
  const saveError = ref('')

  const isValid = computed(() => days.value.every(d => validateDay(d) === null))

  function addRange(day: DayState) {
    day.ranges.push(emptyRange())
  }

  function removeRange(day: DayState, index: number) {
    day.ranges.splice(index, 1)
  }

  function toggleDay(day: DayState) {
    day.isClosed = !day.isClosed
    if (!day.isClosed && day.ranges.length === 0) {
      day.ranges.push(emptyRange())
    }
  }

  async function load() {
    loading.value = true
    loadError.value = ''
    try {
      const data = await businessHoursService.getByRestaurant(restaurantId)
      days.value = data.map(d => ({
        dayOfWeek: d.dayOfWeek as DayState['dayOfWeek'],
        dayName: d.dayName ?? DAY_NAMES[d.dayOfWeek] ?? `Día ${d.dayOfWeek}`,
        isClosed: d.isClosed,
        ranges: d.ranges.map(r => ({ opensAt: toHHMM(r.opensAt), closesAt: toHHMM(r.closesAt) })),
      }))
    } catch (e) {
      loadError.value = e instanceof Error ? e.message : 'Error al cargar horarios'
    } finally {
      loading.value = false
    }
  }

  async function save() {
    const firstError = days.value.map(validateDay).find(e => e !== null)
    if (firstError) {
      saveError.value = firstError
      return
    }

    saving.value = true
    success.value = false
    saveError.value = ''
    try {
      const payload = {
        hours: days.value.map(d => ({
          dayOfWeek: d.dayOfWeek,
          isClosed: d.isClosed,
          ...(!d.isClosed && {
            ranges: [...d.ranges]
              .sort((a, b) => timeToMinutes(a.opensAt) - timeToMinutes(b.opensAt))
              .map(r => ({ opensAt: toHHMM(r.opensAt), closesAt: toHHMM(r.closesAt) })),
          }),
        })),
      }

      const data = await businessHoursService.updateByRestaurant(restaurantId, payload)
      days.value = data.map(d => ({
        dayOfWeek: d.dayOfWeek as DayState['dayOfWeek'],
        dayName: d.dayName ?? DAY_NAMES[d.dayOfWeek] ?? `Día ${d.dayOfWeek}`,
        isClosed: d.isClosed,
        ranges: d.ranges.map(r => ({ opensAt: toHHMM(r.opensAt), closesAt: toHHMM(r.closesAt) })),
      }))

      success.value = true
      setTimeout(() => { success.value = false }, 3000)
    } catch (e) {
      saveError.value = e instanceof Error ? e.message : 'Error al guardar horarios'
    } finally {
      saving.value = false
    }
  }

  onMounted(() => void load())

  return { days, loading, saving, success, isValid, loadError, saveError, addRange, removeRange, toggleDay, save }
}
