import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { HttpError } from '@/services/http'
import { restaurantService, availabilityService, reservationService, menuService, orderService } from '@/services'
import { useAuthStore } from '@/stores/authStore'
import type { Restaurant, AvailabilitySlot, MenuDetail, MenuItem, ReviewScore } from '@/types'

const TABS = ['Menú', 'Reservar', 'Para llevar'] as const
type Tab = typeof TABS[number]

interface CartEntry {
  id: string
  name: string
  price: number
  qty: number
}

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

  const cart = ref<CartEntry[]>([])
  const orderLoading = ref(false)
  const orderSuccess = ref(false)
  const orderError = ref('')

  const reviewLoading = ref(false)
  const reviewError = ref('')
  const lastSavedReviewScore = ref<ReviewScore | null>(null)

  const STAR_SCORES: ReviewScore[] = [1, 2, 3, 4, 5]

  const colorBg = computed(() => {
    if (!restaurant.value) return '#111'
    const colors = ['#1a1208', '#0a0f1a', '#120a08', '#100808', '#080f0a', '#0f0f08']
    const idx = (restaurant.value.id as string).charCodeAt(0) % colors.length
    return colors[idx] ?? '#111'
  })

  const availableSlots = computed(() => slots.value.filter(s => s.isAvailable))

  const cartTotal = computed(() =>
    cart.value.reduce((sum, e) => sum + e.price * e.qty, 0)
  )

  function cartQty(itemId: string): number {
    return cart.value.find(e => e.id === itemId)?.qty ?? 0
  }

  function addToCart(item: MenuItem) {
    const id = item.id as string
    const entry = cart.value.find(e => e.id === id)
    if (entry) {
      entry.qty++
    } else {
      cart.value.push({ id, name: item.name, price: Number(item.price), qty: 1 })
    }
  }

  function removeFromCart(itemId: string) {
    const idx = cart.value.findIndex(e => e.id === itemId)
    if (idx === -1) return
    if (cart.value[idx]!.qty > 1) {
      cart.value[idx]!.qty--
    } else {
      cart.value.splice(idx, 1)
    }
  }

  function incrementInCart(itemId: string) {
    const entry = cart.value.find(e => e.id === itemId)
    if (entry) entry.qty++
  }

  function formatMoney(n: number): string {
    return `$${Math.round(n).toLocaleString('es-AR')}`
  }

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

  async function submitMyReview(score: ReviewScore) {
    if (!authStore.isAuthenticated) {
      void router.push('/login')
      return
    }
    reviewLoading.value = true
    reviewError.value = ''
    try {
      await restaurantService.putMyReview(restaurantId, { score })
      lastSavedReviewScore.value = score
      await loadRestaurant()
    } catch (e) {
      if (e instanceof HttpError && e.status === 401) {
        void router.push('/login')
        return
      }
      reviewError.value = 'No pudimos guardar tu valoración. Intentá de nuevo.'
    } finally {
      reviewLoading.value = false
    }
  }

  async function placeOrder() {
    if (!authStore.isAuthenticated) {
      void router.push('/login')
      return
    }
    if (cart.value.length === 0) return
    orderLoading.value = true
    orderError.value = ''
    try {
      await orderService.create(restaurantId, {
        items: cart.value.map(e => ({ menuItemId: e.id, quantity: e.qty })),
      })
      orderSuccess.value = true
      cart.value = []
    } catch {
      orderError.value = 'No fue posible procesar el pedido. Intentá de nuevo.'
    } finally {
      orderLoading.value = false
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
    cart,
    orderLoading,
    orderSuccess,
    orderError,
    cartTotal,
    colorBg,
    availableSlots,
    tabs: TABS,
    formatDate,
    formatMoney,
    loadSlots,
    confirmReservation,
    adjustParty,
    addToCart,
    removeFromCart,
    incrementInCart,
    cartQty,
    placeOrder,
    reviewLoading,
    reviewError,
    lastSavedReviewScore,
    starScores: STAR_SCORES,
    submitMyReview,
  }
}
