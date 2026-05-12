<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { tableService } from '@/services'
import type { Table } from '@/types'

const route = useRoute()
const restaurantId = route.params.restaurantId as string

const tables = ref<Table[]>([])
const loading = ref(true)

async function toggleActive(table: Table) {
  const updated = { ...table, isActive: !table.isActive }
  const idx = tables.value.findIndex(t => t.id === table.id)
  if (idx !== -1) tables.value[idx] = updated
  try {
    await tableService.update(restaurantId, table.id, {
      number: table.number,
      name: table.name ?? undefined,
      capacity: table.capacity,
      isJoinable: table.isJoinable,
      isActive: updated.isActive,
    })
  } catch {
    if (idx !== -1) tables.value[idx] = table
  }
}

onMounted(async () => {
  loading.value = true
  try {
    tables.value = await tableService.getByRestaurant(restaurantId)
  } catch {
    // silently degrade
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="tables-view">
    <h1 class="owner-sub-title">Mesas</h1>
    <p class="owner-sub-desc">Administrá la capacidad y disponibilidad de tus mesas.</p>

    <div v-if="loading" style="color:var(--text-muted);font-size:0.875rem">Cargando…</div>
    <div v-else-if="tables.length === 0" style="color:var(--text-muted);font-size:0.875rem;padding:2rem 0">
      No hay mesas configuradas.
    </div>
    <div v-else class="tables-grid">
      <div v-for="t in tables" :key="t.id" :class="['table-card', !t.isActive && 'table-card--inactive']">
        <div class="table-card-number">Mesa {{ t.number }}</div>
        <div class="table-card-capacity">{{ t.capacity }} personas</div>
        <div v-if="t.name" class="table-card-name">{{ t.name }}</div>
        <div class="table-card-row">
          <span class="table-card-label">Unible</span>
          <span :class="['table-card-badge', t.isJoinable && 'table-card-badge--yes']">
            {{ t.isJoinable ? 'Sí' : 'No' }}
          </span>
        </div>
        <div class="table-card-toggle-row">
          <span class="table-card-label">{{ t.isActive ? 'Activa' : 'Inactiva' }}</span>
          <label class="owner-toggle">
            <input type="checkbox" :checked="t.isActive" @change="toggleActive(t)" />
            <span class="owner-toggle-track" />
            <span class="owner-toggle-thumb" />
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tables-view { padding: 2.5rem; }
.owner-sub-title { font-size: 1.5rem; font-weight: 700; color: #ccc; margin: 0 0 0.375rem; letter-spacing: -0.02em; }
.owner-sub-desc { font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 2rem; }
.tables-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 10px; }
.table-card { background: #060606; border: 1px solid #0d0d0d; border-radius: var(--radius-lg); padding: 1.25rem; }
.table-card--inactive { opacity: 0.45; }
.table-card-number { font-size: 1.125rem; font-weight: 700; color: #bbb; margin-bottom: 2px; }
.table-card-capacity { font-size: 0.8125rem; color: var(--brand); margin-bottom: 0.625rem; }
.table-card-name { font-size: 0.75rem; color: #333; margin-bottom: 0.5rem; }
.table-card-row, .table-card-toggle-row { display: flex; justify-content: space-between; align-items: center; padding: 0.4rem 0; border-top: 1px solid #0a0a0a; }
.table-card-label { font-size: 0.75rem; color: var(--text-muted); }
.table-card-badge { font-size: 0.625rem; color: var(--text-muted); border: 1px solid #111; border-radius: 99px; padding: 2px 8px; }
.table-card-badge--yes { color: var(--brand); border-color: rgba(249,115,22,0.2); }
.owner-toggle { position: relative; width: 34px; height: 18px; cursor: pointer; }
.owner-toggle input { opacity: 0; width: 0; height: 0; }
.owner-toggle-track { position: absolute; inset: 0; background: #111; border-radius: 99px; transition: background var(--dur-fast); }
.owner-toggle input:checked + .owner-toggle-track { background: var(--brand); }
.owner-toggle-thumb { position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; background: #333; border-radius: 50%; transition: transform var(--dur-fast), background var(--dur-fast); }
.owner-toggle input:checked ~ .owner-toggle-thumb { transform: translateX(16px); background: #000; }
</style>
