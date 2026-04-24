<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { menuService } from '@/services'
import type { Menu, MenuDetail } from '@/types'

const route = useRoute()
const restaurantId = route.params.restaurantId as string

const menus = ref<Menu[]>([])
const selectedMenu = ref<MenuDetail | null>(null)
const loading = ref(true)
const detailLoading = ref(false)

function formatMoney(n: string | number): string { return `$${Math.round(Number(n)).toLocaleString('es-AR')}` }

async function selectMenu(menu: Menu) {
  detailLoading.value = true
  try {
    selectedMenu.value = await menuService.getById(restaurantId, menu.id)
  } catch { /* silently fail */ }
  finally { detailLoading.value = false }
}

async function activateMenu(id: string) {
  try {
    await menuService.activate(restaurantId, id)
    menus.value = menus.value.map(m => ({ ...m, isActive: m.id === id }))
  } catch { /* silently fail */ }
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
    <h1 class="owner-sub-title">Menú digital</h1>
    <p class="owner-sub-desc">Administrá la carta de tu restaurante.</p>

    <div v-if="loading" style="color:#2a2a2a;font-size:0.875rem">Cargando…</div>
    <template v-else>
      <div v-if="menus.length === 0" style="color:#2a2a2a;font-size:0.875rem;padding:2rem 0">
        No hay menús creados.
      </div>
      <div v-else class="owner-menus-layout">
        <!-- Menu list -->
        <div class="owner-menus-list">
          <div
            v-for="m in menus"
            :key="m.id"
            :class="['owner-menu-item', selectedMenu?.id === m.id && 'owner-menu-item--active']"
            @click="selectMenu(m)"
          >
            <span class="owner-menu-item-name">{{ m.name }}</span>
            <span v-if="m.isActive" class="owner-menu-active-badge">Activo</span>
            <button
              v-else
              class="owner-menu-activate-btn"
              @click.stop="activateMenu(m.id as string)"
            >Activar</button>
          </div>
        </div>

        <!-- Menu detail -->
        <div class="owner-menus-detail">
          <div v-if="detailLoading" style="color:#2a2a2a;font-size:0.875rem">Cargando…</div>
          <template v-else-if="selectedMenu">
            <div
              v-for="category in selectedMenu.categories"
              :key="category.id"
              class="owner-menu-category"
            >
              <div class="owner-menu-cat-name">{{ category.name }}</div>
              <div
                v-for="item in category.items"
                :key="item.id"
                :class="['owner-menu-row', !item.isAvailable && 'owner-menu-row--unavailable']"
              >
                <div>
                  <div class="owner-menu-row-name">{{ item.name }}</div>
                  <div class="owner-menu-row-desc">{{ item.description }}</div>
                </div>
                <div class="owner-menu-row-price">{{ formatMoney(item.price) }}</div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.owner-menus-view { padding: 2.5rem; }
.owner-sub-title { font-size: 1.5rem; font-weight: 700; color: #ccc; margin: 0 0 0.375rem; letter-spacing: -0.02em; }
.owner-sub-desc { font-size: 0.8125rem; color: #2a2a2a; margin-bottom: 2rem; }
.owner-menus-layout { display: grid; grid-template-columns: 200px 1fr; gap: 1.5rem; }
.owner-menus-list { display: flex; flex-direction: column; gap: 4px; }
.owner-menu-item { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; background: #060606; border: 1px solid #0d0d0d; border-radius: var(--radius-md); cursor: pointer; transition: border-color var(--dur-fast); }
.owner-menu-item--active { border-color: var(--brand); }
.owner-menu-item-name { font-size: 0.875rem; color: #555; }
.owner-menu-active-badge { font-size: 0.5625rem; color: var(--brand); letter-spacing: 0.1em; text-transform: uppercase; }
.owner-menu-activate-btn { background: transparent; border: 1px solid #111; color: #222; border-radius: 99px; padding: 2px 8px; font-size: 0.5625rem; font-family: inherit; cursor: pointer; }
.owner-menus-detail { background: #060606; border: 1px solid #0d0d0d; border-radius: var(--radius-lg); padding: 1.5rem; }
.owner-menu-category { margin-bottom: 1.5rem; }
.owner-menu-cat-name { font-size: 0.5625rem; color: #2a2a2a; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 0.75rem; }
.owner-menu-row { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid #0a0a0a; gap: 1rem; }
.owner-menu-row--unavailable { opacity: 0.4; }
.owner-menu-row-name { font-size: 0.875rem; color: #888; font-weight: 500; }
.owner-menu-row-desc { font-size: 0.75rem; color: #2a2a2a; margin-top: 2px; }
.owner-menu-row-price { font-size: 0.875rem; font-weight: 700; color: #555; white-space: nowrap; }
</style>
