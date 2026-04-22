import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { BaseButton, BaseSpinner, EmptyState, StatusBadge } from '@/components/base'
import {
  availabilityService,
  businessHoursService,
  menuService,
  promotionService,
  restaurantService,
} from '@/services'
import type {
  AvailabilityResponse,
  BusinessHour,
  Menu,
  MenuCategoryWithItems,
  Promotion,
  Restaurant,
} from '@/types'

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

export function useRestaurantPublicView() {
  const { t } = useI18n()
  const route = useRoute()

  const restaurant = ref<Restaurant | null>(null)
  const loadingRestaurant = ref(true)
  const restaurantError = ref<string | null>(null)

  const menus = ref<Menu[]>([])
  const activeMenuId = ref('')
  const menuCategories = ref<MenuCategoryWithItems[]>([])
  const loadingMenu = ref(false)
  const menuError = ref<string | null>(null)

  const promotions = ref<Promotion[]>([])
  const loadingPromotions = ref(false)
  const promotionsError = ref<string | null>(null)

  const businessHours = ref<BusinessHour[]>([])
  const loadingBusinessHours = ref(false)
  const businessHoursError = ref<string | null>(null)

  const visitDate = ref(todayIsoDate())
  const partySize = ref(2)
  const availability = ref<AvailabilityResponse | null>(null)
  const loadingAvailability = ref(false)
  const availabilityError = ref<string | null>(null)

  const restaurantId = computed(() => {
    const param = route.params.restaurantId
    return Array.isArray(param) ? (param[0] ?? '') : String(param ?? '')
  })

  const sortedBusinessHours = computed(() =>
    [...businessHours.value].sort((a, b) => a.dayOfWeek - b.dayOfWeek),
  )

  const visiblePromotions = computed(() => {
    const active = promotions.value.filter((promotion) => promotion.isActive)
    return active.length > 0 ? active : promotions.value
  })

  const availableSlots = computed(() =>
    availability.value?.slots.filter((slot) => slot.isAvailable) ?? [],
  )

  const availabilitySummary = computed(() => {
    if (!availability.value) return ''
    return availableSlots.value.length > 0
      ? t('restaurantPublic.slotsFound', { count: availableSlots.value.length })
      : t('restaurantPublic.noSlots')
  })

  function formatCurrency(amount: string): string {
    const numeric = Number.parseFloat(amount)
    if (Number.isNaN(numeric)) return amount
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(numeric)
  }

  function formatTime(timeValue: string | null): string {
    if (!timeValue) return '--:--'
    return timeValue.slice(0, 5)
  }

  function formatDate(dateValue: string): string {
    const parsed = new Date(dateValue)
    if (Number.isNaN(parsed.getTime())) return dateValue
    return parsed.toLocaleDateString('es-AR')
  }

  function businessHourLabel(hour: BusinessHour): string {
    if (hour.isClosed) return t('restaurantPublic.closed')
    if (!hour.opensAt || !hour.closesAt) return t('restaurantPublic.notConfigured')
    return `${formatTime(hour.opensAt)} - ${formatTime(hour.closesAt)}`
  }

  function promotionDiscountLabel(promotion: Promotion): string {
    if (promotion.discountType === 'PERCENTAGE') {
      return `${promotion.discountValue}%`
    }
    if (promotion.discountType === 'FIXED_AMOUNT') {
      return formatCurrency(promotion.discountValue)
    }
    return t('restaurantPublic.freeItem')
  }

  async function loadMenuDetail(menuId: string): Promise<void> {
    if (!restaurant.value) return
    loadingMenu.value = true
    menuError.value = null
    try {
      const detail = await menuService.getById(restaurant.value.id, menuId)
      menuCategories.value = detail.categories
      activeMenuId.value = menuId
    } catch {
      menuCategories.value = []
      menuError.value = t('restaurantPublic.sectionError')
    } finally {
      loadingMenu.value = false
    }
  }

  async function loadMenus(): Promise<void> {
    if (!restaurant.value) return
    loadingMenu.value = true
    menuError.value = null
    try {
      menus.value = await menuService.getByRestaurant(restaurant.value.id)
      if (menus.value.length === 0) {
        activeMenuId.value = ''
        menuCategories.value = []
        loadingMenu.value = false
        return
      }
      const selectedMenu = menus.value.find((menu) => menu.isActive) ?? menus.value.at(0)
      if (!selectedMenu) {
        activeMenuId.value = ''
        menuCategories.value = []
        loadingMenu.value = false
        return
      }
      await loadMenuDetail(selectedMenu.id)
    } catch {
      menus.value = []
      activeMenuId.value = ''
      menuCategories.value = []
      menuError.value = t('restaurantPublic.sectionError')
      loadingMenu.value = false
    }
  }

  async function loadPromotions(): Promise<void> {
    if (!restaurant.value) return
    loadingPromotions.value = true
    promotionsError.value = null
    try {
      promotions.value = await promotionService.getByRestaurant(restaurant.value.id)
    } catch {
      promotions.value = []
      promotionsError.value = t('restaurantPublic.sectionError')
    } finally {
      loadingPromotions.value = false
    }
  }

  async function loadBusinessHours(): Promise<void> {
    if (!restaurant.value) return
    loadingBusinessHours.value = true
    businessHoursError.value = null
    try {
      businessHours.value = await businessHoursService.getByRestaurant(restaurant.value.id)
    } catch {
      businessHours.value = []
      businessHoursError.value = t('restaurantPublic.sectionError')
    } finally {
      loadingBusinessHours.value = false
    }
  }

  async function checkAvailability(): Promise<void> {
    if (!restaurant.value) return

    if (visitDate.value === '') {
      availability.value = null
      availabilityError.value = t('restaurantPublic.selectDate')
      return
    }

    const normalizedPartySize = Number.isFinite(partySize.value)
      ? Math.max(1, Math.trunc(partySize.value))
      : 1
    partySize.value = normalizedPartySize

    loadingAvailability.value = true
    availabilityError.value = null
    try {
      availability.value = await availabilityService.getByRestaurant(restaurant.value.id, {
        date: visitDate.value,
        party_size: normalizedPartySize,
      })
    } catch {
      availability.value = null
      availabilityError.value = t('restaurantPublic.availabilityError')
    } finally {
      loadingAvailability.value = false
    }
  }

  async function loadRestaurant(): Promise<void> {
    loadingRestaurant.value = true
    restaurantError.value = null
    restaurant.value = null

    if (restaurantId.value === '') {
      loadingRestaurant.value = false
      restaurantError.value = t('restaurantPublic.errorLoad')
      return
    }

    try {
      restaurant.value = await restaurantService.getById(restaurantId.value)
      await Promise.allSettled([
        loadMenus(),
        loadPromotions(),
        loadBusinessHours(),
      ])
      await checkAvailability()
    } catch {
      restaurantError.value = t('restaurantPublic.errorLoad')
    } finally {
      loadingRestaurant.value = false
    }
  }

  function selectMenu(menuId: string): void {
    if (menuId === activeMenuId.value) return
    void loadMenuDetail(menuId)
  }

  onMounted(() => {
    void loadRestaurant()
  })

  return {
    BaseButton,
    BaseSpinner,
    EmptyState,
    RouterLink,
    StatusBadge,
    t,
    restaurant,
    loadingRestaurant,
    restaurantError,
    menus,
    activeMenuId,
    menuCategories,
    loadingMenu,
    menuError,
    promotions,
    visiblePromotions,
    loadingPromotions,
    promotionsError,
    sortedBusinessHours,
    loadingBusinessHours,
    businessHoursError,
    visitDate,
    partySize,
    availability,
    availableSlots,
    availabilitySummary,
    loadingAvailability,
    availabilityError,
    formatCurrency,
    formatDate,
    formatTime,
    businessHourLabel,
    promotionDiscountLabel,
    loadRestaurant,
    loadMenus,
    loadPromotions,
    loadBusinessHours,
    checkAvailability,
    selectMenu,
  }
}
