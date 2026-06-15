<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { HttpError } from '@/services/http'
import { menuCategoryService, menuItemService, menuService } from '@/services'
import { useToast } from '@/composables'
import type { Menu, MenuDetail } from '@/types'

const route = useRoute()
const restaurantId = route.params.restaurantId as string
const toast = useToast()

const menus = ref<Menu[]>([])
const selectedMenu = ref<MenuDetail | null>(null)
const loading = ref(true)
const detailLoading = ref(false)
const showCreateForm = ref(false)
const createLoading = ref(false)
const createError = ref('')
const newMenuName = ref('')
const newCategoryName = ref('')
const categoryLoading = ref(false)
const categoryError = ref('')
const itemCategoryId = ref('')
const itemName = ref('')
const itemDescription = ref('')
const itemPrice = ref('')
const itemAvailable = ref(true)
const itemLoading = ref(false)
const itemError = ref('')

function formatMoney(n: string | number): string { return `$${Math.round(Number(n)).toLocaleString('es-AR')}` }

const selectedMenuHasItems = computed(() =>
  selectedMenu.value?.categories.some(category => category.items.length > 0) ?? false,
)

const selectedMenuHasCategories = computed(() => (selectedMenu.value?.categories.length ?? 0) > 0)

async function selectMenu(menu: Menu) {
  detailLoading.value = true
  try {
    selectedMenu.value = await menuService.getById(restaurantId, menu.id)
    itemCategoryId.value = selectedMenu.value.categories[0]?.id ?? ''
  } catch { /* silently fail */ }
  finally { detailLoading.value = false }
}

async function activateMenu(id: string) {
  try {
    await menuService.activate(restaurantId, id)
    menus.value = menus.value.map(m => ({ ...m, isActive: m.id === id }))
    if (selectedMenu.value) selectedMenu.value = { ...selectedMenu.value, isActive: selectedMenu.value.id === id }
  } catch { /* silently fail */ }
}

async function createMenu() {
  createError.value = ''
  const name = newMenuName.value.trim()
  if (!name) {
    createError.value = 'El nombre del menú es obligatorio.'
    return
  }

  createLoading.value = true
  try {
    const created = await menuService.create(restaurantId, { name })
    menus.value = [created, ...menus.value]
    newMenuName.value = ''
    showCreateForm.value = false
    await selectMenu(created)
  } catch {
    createError.value = 'No se pudo crear el menú. Intentá de nuevo.'
  } finally {
    createLoading.value = false
  }
}

async function createCategory() {
  categoryError.value = ''
  const name = newCategoryName.value.trim()
  if (!selectedMenu.value) return
  if (!name) {
    categoryError.value = 'El nombre de la categoría es obligatorio.'
    return
  }

  categoryLoading.value = true
  try {
    const created = await menuCategoryService.create(restaurantId, selectedMenu.value.id, {
      name,
      displayOrder: selectedMenu.value.categories.length,
    })
    const category = { ...created, items: [] }
    selectedMenu.value = {
      ...selectedMenu.value,
      categories: [...selectedMenu.value.categories, category],
    }
    itemCategoryId.value = category.id
    newCategoryName.value = ''
  } catch {
    categoryError.value = 'No se pudo crear la categoría.'
  } finally {
    categoryLoading.value = false
  }
}

async function ensureItemCategory(): Promise<string | null> {
  if (!selectedMenu.value) return null
  if (itemCategoryId.value) return itemCategoryId.value

  const existingCategory = selectedMenu.value.categories[0]
  if (existingCategory) {
    itemCategoryId.value = existingCategory.id
    return existingCategory.id
  }

  const created = await menuCategoryService.create(restaurantId, selectedMenu.value.id, {
    name: 'General',
    displayOrder: 0,
  })
  const category = { ...created, items: [] }
  selectedMenu.value = {
    ...selectedMenu.value,
    categories: [category],
  }
  itemCategoryId.value = category.id
  return category.id
}

