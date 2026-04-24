import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

export interface SidebarNavItem {
  key: string
  label: string
  to: string
  icon: string
  icon2?: string
}

export function useAppLayout() {
  const authStore = useAuthStore()
  const route = useRoute()
  const router = useRouter()

  const isOwner = computed(() => authStore.isOwner)
  const user = computed(() => authStore.user)
  const userInitial = computed(() => user.value?.name?.[0]?.toUpperCase() ?? '?')
  const userName = computed(() => {
    if (!user.value) return 'Usuario'
    return `${user.value.name} ${user.value.surname}`.trim()
  })

  const restaurantId = computed(() => route.params.restaurantId as string | undefined)

  const ownerNavItems = computed<SidebarNavItem[]>(() => {
    const base = restaurantId.value
      ? `/app/restaurants/${restaurantId.value}`
      : '/app/restaurants'
    return [
      { key: 'overview',    label: 'Dashboard',     to: base,                    icon: 'M3 3h7v7H3zM13 3h7v7h-7zM3 13h7v7H3zM13 13h7v7h-7z' },
      { key: 'analytics',   label: 'Analíticas',    to: `${base}/stats`,         icon: 'M18 20V10M12 20V4M6 20v-6' },
      { key: 'reservations',label: 'Reservas',      to: `${base}/reservations`,  icon: 'M3 4h18v16H3zM16 2v4M8 2v4M3 10h18' },
      { key: 'orders',      label: 'Pedidos',       to: `${base}/orders`,        icon: 'M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0' },
      { key: 'menus',       label: 'Menú digital',  to: `${base}/menus`,         icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
      { key: 'promotions',  label: 'Promociones',   to: `${base}/promotions`,    icon: 'M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01' },
      { key: 'restaurants', label: 'Mis locales',   to: '/app/restaurants',      icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10' },
    ]
  })

  function isNavActive(to: string): boolean {
    if (to === '/app/restaurants') {
      return route.path === '/app/restaurants'
    }
    return route.path.startsWith(to)
  }

  function logout() {
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
  }
}
