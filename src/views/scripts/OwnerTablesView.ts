import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'
import { tableService } from '@/services'
import { useToast } from '@/composables/useToast'
import { BaseButton, BaseInput, BaseSpinner, EmptyState } from '@/components/base'
import type { ApiId, Table, CreateTableRequest, UpdateTableRequest, BulkCreateTablesGroup } from '@/types'

interface TableFormState {
  number: number | null
  capacity: number | null
  name: string
  isJoinable: boolean
  isActive: boolean
}

interface BulkGroupRow {
  capacity: number | null
  count: number | null
}

export function useOwnerTablesView() {
  const { t } = useI18n()
  const route = useRoute()
  const toast = useToast()

  const restaurantId = computed(() => route.params.restaurantId as string)

  const tables = ref<Table[]>([])
  const loading = ref(false)
  const savingForm = ref(false)

  const showForm = ref(false)
  const editing = ref<Table | null>(null)
  const form = reactive<TableFormState>({
    number: null,
    capacity: null,
    name: '',
    isJoinable: false,
    isActive: true,
  })

  const showBulk = ref(false)
  const bulkGroups = ref<BulkGroupRow[]>([{ capacity: null, count: null }])

  onMounted(() => void load())

  async function load(): Promise<void> {
    if (!restaurantId.value) return
    loading.value = true
    try {
      tables.value = await tableService.getByRestaurant(restaurantId.value)
    } finally {
      loading.value = false
    }
  }

  function openCreate(): void {
    editing.value = null
    form.number = null
    form.capacity = null
    form.name = ''
    form.isJoinable = false
    form.isActive = true
    showForm.value = true
  }

  function openEdit(table: Table): void {
    editing.value = table
    form.number = table.number
    form.capacity = table.capacity
    form.name = table.name ?? ''
    form.isJoinable = table.isJoinable
    form.isActive = table.isActive
    showForm.value = true
  }

  function closeForm(): void {
    showForm.value = false
    editing.value = null
  }

  async function onSave(): Promise<void> {
    if (!restaurantId.value || form.number === null || form.capacity === null) return
    savingForm.value = true
    try {
      if (editing.value) {
        const payload: UpdateTableRequest = {
          number: form.number,
          capacity: form.capacity,
          name: form.name || undefined,
          isJoinable: form.isJoinable,
          isActive: form.isActive,
        }
        await tableService.update(restaurantId.value, editing.value.id, payload)
        toast.show(t('ownerTables.toast.updated'), 'success')
      } else {
        const payload: CreateTableRequest = {
          number: form.number,
          capacity: form.capacity,
          name: form.name || undefined,
          isJoinable: form.isJoinable,
        }
        await tableService.create(restaurantId.value, payload)
        toast.show(t('ownerTables.toast.created'), 'success')
      }
      closeForm()
      await load()
    } catch {
      toast.show(t('ownerTables.toast.error'), 'error')
    } finally {
      savingForm.value = false
    }
  }

  async function onDelete(id: ApiId): Promise<void> {
    if (!restaurantId.value) return
    if (!confirm(t('ownerTables.deleteConfirm'))) return
    try {
      await tableService.delete(restaurantId.value, id)
      toast.show(t('ownerTables.toast.deleted'), 'success')
      await load()
    } catch {
      toast.show(t('ownerTables.toast.deleteError'), 'error')
    }
  }

  function addBulkGroup(): void {
    bulkGroups.value.push({ capacity: null, count: null })
  }

  function removeBulkGroup(index: number): void {
    bulkGroups.value.splice(index, 1)
  }

  async function onBulkCreate(): Promise<void> {
    if (!restaurantId.value) return
    savingForm.value = true
    try {
      const groups: BulkCreateTablesGroup[] = bulkGroups.value
        .filter((g) => g.capacity !== null && g.count !== null)
        .map((g) => ({ capacity: g.capacity!, quantity: g.count! }))
      await tableService.bulkCreate(restaurantId.value, { groups })
      toast.show(t('ownerTables.toast.bulkOk'), 'success')
      showBulk.value = false
      bulkGroups.value = [{ capacity: null, count: null }]
      await load()
    } catch {
      toast.show(t('ownerTables.toast.error'), 'error')
    } finally {
      savingForm.value = false
    }
  }

  return {
    t,
    tables,
    loading,
    showForm,
    editing,
    form,
    showBulk,
    bulkGroups,
    savingForm,
    openCreate,
    openEdit,
    closeForm,
    onSave,
    onDelete,
    addBulkGroup,
    removeBulkGroup,
    onBulkCreate,
    BaseInput,
    BaseButton,
    BaseSpinner,
    EmptyState,
    Plus,
    Pencil,
    Trash2,
  }
}