async function deleteMenu(menu: Menu) {
  if (!window.confirm(`¿Eliminar el menú «${menu.name}»? Se eliminarán también sus categorías e ítems.`)) return
  try {
    await menuService.delete(restaurantId, menu.id)
    menus.value = menus.value.filter(m => m.id !== menu.id)
    if (selectedMenu.value?.id === menu.id) selectedMenu.value = null
    toast.show('Menú eliminado.', 'success')
  } catch (e) {
    if (e instanceof HttpError && e.status === 409) {
      toast.show('No se puede eliminar el menú activo.', 'error')
      return
    }
    toast.show('No pudimos eliminar el menú.', 'error')
  }
}

async function deleteCategory(categoryId: string) {
  if (!selectedMenu.value) return
  if (!window.confirm('¿Eliminar la categoría y todos sus platos?')) return
  try {
    await menuCategoryService.delete(restaurantId, selectedMenu.value.id, categoryId)
    selectedMenu.value = {
      ...selectedMenu.value,
      categories: selectedMenu.value.categories.filter(c => c.id !== categoryId),
    }
    if (itemCategoryId.value === categoryId) itemCategoryId.value = ''
    toast.show('Categoría eliminada.', 'success')
  } catch (e) {
    if (e instanceof HttpError && e.status === 409) {
      toast.show('La categoría tiene ítems con pedidos asociados.', 'error')
      return
    }
    toast.show('No pudimos eliminar la categoría.', 'error')
  }
}

async function deleteItem(categoryId: string, itemId: string) {
  if (!selectedMenu.value) return
  if (!window.confirm('¿Eliminar este plato?')) return
  try {
    await menuItemService.delete(restaurantId, selectedMenu.value.id, categoryId, itemId)
    selectedMenu.value = {
      ...selectedMenu.value,
      categories: selectedMenu.value.categories.map(c =>
        c.id === categoryId
          ? { ...c, items: c.items.filter(it => it.id !== itemId) }
          : c,
      ),
    }
    toast.show('Plato eliminado.', 'success')
  } catch {
    toast.show('No pudimos eliminar el plato.', 'error')
  }
}

async function toggleItemAvailability(categoryId: string, itemId: string, current: boolean) {
  if (!selectedMenu.value) return
  const cat = selectedMenu.value.categories.find(c => c.id === categoryId)
  const item = cat?.items.find(i => i.id === itemId)
  if (!item) return
  try {
    const updated = await menuItemService.update(
      restaurantId,
      selectedMenu.value.id,
      categoryId,
      itemId,
      {
        name: item.name,
        price: Number(item.price),
        isAvailable: !current,
        ...(item.description ? { description: item.description } : {}),
      },
    )
    selectedMenu.value = {
      ...selectedMenu.value,
      categories: selectedMenu.value.categories.map(c =>
        c.id === categoryId
          ? { ...c, items: c.items.map(i => (i.id === itemId ? updated : i)) }
          : c,
      ),
    }
  } catch {
    toast.show('No pudimos actualizar la disponibilidad.', 'error')
  }
}

