import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  Table2,
  Clock,
  CalendarCheck,
  ClipboardList,
  BookOpen,
  Tag,
  BarChart2,
} from 'lucide-vue-next'
import {
  tableService,
  reservationService,
  orderService,
  menuService,
} from '@/services'
import { BaseSpinner } from '@/components/base'
import type { Table, Reservation, Order, Menu } from '@/types'

export function useOwnerRestaurantDashboardView() {
  const { t } = useI18n()
  const route = useRoute()

  const restaurantId = computed(() => route.params.restaurantId as string)

  const tables = ref<Table[]>([])
  const reservationsToday = ref<Reservation[]>([])
  const ordersPending = ref<Order[]>([])
  const menus = ref<Menu[]>([])
  const loading = ref(false)

  const stats = computed(() => ({
    tables: tables.value.length,
    reservationsToday: reservationsToday.value.length,
    ordersPending: ordersPending.value.length,
    menusActive: menus.value.filter((m) => m.isActive).length,
  }))

  const quickLinks = computed(() => {
    const id = restaurantId.value
    return [
      { to: `/app/restaurants/${id}/tables`, label: t('nav.ownerTables'), icon: Table2 },
      { to: `/app/restaurants/${id}/hours`, label: t('nav.ownerHours'), icon: Clock },
      { to: `/app/restaurants/${id}/reservations`, label: t('nav.ownerReservations'), icon: CalendarCheck },
      { to: `/app/restaurants/${id}/orders`, label: t('nav.ownerOrders'), icon: ClipboardList },
      { to: `/app/restaurants/${id}/menus`, label: t('nav.ownerMenus'), icon: BookOpen },
      { to: `/app/restaurants/${id}/promotions`, label: t('nav.ownerPromotions'), icon: Tag },
      { to: `/app/restaurants/${id}/stats`, label: t('nav.ownerAnalytics'), icon: BarChart2 },
    ]
  })

  onMounted(() => void load())

  async function load(): Promise<void> {
    if (!restaurantId.value) return
    loading.value = true
    const today = new Date().toISOString().split('T')[0]
    const [tablesRes, reservationsRes, ordersRes, menusRes] = await Promise.allSettled([
      tableService.getByRestaurant(restaurantId.value),
      reservationService.getByRestaurant(restaurantId.value, { date_from: today, date_to: today }),
      orderService.getByRestaurant(restaurantId.value, { status: 'PENDING' }),
      menuService.getByRestaurant(restaurantId.value),
    ])
    if (tablesRes.status === 'fulfilled') tables.value = tablesRes.value
    if (reservationsRes.status === 'fulfilled') reservationsToday.value = reservationsRes.value.data
    if (ordersRes.status === 'fulfilled') ordersPending.value = ordersRes.value.data
    if (menusRes.status === 'fulfilled') menus.value = menusRes.value
    loading.value = false
  }

  return {
    t,
    loading,
    restaurantId,
    stats,
    quickLinks,
    BaseSpinner,
    RouterLink,
  }
}
