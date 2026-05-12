import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { userService } from '@/services'
import { useAuthStore } from '@/stores/authStore'
import { useRestaurantContextStore } from '@/stores/restaurantContextStore'
import { debugError, debugSection } from '@/utils/debug'
import { extractRestaurantList } from '@/utils/restaurantResponses'
import type { Restaurant } from '@/types'

export interface SidebarNavItem {
  key: string
  label: string
  to: string
  icon: string
  icon2?: string
}

/** Suffix after /app/restaurants/:id — e.g. `/stats`, `/menus` — or '' for dashboard. */
function pathSuffixAfterRestaurantId(currentPath: string): string {
  const m = currentPath.match(/^\/app\/restaurants\/[^/]+(\/.*)?$/)
  return m?.[1] ?? ''
}

export function useAppLayout() {
  const authStore = useAuthStore()
  const contextStore = useRestaurantContextStore()
  const route = useRoute()
  const router = useRouter()

  const ownerRestaurants = ref<Restaurant[]>([])
  const ownerRestaurantsLoading = ref(false)

  const isOwner = computed(() => authStore.isOwner)
  const user = computed(() => authStore.user)
  const userInitial = computed(() => user.value?.name?.[0]?.toUpperCase() ?? '?')
  const userName = computed(() => {
    if (!user.value) return 'Usuario'
    return `${user.value.name} ${user.value.surname}`.trim()
  })

  watch(
    () => route.params.restaurantId as string | undefined,
    (id) => {
      debugSection('app-layout', 'route restaurant param changed', {
        restaurantId: id ?? null,
        path: route.fullPath,
      })
      if (id) contextStore.setActive(id)
    },
    { immediate: true },
  )

  onMounted(async () => {
    if (!isOwner.value || !user.value) return
    ownerRestaurantsLoading.value = true
    debugSection('app-layout', 'loading owner restaurants', {
      userId: user.value.id,
      path: route.fullPath,
    })
    try {
      const response = await userService.listRestaurants(user.value.id)
      ownerRestaurants.value = extractRestaurantList(response, 'app-layout')
      debugSection('app-layout', 'owner restaurants loaded', {
        count: ownerRestaurants.value.length,
        response,
      })
    } catch (error) {
      debugError('app-layout', 'failed to load owner restaurants', {
        error,
        userId: user.value.id,
      })
      ownerRestaurants.value = []
    } finally {
      ownerRestaurantsLoading.value = false
    }
  })

  /** Single restaurant context for nav when URL has no :restaurantId (e.g. list view). */
  const navRestaurantId = computed(() => {
    const fromRoute = route.params.restaurantId as string | undefined
    if (fromRoute) return fromRoute
    return contextStore.activeRestaurantId ?? ownerRestaurants.value[0]?.id ?? null
  })

  const ownerNavItems = computed<SidebarNavItem[]>(() => {
    const restaurantListItem: SidebarNavItem = { key: 'restaurants', label: 'Mis locales', to: '/app/restaurants', icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10' }
    const id = navRestaurantId.value

    if (!id) return [restaurantListItem]

    const base = `/app/restaurants/${id}`
    return [
      { key: 'overview', label: 'Dashboard', to: base, icon: 'M3 3h7v7H3zM13 3h7v7h-7zM3 13h7v7H3zM13 13h7v7h-7z' },
      { key: 'analytics', label: 'Analíticas', to: `${base}/stats`, icon: 'M18 20V10M12 20V4M6 20v-6' },
      { key: 'reservations', label: 'Reservas', to: `${base}/reservations`, icon: 'M3 4h18v16H3zM16 2v4M8 2v4M3 10h18' },
      { key: 'orders', label: 'Pedidos', to: `${base}/orders`, icon: 'M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0' },
      { key: 'menus', label: 'Menú digital', to: `${base}/menus`, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
      { key: 'promotions', label: 'Promociones', to: `${base}/promotions`, icon: 'M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01' },
      restaurantListItem,
    ]
  })

  const sidebarSelectValue = computed(() => {
    if (route.path === '/app/restaurants') return ''
    const id = route.params.restaurantId as string | undefined
    return id ?? ''
  })

  function onRestaurantSelect(e: Event) {
    const value = (e.target as HTMLSelectElement).value
    if (value === '') {
      void router.push('/app/restaurants')
      return
    }
    contextStore.setActive(value)
    const suffix = pathSuffixAfterRestaurantId(route.path)
    void router.push(`/app/restaurants/${value}${suffix}`)
  }

  function isNavActive(to: string): boolean {
    if (to === '/app/restaurants') {
      return route.path === '/app/restaurants'
    }
    return route.path.startsWith(to)
  }

  function logout() {
    contextStore.clear()
    authStore.logout()
    void router.push('/login')
  }

  return {
    isOwner,
    user,
    userInitial,
    userName,
    ownerNavItems,
    isNavActive,
    logout,
    currentPath: computed(() => route.path),
    ownerRestaurants,
    ownerRestaurantsLoading,
    sidebarSelectValue,
    onRestaurantSelect,
  }
}