async function createItem() {
  itemError.value = ''
  if (!selectedMenu.value) return
  const name = itemName.value.trim()
  const description = itemDescription.value.trim()
  const price = Number(itemPrice.value)

  if (!name) {
    itemError.value = 'El nombre del plato es obligatorio.'
    return
  }
  if (!Number.isFinite(price) || price < 0) {
    itemError.value = 'El precio debe ser un número mayor o igual a 0.'
    return
  }

  itemLoading.value = true
  try {
    const categoryId = await ensureItemCategory()
    if (!categoryId || !selectedMenu.value) {
      itemError.value = 'No se pudo preparar una categoría para el plato.'
      return
    }

    const created = await menuItemService.create(restaurantId, selectedMenu.value.id, categoryId, {
      name,
      price,
      isAvailable: itemAvailable.value,
      ...(description ? { description } : {}),
    })
    selectedMenu.value = {
      ...selectedMenu.value,
      categories: selectedMenu.value.categories.map(category =>
        category.id === categoryId
          ? { ...category, items: [...category.items, created] }
          : category,
      ),
    }
    itemName.value = ''
    itemDescription.value = ''
    itemPrice.value = ''
    itemAvailable.value = true
  } catch {
    itemError.value = 'No se pudo crear el plato. Revisá los datos e intentá de nuevo.'
  } finally {
    itemLoading.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    menus.value = await menuService.getByRestaurant(restaurantId)
    if (menus.value.length > 0) await selectMenu(menus.value[0]!)
  } catch {
    // silently degrade
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="owner-menus-view">
    <div class="owner-menus-head">
      <div>
        <h1 class="owner-sub-title">Menú digital</h1>
        <p class="owner-sub-desc">Administrá la carta de tu restaurante.</p>
      </div>
      <button
        v-if="!loading && menus.length > 0"
        type="button"
        class="owner-menu-new-btn"
        @click="showCreateForm = !showCreateForm"
      >
        {{ showCreateForm ? 'Cerrar' : '+ Nuevo menú' }}
      </button>
    </div>

    <form
      v-if="showCreateForm || (!loading && menus.length === 0)"
      class="owner-menu-create"
      @submit.prevent="createMenu"
    >
      <label class="owner-menu-create-field">
        <span>Nombre del menú</span>
        <input
          v-model="newMenuName"
          type="text"
          maxlength="150"
          placeholder="Ej. Carta principal"
          :disabled="createLoading"
        />
      </label>
      <button type="submit" class="owner-menu-create-btn" :disabled="createLoading">
        {{ createLoading ? 'Creando…' : 'Crear menú' }}
      </button>
      <p v-if="createError" class="owner-menu-create-error">{{ createError }}</p>
    </form>

    <div v-if="loading" style="color:var(--text-muted);font-size:0.875rem">Cargando…</div>
    <template v-else>
      <div v-if="menus.length === 0" class="owner-menu-empty-state">
        No hay menús creados.
      </div>
      <div v-else class="owner-menus-layout">
        <!-- Menu list -->
        <div class="owner-menus-list">
          <div
            v-for="m in menus"
            :key="m.id"
            :class="['owner-menu-item', selectedMenu?.id === m.id && 'owner-menu-item--active']"
            role="button"
            tabindex="0"
            @click="selectMenu(m)"
            @keydown.enter="selectMenu(m)"
            @keydown.space.prevent="selectMenu(m)"
          >
            <span class="owner-menu-item-main">
              <span class="owner-menu-item-name">{{ m.name }}</span>
              <span class="owner-menu-item-status">{{ m.isActive ? 'Publicado' : 'Borrador' }}</span>
            </span>
            <span v-if="m.isActive" class="owner-menu-active-badge">Activo</span>
            <button
              v-else
              class="owner-menu-activate-btn"
              @click.stop="activateMenu(m.id as string)"
            >Activar</button>
            <button
              v-if="!m.isActive"
              class="owner-menu-delete-btn"
              type="button"
              @click.stop="deleteMenu(m)"
              aria-label="Eliminar menú"
            >×</button>
          </div>
        </div>

        <!-- Menu detail -->
        <div class="owner-menus-detail">
          <div v-if="detailLoading" style="color:var(--text-muted);font-size:0.875rem">Cargando…</div>
          <template v-else-if="selectedMenu">
            <div class="owner-menu-detail-head">
              <div>
                <h2 class="owner-menu-detail-title">{{ selectedMenu.name }}</h2>
                <p class="owner-menu-detail-sub">
                  {{ selectedMenuHasItems ? 'Platos cargados en la carta.' : 'Cargá categorías y platos para completar la carta.' }}
                </p>
              </div>
              <span v-if="selectedMenu.isActive" class="owner-menu-active-badge">Activo</span>
            </div>

            <form class="owner-menu-category-form" @submit.prevent="createCategory">
              <label class="owner-menu-create-field">
                <span>Nueva categoría</span>
                <input
                  v-model="newCategoryName"
                  type="text"
                  maxlength="100"
                  placeholder="Ej. Entradas"
                  :disabled="categoryLoading"
                />
              </label>
              <button type="submit" class="owner-menu-secondary-btn" :disabled="categoryLoading">
                {{ categoryLoading ? 'Creando…' : 'Crear categoría' }}
              </button>
              <p v-if="categoryError" class="owner-menu-create-error">{{ categoryError }}</p>
            </form>

            <form class="owner-menu-item-form" @submit.prevent="createItem">
              <label class="owner-menu-create-field">
                <span>Categoría</span>
                <select v-model="itemCategoryId" :disabled="itemLoading || !selectedMenuHasCategories">
                  <option value="">{{ selectedMenuHasCategories ? 'Seleccionar' : 'General' }}</option>
                  <option
                    v-for="category in selectedMenu.categories"
                    :key="category.id"
                    :value="category.id"
                  >
                    {{ category.name }}
                  </option>
                </select>
              </label>
              <label class="owner-menu-create-field">
                <span>Plato</span>
                <input
                  v-model="itemName"
                  type="text"
                  maxlength="150"
                  placeholder="Ej. Milanesa napolitana"
                  :disabled="itemLoading"
                />
              </label>
              <label class="owner-menu-create-field">
                <span>Precio</span>
                <input
                  v-model="itemPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="12500"
                  :disabled="itemLoading"
                />
              </label>
              <label class="owner-menu-create-field owner-menu-item-desc-field">
                <span>Descripción</span>
                <input
                  v-model="itemDescription"
                  type="text"
                  maxlength="5000"
                  placeholder="Opcional"
                  :disabled="itemLoading"
                />
              </label>
              <label class="owner-menu-check-field">
                <input v-model="itemAvailable" type="checkbox" :disabled="itemLoading" />
                <span>Disponible</span>
              </label>
              <button type="submit" class="owner-menu-create-btn" :disabled="itemLoading">
                {{ itemLoading ? 'Cargando…' : 'Cargar plato' }}
              </button>
              <p v-if="itemError" class="owner-menu-create-error">{{ itemError }}</p>
            </form>

            <div v-if="!selectedMenuHasCategories" class="owner-menu-empty owner-menu-empty--compact">
              Si cargás un plato sin categoría, se creará en General.
            </div>
            <div
              v-else
              v-for="category in selectedMenu.categories"
              :key="category.id"
              class="owner-menu-category"
            >
              <div class="owner-menu-cat-head">
                <div class="owner-menu-cat-name">{{ category.name }}</div>
                <button
                  type="button"
                  class="owner-menu-delete-btn owner-menu-delete-btn--inline"
                  @click="deleteCategory(category.id as string)"
                >Eliminar</button>
              </div>
              <template v-if="category.items.length > 0">
                <div
                  v-for="item in category.items"
                  :key="item.id"
                  :class="['owner-menu-row', !item.isAvailable && 'owner-menu-row--unavailable']"
                >
                  <div>
                    <div class="owner-menu-row-name">{{ item.name }}</div>
                    <div v-if="item.description" class="owner-menu-row-desc">{{ item.description }}</div>
                  </div>
                  <div class="owner-menu-row-controls">
                    <div class="owner-menu-row-price">
                      <template v-if="item.discountedPrice != null">
                        <span class="owner-menu-row-price-base">{{ formatMoney(item.price) }}</span>
                        <span class="owner-menu-row-price-promo">{{ Number(item.discountedPrice) === 0 ? 'Gratis' : formatMoney(item.discountedPrice) }}</span>
                        <span v-if="item.discount" class="owner-menu-row-promo-badge">{{ item.discount.title }}</span>
                      </template>
                      <template v-else>{{ formatMoney(item.price) }}</template>
                    </div>
                    <button
                      type="button"
                      class="owner-menu-row-toggle"
                      @click="toggleItemAvailability(category.id as string, item.id as string, item.isAvailable)"
                    >{{ item.isAvailable ? 'Pausar' : 'Activar' }}</button>
                    <button
                      type="button"
                      class="owner-menu-delete-btn owner-menu-delete-btn--inline"
                      @click="deleteItem(category.id as string, item.id as string)"
                    >Eliminar</button>
                  </div>
                </div>
              </template>
              <div v-else class="owner-menu-category-empty">Sin platos cargados.</div>
            </div>
          </template>
          <div v-else class="owner-menu-empty">
            Seleccioná un menú para ver su contenido.
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.owner-menus-view { padding: 2.5rem; }
.owner-menus-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 2rem; }
.owner-sub-title { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin: 0 0 0.375rem; letter-spacing: 0; }
.owner-sub-desc { font-size: 0.8125rem; color: var(--text-muted); margin: 0; }
.owner-menu-new-btn { flex: 0 0 auto; color: var(--brand); background: var(--brand-dim); border: 1px solid var(--brand-border-hover); border-radius: 8px; padding: 0.5rem 0.875rem; font-family: inherit; font-size: 0.8125rem; font-weight: 700; cursor: pointer; white-space: nowrap; }
.owner-menu-new-btn:hover { background: var(--brand-dim-hover); color: var(--brand-hover); }
.owner-menu-create { display: grid; grid-template-columns: minmax(180px, 360px) auto; align-items: end; gap: 0.75rem; width: min(100%, 560px); margin-bottom: 1.5rem; }
.owner-menu-create-field { display: flex; flex-direction: column; gap: 0.35rem; color: var(--text-muted); font-size: 0.75rem; }
.owner-menu-create-field input,
.owner-menu-create-field select { width: 100%; min-width: 0; min-height: 2.5rem; color: var(--text-primary); background: var(--bg-input); border: 1px solid var(--border-default); border-radius: 8px; padding: 0 0.75rem; outline: none; }
.owner-menu-create-field input:focus,
.owner-menu-create-field select:focus { border-color: var(--brand-border-hover); box-shadow: var(--brand-glow); }
.owner-menu-create-btn { min-height: 2.5rem; color: #111; background: var(--brand); border: 1px solid var(--brand); border-radius: 8px; padding: 0 1rem; font-family: inherit; font-size: 0.8125rem; font-weight: 800; cursor: pointer; }
.owner-menu-create-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.owner-menu-create-error { grid-column: 1 / -1; color: var(--danger-hover); font-size: 0.8125rem; margin: 0; }
.owner-menu-empty-state { color: var(--text-muted); font-size: 0.875rem; padding: 1rem 0 2rem; }
.owner-menus-layout { display: grid; grid-template-columns: minmax(220px, 280px) minmax(0, 1fr); gap: 1.5rem; align-items: start; min-width: 0; }
.owner-menus-list { display: flex; flex-direction: column; gap: 0.5rem; }
.owner-menu-item { display: flex; align-items: center; justify-content: space-between; gap: 0.875rem; min-height: 4rem; padding: 0.75rem 1rem; background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 8px; cursor: pointer; transition: background var(--dur-fast), border-color var(--dur-fast), box-shadow var(--dur-fast); }
.owner-menu-item:hover { background: var(--bg-card-hover); border-color: var(--border-default); }
.owner-menu-item:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }
.owner-menu-item--active { background: var(--brand-dim); border-color: var(--brand); box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.1); }
.owner-menu-item-main { display: flex; flex-direction: column; min-width: 0; }
.owner-menu-item-name { color: var(--text-secondary); font-size: 0.9375rem; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.owner-menu-item-status { color: var(--text-placeholder); font-size: 0.6875rem; line-height: 1.2; margin-top: 0.125rem; }
.owner-menu-item--active .owner-menu-item-name { color: var(--text-primary); }
.owner-menu-active-badge { flex: 0 0 auto; color: var(--brand-hover); font-size: 0.625rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
.owner-menu-activate-btn { flex: 0 0 auto; background: var(--bg-input); border: 1px solid var(--border-default); color: var(--text-secondary); border-radius: 999px; padding: 0.25rem 0.625rem; font-size: 0.6875rem; font-family: inherit; cursor: pointer; }
.owner-menu-activate-btn:hover { border-color: var(--brand-border-hover); color: var(--brand-hover); box-shadow: var(--brand-glow); }
.owner-menus-detail { min-width: 0; min-height: 12.5rem; background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 1.5rem; overflow: hidden; }
.owner-menu-detail-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 1.25rem; }
.owner-menu-detail-title { color: var(--text-primary); font-size: 1.125rem; font-weight: 700; margin: 0 0 0.125rem; }
.owner-menu-detail-sub { color: var(--text-muted); font-size: 0.8125rem; margin: 0; }
.owner-menu-category-form { display: grid; grid-template-columns: minmax(0, 1fr); align-items: end; gap: 0.75rem; padding-bottom: 1rem; margin-bottom: 1rem; border-bottom: 1px solid var(--border-subtle); }
.owner-menu-item-form { display: grid; grid-template-columns: minmax(0, 1fr); align-items: end; gap: 0.75rem; padding-bottom: 1.25rem; margin-bottom: 1.25rem; border-bottom: 1px solid var(--border-subtle); }
.owner-menu-item-desc-field { grid-column: auto; }
.owner-menu-secondary-btn { min-height: 2.5rem; color: var(--text-secondary); background: var(--bg-input); border: 1px solid var(--border-default); border-radius: 8px; padding: 0 1rem; font-family: inherit; font-size: 0.8125rem; font-weight: 700; cursor: pointer; white-space: nowrap; }
.owner-menu-secondary-btn:hover { border-color: var(--brand-border-hover); color: var(--brand-hover); }
.owner-menu-secondary-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.owner-menu-check-field { min-height: 2.5rem; display: flex; align-items: center; gap: 0.5rem; color: var(--text-secondary); font-size: 0.8125rem; }
.owner-menu-check-field input { accent-color: var(--brand); }
.owner-menu-category { margin-bottom: 1.5rem; }
.owner-menu-category:last-child { margin-bottom: 0; }
.owner-menu-cat-name { color: var(--brand-hover); font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 0.75rem; }
.owner-menu-category-empty { color: var(--text-muted); font-size: 0.8125rem; padding: 0.75rem 0; border-bottom: 1px solid var(--border-subtle); }
.owner-menu-row { display: flex; justify-content: space-between; align-items: flex-start; padding: 0.875rem 0; border-bottom: 1px solid var(--border-subtle); gap: 1rem; }
.owner-menu-row:last-child { border-bottom: 0; }
.owner-menu-row--unavailable { opacity: 0.48; }
.owner-menu-row-name { color: var(--text-secondary); font-size: 0.9375rem; font-weight: 600; }
.owner-menu-row-desc { color: var(--text-muted); font-size: 0.8125rem; margin-top: 0.125rem; max-width: 42rem; }
.owner-menu-row-price { display: flex; align-items: center; gap: 0.5rem; color: var(--text-primary); font-size: 0.9375rem; font-weight: 700; white-space: nowrap; }
.owner-menu-row-price-base { text-decoration: line-through; color: var(--text-muted); font-weight: 600; }
.owner-menu-row-price-promo { color: var(--brand); font-weight: 800; }
.owner-menu-row-promo-badge { font-size: 0.625rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: var(--brand); background: var(--brand-dim); border: 1px solid var(--brand-border-hover); border-radius: 6px; padding: 0.1rem 0.4rem; }
.owner-menu-row-controls { display: flex; align-items: center; gap: 0.5rem; }
.owner-menu-row-toggle { background: transparent; border: 1px solid var(--border-default); color: var(--text-secondary); padding: 4px 10px; border-radius: var(--radius-sm); font-family: inherit; font-size: 0.6875rem; cursor: pointer; }
.owner-menu-row-toggle:hover { border-color: var(--brand-border-hover); color: var(--brand-hover); }
.owner-menu-cat-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
.owner-menu-delete-btn { background: transparent; border: 1px solid rgba(239, 68, 68, 0.25); color: var(--danger); padding: 2px 8px; border-radius: var(--radius-sm); font-family: inherit; font-size: 0.6875rem; cursor: pointer; }
.owner-menu-delete-btn:hover { background: rgba(239, 68, 68, 0.06); border-color: rgba(239, 68, 68, 0.45); }
.owner-menu-delete-btn--inline { font-size: 0.625rem; }
.owner-menu-empty { display: flex; min-height: 9rem; flex-direction: column; align-items: center; justify-content: center; gap: 0.25rem; color: var(--text-muted); font-size: 0.875rem; text-align: center; }
.owner-menu-empty--compact { min-height: 4rem; }
.owner-menu-empty-title { color: var(--text-secondary); font-size: 1rem; font-weight: 700; }

@media (min-width: 1180px) {
  .owner-menu-category-form { grid-template-columns: minmax(0, 1fr) auto; }
  .owner-menu-item-form { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .owner-menu-item-form .owner-menu-create-btn { justify-self: start; min-width: 9.5rem; }
}

@media (max-width: 980px) {
  .owner-menus-view { padding: 1.5rem; }
  .owner-menus-head { flex-direction: column; margin-bottom: 1.5rem; }
  .owner-menu-create { grid-template-columns: 1fr; }
  .owner-menu-create-btn { width: 100%; }
  .owner-menus-layout { grid-template-columns: 1fr; }
  .owner-menu-secondary-btn { width: 100%; }
}
</style>
