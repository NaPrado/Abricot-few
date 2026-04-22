import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  Check,
  ChevronDown,
  ChevronRight,
  ImagePlus,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-vue-next'
import { menuService, menuCategoryService, menuItemService } from '@/services'
import { useToast } from '@/composables/useToast'
import { BaseButton, BaseInput, BaseSpinner, BaseTextarea, EmptyState } from '@/components/base'
import type {
  Menu,
  MenuCategory,
  MenuItem,
  CreateMenuRequest,
  CreateMenuCategoryRequest,
  CreateMenuItemRequest,
  UpdateMenuItemAvailabilityRequest,
} from '@/types'

interface MenuForm {
  name: string
}
interface CategoryForm {
  name: string
}
interface ItemForm {
  name: string
  description: string
  /** Money string (`MoneyAmountType`, e.g. `12.50`) */
  price: string
  isAvailable: boolean
}

function toMoneyAmount(raw: string): string {
  const n = Number(String(raw).replace(',', '.'))
  if (!Number.isFinite(n)) return '0.00'
  return n.toFixed(2)
}

export function useOwnerMenusView() {
  const { t } = useI18n()
  const route = useRoute()
  const toast = useToast()

  const restaurantId = computed(() => route.params.restaurantId as string)

  const menusRaw = ref<Menu[]>([])
  const categoriesByMenu = ref<Record<string, MenuCategory[]>>({})
  const itemsByCategory = ref<Record<string, MenuItem[]>>({})
  const loading = ref(false)
  const savingMenu = ref(false)
  const savingCategory = ref(false)
  const savingItem = ref(false)

  const expandedMenuId = ref<string | null>(null)
  const expandedCategoryId = ref<string | null>(null)

  const showMenuForm = ref(false)
  const editingMenu = ref<Menu | null>(null)
  const menuForm = reactive<MenuForm>({ name: '' })

  const showCategoryForm = ref(false)
  const editingCategory = ref<MenuCategory | null>(null)
  const activeCategoryMenuId = ref<string | null>(null)
  const categoryForm = reactive<CategoryForm>({ name: '' })

  const showItemForm = ref(false)
  const editingItem = ref<MenuItem | null>(null)
  const activeItemCategoryId = ref<string | null>(null)
  const itemForm = reactive<ItemForm>({
    name: '',
    description: '',
    price: '',
    isAvailable: true,
  })

  const menus = computed(() =>
    menusRaw.value.map((menu) => ({
      ...menu,
      categories: (categoriesByMenu.value[menu.id] ?? []).map((cat) => ({
        ...cat,
        items: itemsByCategory.value[cat.id] ?? [],
      })),
    })),
  )

  const menuFormName = computed({
    get: () => menuForm.name,
    set: (v: string) => {
      menuForm.name = v
    },
  })

  const categoryFormName = computed({
    get: () => categoryForm.name,
    set: (v: string) => {
      categoryForm.name = v
    },
  })

  onMounted(() => void load())

  async function load(): Promise<void> {
    if (!restaurantId.value) return
    loading.value = true
    try {
      menusRaw.value = await menuService.getByRestaurant(restaurantId.value)
    } finally {
      loading.value = false
    }
  }

  async function reloadCategoriesForMenu(menuId: string): Promise<void> {
    categoriesByMenu.value[menuId] = await menuCategoryService.getByMenu(menuId)
  }

  async function reloadItemsForCategory(categoryId: string): Promise<void> {
    itemsByCategory.value[categoryId] = await menuItemService.getByCategory(categoryId)
  }

  async function toggleMenu(menuId: string): Promise<void> {
    if (expandedMenuId.value === menuId) {
      expandedMenuId.value = null
      return
    }
    expandedMenuId.value = menuId
    if (!categoriesByMenu.value[menuId]) {
      try {
        await reloadCategoriesForMenu(menuId)
      } catch {
        categoriesByMenu.value[menuId] = []
      }
    }
  }

  async function toggleCategory(categoryId: string): Promise<void> {
    if (expandedCategoryId.value === categoryId) {
      expandedCategoryId.value = null
      return
    }
    expandedCategoryId.value = categoryId
    if (!itemsByCategory.value[categoryId]) {
      try {
        await reloadItemsForCategory(categoryId)
      } catch {
        itemsByCategory.value[categoryId] = []
      }
    }
  }

  function openMenuCreate(menu?: Menu): void {
    if (menu) {
      editingMenu.value = menu
      menuForm.name = menu.name
    } else {
      editingMenu.value = null
      menuForm.name = ''
    }
    showMenuForm.value = true
  }

  function closeMenuForm(): void {
    showMenuForm.value = false
    editingMenu.value = null
  }

  async function saveMenu(): Promise<void> {
    if (!restaurantId.value || !menuForm.name) return
    savingMenu.value = true
    try {
      if (editingMenu.value) {
        await menuService.update(restaurantId.value, editingMenu.value.id, {
          name: menuForm.name,
          isActive: editingMenu.value.isActive,
        })
        toast.show(t('ownerMenus.toast.menuUpdated'), 'success')
      } else {
        const payload: CreateMenuRequest = { name: menuForm.name }
        await menuService.create(restaurantId.value, payload)
        toast.show(t('ownerMenus.toast.menuCreated'), 'success')
      }
      closeMenuForm()
      await load()
    } catch {
      toast.show(t('ownerMenus.toast.error'), 'error')
    } finally {
      savingMenu.value = false
    }
  }

  async function activateMenu(menu: Menu): Promise<void> {
    if (!restaurantId.value) return
    try {
      await menuService.activate(restaurantId.value, menu.id)
      toast.show(t('ownerMenus.toast.menuActivated'), 'success')
      await load()
    } catch {
      toast.show(t('ownerMenus.toast.error'), 'error')
    }
  }

  async function deleteMenu(menuId: string): Promise<void> {
    if (!restaurantId.value) return
    if (!confirm(t('ownerMenus.deleteMenuConfirm'))) return
    try {
      await menuService.delete(restaurantId.value, menuId)
      toast.show(t('ownerMenus.toast.menuDeleted'), 'success')
      delete categoriesByMenu.value[menuId]
      if (expandedMenuId.value === menuId) expandedMenuId.value = null
      await load()
    } catch {
      toast.show(t('ownerMenus.toast.error'), 'error')
    }
  }

  function openCategoryCreate(menuId: string, category?: MenuCategory): void {
    activeCategoryMenuId.value = menuId
    if (category) {
      editingCategory.value = category
      categoryForm.name = category.name
    } else {
      editingCategory.value = null
      categoryForm.name = ''
    }
    showCategoryForm.value = true
  }

  function closeCategoryForm(): void {
    showCategoryForm.value = false
    editingCategory.value = null
    activeCategoryMenuId.value = null
  }

  async function saveCategory(): Promise<void> {
    if (!activeCategoryMenuId.value || !categoryForm.name) return
    const menuId = activeCategoryMenuId.value
    savingCategory.value = true
    try {
      const payload: CreateMenuCategoryRequest = { name: categoryForm.name }
      if (editingCategory.value) {
        await menuCategoryService.update(menuId, editingCategory.value.id, {
          name: categoryForm.name,
          displayOrder: editingCategory.value.displayOrder,
          isActive: editingCategory.value.isActive,
        })
        toast.show(t('ownerMenus.toast.categoryUpdated'), 'success')
      } else {
        await menuCategoryService.create(menuId, payload)
        toast.show(t('ownerMenus.toast.categoryCreated'), 'success')
      }
      delete categoriesByMenu.value[menuId]
      closeCategoryForm()
      if (expandedMenuId.value === menuId) await reloadCategoriesForMenu(menuId)
    } catch {
      toast.show(t('ownerMenus.toast.error'), 'error')
    } finally {
      savingCategory.value = false
    }
  }

  async function deleteCategory(menuId: string, categoryId: string): Promise<void> {
    if (!confirm(t('ownerMenus.deleteCategoryConfirm'))) return
    try {
      await menuCategoryService.delete(menuId, categoryId)
      toast.show(t('ownerMenus.toast.categoryDeleted'), 'success')
      delete categoriesByMenu.value[menuId]
      delete itemsByCategory.value[categoryId]
      if (expandedCategoryId.value === categoryId) expandedCategoryId.value = null
      if (expandedMenuId.value === menuId) await reloadCategoriesForMenu(menuId)
    } catch {
      toast.show(t('ownerMenus.toast.error'), 'error')
    }
  }

  function openItemCreate(categoryId: string, item?: MenuItem): void {
    activeItemCategoryId.value = categoryId
    if (item) {
      editingItem.value = item
      itemForm.name = item.name
      itemForm.description = item.description ?? ''
      itemForm.price = item.price
      itemForm.isAvailable = item.isAvailable
    } else {
      editingItem.value = null
      itemForm.name = ''
      itemForm.description = ''
      itemForm.price = ''
      itemForm.isAvailable = true
    }
    showItemForm.value = true
  }

  function closeItemForm(): void {
    showItemForm.value = false
    editingItem.value = null
    activeItemCategoryId.value = null
  }

  async function saveItem(): Promise<void> {
    if (!activeItemCategoryId.value || !itemForm.name || !itemForm.price.trim()) return
    const categoryId = activeItemCategoryId.value
    savingItem.value = true
    try {
      const payload: CreateMenuItemRequest = {
        name: itemForm.name,
        description: itemForm.description || undefined,
        price: toMoneyAmount(itemForm.price),
        isAvailable: itemForm.isAvailable,
      }
      if (editingItem.value) {
        await menuItemService.update(editingItem.value.id, payload)
        toast.show(t('ownerMenus.toast.itemUpdated'), 'success')
      } else {
        await menuItemService.create(categoryId, payload)
        toast.show(t('ownerMenus.toast.itemCreated'), 'success')
      }
      delete itemsByCategory.value[categoryId]
      closeItemForm()
      if (expandedCategoryId.value === categoryId) await reloadItemsForCategory(categoryId)
    } catch {
      toast.show(t('ownerMenus.toast.error'), 'error')
    } finally {
      savingItem.value = false
    }
  }

  async function deleteItem(categoryId: string, itemId: string): Promise<void> {
    if (!confirm(t('ownerMenus.deleteItemConfirm'))) return
    try {
      await menuItemService.delete(itemId)
      toast.show(t('ownerMenus.toast.itemDeleted'), 'success')
      delete itemsByCategory.value[categoryId]
      if (expandedCategoryId.value === categoryId) await reloadItemsForCategory(categoryId)
    } catch {
      toast.show(t('ownerMenus.toast.error'), 'error')
    }
  }

  async function toggleItemAvailability(item: MenuItem): Promise<void> {
    const categoryId = item.categoryId
    const payload: UpdateMenuItemAvailabilityRequest = { isAvailable: !item.isAvailable }
    try {
      await menuItemService.updateAvailability(item.id, payload)
      toast.show(t('ownerMenus.toast.availabilityOk'), 'success')
      delete itemsByCategory.value[categoryId]
      if (expandedCategoryId.value === categoryId) await reloadItemsForCategory(categoryId)
    } catch {
      toast.show(t('ownerMenus.toast.error'), 'error')
    }
  }

  function onItemPhoto(itemId: string, event: Event): void {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    input.value = ''
    if (file) void uploadPhoto(itemId, file)
  }

  async function uploadPhoto(itemId: string, file: File): Promise<void> {
    try {
      await menuItemService.uploadPhoto(itemId, file)
      toast.show(t('ownerMenus.toast.photoOk'), 'success')
      for (const cid of Object.keys(itemsByCategory.value)) {
        const list = itemsByCategory.value[cid]
        if (list?.some((i) => i.id === itemId)) {
          delete itemsByCategory.value[cid]
          if (expandedCategoryId.value === cid) await reloadItemsForCategory(cid)
          break
        }
      }
    } catch {
      toast.show(t('ownerMenus.toast.error'), 'error')
    }
  }

  return {
    t,
    menus,
    loading,
    expandedMenuId,
    expandedCategoryId,
    showMenuForm,
    menuFormName,
    showCategoryForm,
    categoryFormName,
    showItemForm,
    itemForm,
    savingMenu,
    savingCategory,
    savingItem,
    toggleMenu,
    toggleCategory,
    openMenuCreate,
    closeMenuForm,
    saveMenu,
    deleteMenu,
    activateMenu,
    openCategoryCreate,
    closeCategoryForm,
    saveCategory,
    deleteCategory,
    openItemCreate,
    closeItemForm,
    saveItem,
    deleteItem,
    toggleItemAvailability,
    onItemPhoto,
    BaseButton,
    BaseInput,
    BaseSpinner,
    BaseTextarea,
    EmptyState,
    Plus,
    Pencil,
    Trash2,
    ChevronDown,
    ChevronRight,
    Check,
    ImagePlus,
  }
}
