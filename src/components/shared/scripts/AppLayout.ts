import { computed } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  BarChart2,
  Bell,
  BookOpen,
  Calendar,
  CalendarCheck,
  ClipboardList,
  Clock,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  ShoppingBag,
  Sparkles,
  Table2,
  Tag,
  User as UserIcon,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/authStore'
import { useRestaurantContextStore } from '@/stores/restaurantContextStore'
import RestaurantSwitcher from '@/components/shared/RestaurantSwitcher.vue'

export function useAppLayout() {
  const { t } = useI18n()
  const auth = useAuthStore()
  const ctx = useRestaurantContextStore()
  const router = useRouter()

  const variant = computed<'customer' | 'owner'>(() =>
    auth.user?.role === 'RESTAURANT_ADMIN' || auth.user?.role === 'SUPER_ADMIN' ? 'owner' : 'customer',
  )

  const ownerBaseLinks = computed(() => [
    { to: '/app/restaurants', label: t('nav.ownerRestaurants'), icon: LayoutGrid },
  ])

  const ownerRestaurantLinks = computed(() => {
    const id = ctx.activeRestaurantId
    if (!id) return []
    return [
      { to: `/app/restaurants/${id}`, label: t('nav.ownerDashboard'), icon: LayoutDashboard },
      { to: `/app/restaurants/${id}/tables`, label: t('nav.ownerTables'), icon: Table2 },
      { to: `/app/restaurants/${id}/hours`, label: t('nav.ownerHours'), icon: Clock },
      { to: `/app/restaurants/${id}/reservations`, label: t('nav.ownerReservations'), icon: CalendarCheck },
      { to: `/app/restaurants/${id}/orders`, label: t('nav.ownerOrders'), icon: ClipboardList },
      { to: `/app/restaurants/${id}/menus`, label: t('nav.ownerMenus'), icon: BookOpen },
      { to: `/app/restaurants/${id}/promotions`, label: t('nav.ownerPromotions'), icon: Tag },
      { to: `/app/restaurants/${id}/stats`, label: t('nav.ownerAnalytics'), icon: BarChart2 },
    ]
  })

  const ownerLinks = computed(() => [...ownerBaseLinks.value, ...ownerRestaurantLinks.value])

  const customerLinks = computed(() => [
    { to: '/explore', label: t('nav.explore'), icon: Sparkles },
    { to: '/me/reservations', label: t('nav.myReservations'), icon: Calendar },
    { to: '/me/orders', label: t('nav.myOrders'), icon: ShoppingBag },
    { to: '/me/profile', label: t('nav.profile'), icon: UserIcon },
    { to: '/me/notifications', label: t('nav.notifications'), icon: Bell },
  ])

  const links = computed(() => (variant.value === 'owner' ? ownerLinks.value : customerLinks.value))

  function onLogout(): void {
    auth.logout()
    ctx.clear()
    router.push('/')
  }

  return {
    RouterLink,
    RouterView,
    LogOut,
    UserIcon,
    RestaurantSwitcher,
    auth,
    variant,
    links,
    onLogout,
  }
}
