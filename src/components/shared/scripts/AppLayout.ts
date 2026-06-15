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
  /** Which shell to render — driven by the matched route's meta, not by role, so the
   *  admin shell never falls back to the customer header while auth state hydrates. */
  const isAdminLayout = computed(() => route.meta.layout === 'admin')
  const user = computed(() => authStore.user)
  const userInitial = computed(() => user.value?.name?.[0]?.toUpperCase() ?? '?')
  const userName = computed(() => {
    if (!user.value) return 'Usuario'
    return `${user.value.name} ${user.value.surname}`.trim()
  })

  async function loadOwnerRestaurants() {
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
  }

  watch(
    () => route.params.restaurantId as string | undefined,
    (id) => {
      debugSection('app-layout', 'route restaurant param changed', {
        restaurantId: id ?? null,
        path: route.fullPath,
      })
      if (!id) return
      contextStore.setActive(id)
      // The picker list is fetched once on mount; a restaurant created afterwards
      // (RestaurantsView navigates straight to it) is absent. Refresh so the
      // "Local activo" selector lists every restaurant, matching "Mis locales".
      if (ownerRestaurants.value.length > 0 && !ownerRestaurants.value.some(r => r.id === id)) {
        void loadOwnerRestaurants()
      }
    },
    { immediate: true },
  )

  onMounted(loadOwnerRestaurants)

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
      { key: 'tables', label: 'Mesas', to: `${base}/tables`, icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
      { key: 'hours', label: 'Horarios', to: `${base}/hours`, icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9H11V7h1.5v4H15.5z' },
      { key: 'orders', label: 'Pedidos', to: `${base}/orders`, icon: 'M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0' },
      { key: 'menus', label: 'Menú digital', to: `${base}/menus`, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
      { key: 'promotions', label: 'Promociones', to: `${base}/promotions`, icon: 'M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01' },
      { key: 'admins', label: 'Administradores', to: `${base}/admins`, icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2', icon2: 'M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75' },
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
    isAdminLayout,
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
