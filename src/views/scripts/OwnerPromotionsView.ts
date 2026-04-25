import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { menuService, promotionService } from '@/services'
import type { ApiId, CreatePromotionRequest, DiscountType, Promotion } from '@/types'

const DISCOUNT_TYPES: DiscountType[] = ['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_ITEM']

interface MenuPickItem {
  id: string
  name: string
}

export function useOwnerPromotionsView() {
  const route = useRoute()
  const restaurantId = route.params.restaurantId as string

  const promotions = ref<Promotion[]>([])
  const loading = ref(true)
  const menuPickItems = ref<MenuPickItem[]>([])
  const menuPickLoading = ref(false)

  const showForm = ref(false)
  const formSubmitting = ref(false)
  const formError = ref('')

  const formTitle = ref('')
  const formDescription = ref('')
  const formDiscountType = ref<DiscountType>('PERCENTAGE')
  const formDiscountValue = ref('10.00')
  const formStartDate = ref('')
  const formEndDate = ref('')
  const formNotifyUsers = ref(false)
  const formSelectedItemIds = ref<Set<string>>(new Set())

  const discountTypeLabels: Record<DiscountType, string> = {
    PERCENTAGE: 'Porcentaje',
    FIXED_AMOUNT: 'Monto fijo',
    FREE_ITEM: 'Ítem gratis',
  }

  function discountDisplay(p: Promotion): string {
    if (p.discountType === 'PERCENTAGE') return `${p.discountValue}% dto.`
    if (p.discountType === 'FREE_ITEM') return 'Ítem gratis'
    return `$${Math.round(Number(p.discountValue)).toLocaleString('es-AR')} dto.`
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
  }

  function toggleMenuItem(id: string) {
    const next = new Set(formSelectedItemIds.value)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    formSelectedItemIds.value = next
  }

  function isMenuItemSelected(id: string): boolean {
    return formSelectedItemIds.value.has(id)
  }

  function resetForm() {
    formTitle.value = ''
    formDescription.value = ''
    formDiscountType.value = 'PERCENTAGE'
    formDiscountValue.value = '10.00'
    formStartDate.value = ''
    formEndDate.value = ''
    formNotifyUsers.value = false
    formSelectedItemIds.value = new Set()
    formError.value = ''
  }

  async function loadPromotions() {
    loading.value = true
    try {
      const res = await promotionService.listByRestaurant(restaurantId, { page: 1, perPage: 100 })
      promotions.value = res.data
    } catch {
      promotions.value = []
    } finally {
      loading.value = false
    }
  }

  async function loadMenuItemsForPicker() {
    menuPickLoading.value = true
    try {
      const menus = await menuService.getByRestaurant(restaurantId)
      const items: MenuPickItem[] = []
      for (const m of menus) {
        const detail = await menuService.getById(restaurantId, m.id)
        for (const cat of detail.categories) {
          for (const it of cat.items) {
            items.push({ id: it.id as string, name: it.name })
          }
        }
      }
      menuPickItems.value = items
    } catch {
      menuPickItems.value = []
    } finally {
      menuPickLoading.value = false
    }
  }

  async function submitCreate() {
    formError.value = ''
    const title = formTitle.value.trim()
    if (!title) {
      formError.value = 'El título es obligatorio.'
      return
    }
    if (!formStartDate.value || !formEndDate.value) {
      formError.value = 'Indicá fecha de inicio y fin.'
      return
    }
    const dv = formDiscountValue.value.trim()
    if (!dv || Number(dv) < 0) {
      formError.value = 'El valor de descuento debe ser un número ≥ 0.'
      return
    }

    const payload: CreatePromotionRequest = {
      title,
      discountType: formDiscountType.value,
      discountValue: dv,
      startDate: formStartDate.value,
      endDate: formEndDate.value,
      notifyUsers: formNotifyUsers.value,
    }
    const desc = formDescription.value.trim()
    if (desc) payload.description = desc
    const ids = [...formSelectedItemIds.value]
    if (ids.length > 0) payload.menuItemIds = ids as ApiId[]

    formSubmitting.value = true
    try {
      await promotionService.create(restaurantId, payload)
      resetForm()
      showForm.value = false
      await loadPromotions()
    } catch {
      formError.value = 'No se pudo crear la promoción. Revisá fechas, tipo y platos seleccionados.'
    } finally {
      formSubmitting.value = false
    }
  }

  async function removePromotion(p: Promotion) {
    if (!window.confirm(`¿Eliminar la promoción «${p.title}»? Esta acción no se puede deshacer.`)) {
      return
    }
    try {
      await promotionService.delete(restaurantId, p.id)
      await loadPromotions()
    } catch {
      window.alert('No se pudo eliminar la promoción.')
    }
  }

  function menuItemSummary(p: Promotion): string {
    const n = p.menuItemIds?.length ?? 0
    if (n === 0) return 'Sin platos específicos (alcance general)'
    return `${n} plato(s) en alcance`
  }

  onMounted(async () => {
    await Promise.all([loadPromotions(), loadMenuItemsForPicker()])
  })

  return {
    restaurantId,
    promotions,
    loading,
    menuPickItems,
    menuPickLoading,
    showForm,
    formSubmitting,
    formError,
    formTitle,
    formDescription,
    formDiscountType,
    formDiscountValue,
    formStartDate,
    formEndDate,
    formNotifyUsers,
    discountTypeLabels,
    discountTypes: DISCOUNT_TYPES,
    discountDisplay,
    formatDate,
    toggleMenuItem,
    isMenuItemSelected,
    resetForm,
    submitCreate,
    removePromotion,
    menuItemSummary,
    openForm: () => {
      resetForm()
      showForm.value = true
    },
    closeForm: () => {
      showForm.value = false
      resetForm()
    },
  }
}
