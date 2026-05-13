import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { reservationService } from '@/services'
import { useAuthStore } from '@/stores/authStore'
import { useRestaurantNames } from '@/composables'
import type { Reservation } from '@/types'

const STATUS_LABEL: Record<string, string> = {
  CONFIRMED: 'Confirmada',
  CANCELLED: 'Cancelada',
  COMPLETED: 'Completada',
  NO_SHOW: 'No asistió',
}

export function useMyReservationsView() {
  const authStore = useAuthStore()
  const router = useRouter()
  const restaurantNames = useRestaurantNames()

  const reservations = ref<Reservation[]>([])
  const loading = ref(true)
  const selected = ref<Reservation | null>(null)

  function statusLabel(s: string): string {
    return STATUS_LABEL[s] ?? s
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('es-AR', {
      weekday: 'long', day: 'numeric', month: 'long',
    })
  }

  function formatTime(t: string): string {
    return t.slice(0, 5)
  }

  function colorBg(id: string): string {
    const colors = ['#1a1208', '#0a0f1a', '#120a08', '#100808', '#080f0a', '#0f0f08']
    const idx = id.charCodeAt(0) % colors.length
    return colors[idx] ?? '#111'
  }

  function restaurantNameFor(reservation: Reservation): string {
    return reservation.restaurantName ?? restaurantNames.nameFor(reservation.restaurantId)
  }

  async function cancelReservation(id: string) {
    try {
      await reservationService.cancel(id)
      reservations.value = reservations.value.map(r =>
        r.id === id ? { ...r, status: 'CANCELLED' } : r,
      )
      if (selected.value?.id === id) selected.value = { ...selected.value, status: 'CANCELLED' }
    } catch {
      // silently fail — user can retry
    }
  }

  function navigateToRestaurant(restaurantId: string) {
    void router.push(`/restaurants/${restaurantId}`)
  }

  onMounted(async () => {
    if (!authStore.user) return
    try {
      const res = await reservationService.listByUser(authStore.user.id, { page: 1, perPage: 50 })
      reservations.value = res.data
      await restaurantNames.ensureMany(res.data.map(r => r.restaurantId))
    } catch {
      // silently degrade
    } finally {
      loading.value = false
    }
  })

  return {
    reservations,
    loading,
    selected,
    statusLabel,
    formatDate,
    formatTime,
    colorBg,
    cancelReservation,
    navigateToRestaurant,
    restaurantNameFor,
  }
}
