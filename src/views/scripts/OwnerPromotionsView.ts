import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'
import { promotionService } from '@/services'
import { useToast } from '@/composables/useToast'
import { BaseButton, BaseInput, BaseSelect, BaseSpinner, BaseTextarea, EmptyState } from '@/components/base'
import type { ApiId, Promotion, DiscountType, CreatePromotionRequest } from '@/types'

interface PromotionForm {
  title: string
  description: string
  discountType: DiscountType
  /** `MoneyAmountType` as entered in the form */
  discountValue: string
  startDate: string
  endDate: string
  notifyUsers: boolean
}

export function useOwnerPromotionsView() {
  const { t } = useI18n()
  const route = useRoute()
  const toast = useToast()

  const restaurantId = computed(() => route.params.restaurantId as string)

  const promotions = ref<Promotion[]>([])
  const loading = ref(false)
  const savingForm = ref(false)

  const showForm = ref(false)
  const editingPromotion = ref<Promotion | null>(null)
  const form = reactive<PromotionForm>({
    title: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    startDate: '',
    endDate: '',
    notifyUsers: false,
  })

  const discountTypeOptions = [
    { value: 'PERCENTAGE', label: t('ownerPromotions.discountType.PERCENTAGE') },
    { value: 'FIXED_AMOUNT', label: t('ownerPromotions.discountType.FIXED_AMOUNT') },
    { value: 'FREE_ITEM', label: t('ownerPromotions.discountType.FREE_ITEM') },
  ]

  onMounted(() => void load())

  async function load(): Promise<void> {
    if (!restaurantId.value) return
    loading.value = true
    try {
      promotions.value = await promotionService.getByRestaurant(restaurantId.value)
    } finally {
      loading.value = false
    }
  }

  function openCreate(): void {
    editingPromotion.value = null
    form.title = ''
    form.description = ''
    form.discountType = 'PERCENTAGE'
    form.discountValue = ''
    form.startDate = ''
    form.endDate = ''
    form.notifyUsers = false
    showForm.value = true
  }

  function openEdit(promotion: Promotion): void {
    editingPromotion.value = promotion
    form.title = promotion.title
    form.description = promotion.description ?? ''
    form.discountType = promotion.discountType
    form.discountValue = promotion.discountValue
    form.startDate = promotion.startDate
    form.endDate = promotion.endDate
    form.notifyUsers = promotion.notifyUsers
    showForm.value = true
  }

  function closeForm(): void {
    showForm.value = false
    editingPromotion.value = null
  }

  const editingId = computed(() => editingPromotion.value?.id ?? '')

  async function savePromotion(): Promise<void> {
    if (!restaurantId.value || !form.title || !form.discountValue.trim()) return
    savingForm.value = true
    try {
      const payload: CreatePromotionRequest = {
        title: form.title,
        description: form.description || undefined,
        discountType: form.discountType,
        discountValue: form.discountValue.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        notifyUsers: form.notifyUsers,
      }
      if (editingPromotion.value) {
        await promotionService.update(restaurantId.value, editingPromotion.value.id, payload)
        toast.show(t('ownerPromotions.toast.updated'), 'success')
      } else {
        await promotionService.create(restaurantId.value, payload)
        toast.show(t('ownerPromotions.toast.created'), 'success')
      }
      closeForm()
      await load()
    } catch {
      toast.show(t('ownerPromotions.toast.error'), 'error')
    } finally {
      savingForm.value = false
    }
  }

  async function activatePromotion(id: ApiId): Promise<void> {
    const promotion = promotions.value.find((p) => p.id === id)
    if (!restaurantId.value || !promotion) return
    try {
      await promotionService.activate(restaurantId.value, promotion.id)
      toast.show(t('ownerPromotions.toast.activated'), 'success')
      await load()
    } catch {
      toast.show(t('ownerPromotions.toast.error'), 'error')
    }
  }

  async function deactivatePromotion(id: ApiId): Promise<void> {
    const promotion = promotions.value.find((p) => p.id === id)
    if (!restaurantId.value || !promotion) return
    try {
      await promotionService.deactivate(restaurantId.value, promotion.id)
      toast.show(t('ownerPromotions.toast.deactivated'), 'success')
      await load()
    } catch {
      toast.show(t('ownerPromotions.toast.error'), 'error')
    }
  }

  async function deletePromotion(id: ApiId): Promise<void> {
    if (!restaurantId.value) return
    if (!confirm(t('ownerPromotions.deleteConfirm'))) return
    try {
      await promotionService.delete(restaurantId.value, id)
      toast.show(t('ownerPromotions.toast.deleted'), 'success')
      await load()
    } catch {
      toast.show(t('ownerPromotions.toast.error'), 'error')
    }
  }

  return {
    t,
    promotions,
    loading,
    showForm,
    form,
    editingId,
    discountTypeOptions,
    savingForm,
    openCreate,
    openEdit,
    closeForm,
    savePromotion,
    deletePromotion,
    activatePromotion,
    deactivatePromotion,
    BaseButton,
    BaseInput,
    BaseSelect,
    BaseSpinner,
    BaseTextarea,
    EmptyState,
    Plus,
    Pencil,
    Trash2,
  }
}
