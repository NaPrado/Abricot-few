import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { restaurantService, availabilityService, reservationService, menuService } from '@/services'
import { useAuthStore } from '@/stores/authStore'
import type { Restaurant, AvailabilitySlot, MenuDetail } from '@/types'

const TABS = ['Menú', 'Reservar', 'Para llevar'] as const
type Tab = typeof TABS[number]

export function useRestaurantPublicView() {
  const route = useRoute()
  const router = useRouter()
  const authStore = useAuthStore()

  const restaurantId = route.params.restaurantId as string

  const restaurant = ref<Restaurant | null>(null)
  const menu = ref<MenuDetail | null>(null)
  const slots = ref<AvailabilitySlot[]>([])
  const loading = ref(true)

  const activeTab = ref<Tab>('Menú')
  const bookingDate = ref(new Date().toISOString().split('T')[0]!)
  const partySize = ref(2)
  const selectedSlot = ref<string | null>(null)
  const bookingLoading = ref(false)
  const bookingSuccess = ref(false)
  const bookingError = ref('')

  const colorBg = computed(() => {
    if (!restaurant.value) return '#111'
    const colors = ['#1a1208', '#0a0f1a', '#120a08', '#100808', '#080f0a', '#0f0f08']
    const idx = (restaurant.value.id as string).charCodeAt(0) % colors.length
    return colors[idx] ?? '#111'
  })

  const availableSlots = computed(() => slots.value.filter(s => s.isAvailable))

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('es-AR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
  }

  async function loadRestaurant() {
    loading.value = true
    try {
      const [rest, menus] = await Promise.all([
        restaurantService.getById(restaurantId),
        menuService.getByRestaurant(restaurantId),
      ])
      restaurant.value = rest
      if (menus.length > 0) {
        const activeMenu = menus[0]!
        menu.value = await menuService.getById(restaurantId, activeMenu.id)
      }
    } catch {
      void router.push('/')
    } finally {
      loading.value = false
    }
  }

  async function loadSlots() {
    if (!bookingDate.value) return
    try {
      const res = await availabilityService.getByRestaurant(restaurantId, {
        date: bookingDate.value,
        party_size: partySize.value,
      })
      slots.value = res.slots
      selectedSlot.value = null
    } catch {
      slots.value = []
    }
  }

  async function confirmReservation() {
    if (!selectedSlot.value || !authStore.isAuthenticated) {
      if (!authStore.isAuthenticated) void router.push('/login')
      return
    }
    bookingLoading.value = true
    bookingError.value = ''
    try {
      await reservationService.create(restaurantId, {
        date: bookingDate.value,
        timeSlot: selectedSlot.value,
        partySize: partySize.value,
      })
      bookingSuccess.value = true
    } catch {
      bookingError.value = 'No fue posible confirmar la reserva. Intentá de nuevo.'
    } finally {
      bookingLoading.value = false
    }
  }

  function adjustParty(delta: number) {
    const next = partySize.value + delta
    if (next >= 1 && next <= 20) {
      partySize.value = next
      void loadSlots()
    }
  }

  onMounted(async () => {
    await loadRestaurant()
    await loadSlots()
  })

  return {
    restaurant,
    menu,
    loading,
    activeTab,
    bookingDate,
    partySize,
    selectedSlot,
    bookingLoading,
    bookingSuccess,
    bookingError,
    colorBg,
    availableSlots,
    tabs: TABS,
    formatDate,
    loadSlots,
    confirmReservation,
    adjustParty,
  }
}
