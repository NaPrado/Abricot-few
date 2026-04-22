import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Plus, Pencil, Trash2, Eye } from 'lucide-vue-next'
import { useRestaurantStore } from '@/stores'
import { BaseButton } from '@/components/base'
import RestaurantModal from '@/components/restaurant/RestaurantModal.vue'
import RestaurantDetailModal from '@/components/restaurant/RestaurantDetailModal.vue'
import { useToast } from '@/composables/useToast'
import type { ApiId, Restaurant, RestaurantCreateRequest } from '@/types'

export function useRestaurantsView() {
  const { t } = useI18n()
  const store = useRestaurantStore()
  const toast = useToast()

  const showForm = ref(false)
  const editing = ref<Restaurant | null>(null)
  const detail = ref<Restaurant | null>(null)

  onMounted(() => {
    void store.fetchAll()
  })

  function openCreate(): void {
    editing.value = null
    showForm.value = true
  }

  function openEdit(r: Restaurant): void {
    editing.value = r
    showForm.value = true
  }

  function closeForm(): void {
    showForm.value = false
    editing.value = null
  }

  async function onSave(payload: RestaurantCreateRequest, photo: File | null): Promise<void> {
    try {
      if (editing.value) {
        await store.update(editing.value.id, payload)
        toast.show(t('restaurant.toast.updated'), 'success')
        if (photo) await store.uploadPhoto(editing.value.id, photo)
      } else {
        const created = await store.create(payload)
        toast.show(t('restaurant.toast.created'), 'success')
        if (photo) await store.uploadPhoto(created.id, photo)
      }
      closeForm()
      await store.fetchAll()
    } catch {
      toast.show(t('restaurant.toast.saveError'), 'error')
    }
  }

  async function onDelete(id: ApiId): Promise<void> {
    if (!window.confirm(t('restaurant.deleteConfirm'))) return
    try {
      await store.remove(id)
      toast.show(t('restaurant.toast.deleted'), 'success')
    } catch {
      toast.show(t('restaurant.toast.deleteError'), 'error')
    }
  }

  async function onDetailPhoto(file: File): Promise<void> {
    if (!detail.value) return
    try {
      await store.uploadPhoto(detail.value.id, file)
      toast.show(t('restaurant.toast.photoOk'), 'success')
      await store.fetchAll()
      const updated = store.restaurants.find((r) => r.id === detail.value!.id)
      if (updated) detail.value = updated
    } catch {
      toast.show(t('restaurant.toast.photoError'), 'error')
    }
  }

  return {
    Plus,
    Pencil,
    Trash2,
    Eye,
    BaseButton,
    RestaurantModal,
    RestaurantDetailModal,
    t,
    store,
    showForm,
    editing,
    detail,
    openCreate,
    openEdit,
    closeForm,
    onSave,
    onDelete,
    onDetailPhoto,
  }
}
