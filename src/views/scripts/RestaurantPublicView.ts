import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { HttpError } from '@/services/http'
import {
  restaurantService,
  availabilityService,
  reservationService,
  menuService,
  orderService,
} from '@/services'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import { debugError, debugSection, debugWarn } from '@/utils/debug'
import {
  ensureRestaurantLookupCatalogues,
  hydrateRestaurantWithLookups,
} from '@/utils/restaurantHydration'
import type { Restaurant, AvailabilitySlot, MenuDetail, MenuItem, ReviewScore } from '@/types'

const TABS = ['Menú', 'Reservar', 'Para llevar'] as const
type Tab = typeof TABS[number]

export function useRestaurantPublicView() {
  const route = useRoute()
  const router = useRouter()
  const authStore = useAuthStore()
  const cartStore = useCartStore()

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
  const subscriptionRefreshLoading = ref(false)

  const orderLoading = ref(false)
  const orderSuccess = ref(false)
  const orderError = ref('')
  const createdOrderId = ref<string | null>(null)

  const reviewLoading = ref(false)
  const reviewError = ref('')
  const lastSavedReviewScore = ref<ReviewScore | null>(null)

  const STAR_SCORES: ReviewScore[] = [1, 2, 3, 4, 5]

  const colorBg = computed(() => {
    if (!restaurant.value) return '#111'
    const colors = ['#1a1208', '#0a0f1a', '#120a08', '#100808', '#080f0a', '#0f0f08']
    const id = String(restaurant.value.id ?? 'restaurant')
    const idx = id.charCodeAt(0) % colors.length
    return colors[idx] ?? '#111'
  })

  const availableSlots = computed(() => slots.value.filter(s => s.isAvailable))
  const snsSubscriptionStatus = computed(() => authStore.user?.snsSubscriptionStatus ?? null)
  const canReserveWithEmail = computed(() => snsSubscriptionStatus.value === 'CONFIRMED')

  const cart = computed(() => cartStore.items)
  const cartTotal = computed(() => cartStore.total)
  const orderNotes = computed({
    get: () => cartStore.orderNotes,
    set: (v: string) => cartStore.setOrderNotes(v),
  })

  function cartQty(itemId: string): number {
    return cartStore.qty(itemId)
  }

  function addToCart(item: MenuItem) {
    cartStore.ensureRestaurant(restaurantId)
    cartStore.add({
      id: item.id as string,
      name: item.name,
      price: Number(item.price),
    })
  }

  function removeFromCart(itemId: string) {
    cartStore.decrement(itemId)
  }

  function incrementInCart(itemId: string) {
    cartStore.increment(itemId)
  }

  function formatMoney(n: number): string {
    return `$${Math.round(n).toLocaleString('es-AR')}`
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  async function loadRestaurant(): Promise<boolean> {
    loading.value = true
    debugSection('restaurant-public', 'loading restaurant page', { restaurantId })
    try {
      await ensureRestaurantLookupCatalogues()
      const rest = await restaurantService.getById(restaurantId)
      restaurant.value = hydrateRestaurantWithLookups(rest)
    } catch (error) {
      debugError('restaurant-public', 'restaurant detail failed; redirecting home', {
        error,
        restaurantId,
      })
      void router.push('/')
      loading.value = false
      return false
    }

    try {
      menu.value = await menuService.getActiveByRestaurant(restaurantId)
    } catch (error) {
      if (!(error instanceof HttpError && error.status === 404)) {
        debugError('restaurant-public', 'active menu failed; rendering without menu', {
          error,
          restaurantId,
        })
      } else {
        debugWarn('restaurant-public', 'active menu not found', { restaurantId })
      }
      menu.value = null
    } finally {
      loading.value = false
    }

    return true
  }

  async function loadSlots() {
    if (!bookingDate.value) return
    if (!authStore.isAuthenticated) {
      slots.value = []
      selectedSlot.value = null
      return
    }
    try {
      const res = await availabilityService.getByRestaurant(restaurantId, {
        date: bookingDate.value,
        partySize: partySize.value,
      })
      slots.value = res.slots
      selectedSlot.value = null
    } catch {
      slots.value = []
    }
  }

  async function confirmReservation() {
    if (!selectedSlot.value) return
    if (!authStore.isAuthenticated) {
      void router.push('/login')
      return
    }
    if (!canReserveWithEmail.value) {
      bookingError.value = 'Confirmá la suscripción de email de AWS SNS antes de reservar.'
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
    } catch (e) {
      if (e instanceof HttpError && e.status === 403) {
        await authStore.refreshLocalUser().catch(() => null)
        bookingError.value = e.message || 'Confirmá la suscripción de email de AWS SNS antes de reservar.'
        return
      }
      bookingError.value = 'No fue posible confirmar la reserva. Intentá de nuevo.'
    } finally {
      bookingLoading.value = false
    }
  }

  async function refreshEmailSubscription() {
    if (!authStore.isAuthenticated) {
      void router.push('/login')
      return
    }
    subscriptionRefreshLoading.value = true
    bookingError.value = ''
    try {
      await authStore.refreshLocalUser()
    } catch {
      bookingError.value = 'No pudimos verificar la suscripción. Intentá de nuevo.'
    } finally {
      subscriptionRefreshLoading.value = false
    }
  }

  async function submitMyReview(score: ReviewScore) {
    if (!authStore.isAuthenticated || !authStore.user) {
      void router.push('/login')
      return
    }
    reviewLoading.value = true
    reviewError.value = ''
    try {
      await restaurantService.putReview(restaurantId, authStore.user.id, { score })
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
    if (cartStore.items.length === 0) return
    orderLoading.value = true
    orderError.value = ''
    try {
      const order = await orderService.create(restaurantId, {
        items: cartStore.items.map(e => ({
          menuItemId: e.id,
          quantity: e.qty,
          notes: e.notes || null,
        })),
        notes: cartStore.orderNotes || undefined,
      })
      createdOrderId.value = order.id as string
      orderSuccess.value = true
      cartStore.clear()
    } catch (e) {
      if (e instanceof HttpError) {
        if (e.status === 401) {
          void router.push('/login')
          return
        }
        if (e.status === 404) {
          orderError.value = 'El restaurante no tiene menú activo. Intentá más tarde.'
          return
        }
        if (e.status === 400) {
          orderError.value = e.message || 'Pedido inválido. Revisá los ítems seleccionados.'
          return
        }
      }
      orderError.value = 'No fue posible procesar el pedido. Intentá de nuevo.'
    } finally {
      orderLoading.value = false
    }
  }

  function goToOrderTracking() {
    if (createdOrderId.value) {
      void router.push(`/me/orders/${createdOrderId.value}`)
    } else {
      void router.push('/me/orders')
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
    cartStore.ensureRestaurant(restaurantId)
    if (await loadRestaurant()) {
      await loadSlots()
    }
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
    subscriptionRefreshLoading,
    snsSubscriptionStatus,
    canReserveWithEmail,
    cart,
    orderLoading,
    orderSuccess,
    orderError,
    orderNotes,
    cartTotal,
    colorBg,
    availableSlots,
    tabs: TABS,
    formatDate,
    formatMoney,
    loadSlots,
    confirmReservation,
    refreshEmailSubscription,
    adjustParty,
    addToCart,
    removeFromCart,
    incrementInCart,
    cartQty,
    placeOrder,
    goToOrderTracking,
    reviewLoading,
    reviewError,
    lastSavedReviewScore,
    starScores: STAR_SCORES,
    submitMyReview,
  }
}
