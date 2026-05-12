<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { reservationService } from '@/services'
import type { Reservation } from '@/types'

const route = useRoute()
const restaurantId = route.params.restaurantId as string

const reservations = ref<Reservation[]>([])
const loading = ref(true)

const STATUS_LABEL: Record<string, string> = {
  CONFIRMED: 'Confirmada',
  CANCELLED: 'Cancelada',
  COMPLETED: 'Completada',
  NO_SHOW: 'No asistió',
}

function statusLabel(s: string): string { return STATUS_LABEL[s] ?? s }

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

async function markCompleted(id: string) {
  try {
    await reservationService.complete(id)
    const idx = reservations.value.findIndex(r => r.id === id)
    if (idx !== -1) reservations.value[idx] = { ...reservations.value[idx]!, status: 'COMPLETED' }
  } catch { /* silently fail */ }
}

async function markNoShow(id: string) {
  try {
    await reservationService.noShow(id)
    const idx = reservations.value.findIndex(r => r.id === id)
    if (idx !== -1) reservations.value[idx] = { ...reservations.value[idx]!, status: 'NO_SHOW' }
  } catch { /* silently fail */ }
}

onMounted(async () => {
  loading.value = true
  try {
    const res = await reservationService.getByRestaurant(restaurantId, { page: 1, perPage: 50 })
    reservations.value = res.data
  } catch {
    // silently degrade
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="owner-reserv-view">
    <h1 class="owner-sub-title">Reservas</h1>
    <p class="owner-sub-desc">Gestión de reservas del restaurante.</p>

    <div v-if="loading" style="color:var(--text-muted);font-size:0.875rem">Cargando…</div>
    <div v-else-if="reservations.length === 0" style="color:var(--text-muted);font-size:0.875rem;padding:2rem 0">
      Sin reservas.
    </div>
    <div v-else class="owner-table">
      <div class="owner-table-head">
        <span>Cliente</span>
        <span>Fecha</span>
        <span>Hora</span>
        <span>Personas</span>
        <span>Estado</span>
        <span>Acciones</span>
      </div>
      <div v-for="r in reservations" :key="r.id" class="owner-table-row">
        <span class="owner-table-cell">{{ r.guestName ?? 'Online' }}</span>
        <span class="owner-table-cell">{{ formatDate(r.date) }}</span>
        <span class="owner-table-cell">{{ r.timeSlot.slice(0,5) }}</span>
        <span class="owner-table-cell">{{ r.partySize }}</span>
        <span :class="['owner-table-cell', 'owner-status', `owner-status--${r.status}`]">{{ statusLabel(r.status) }}</span>
        <span class="owner-table-cell owner-actions">
          <button
            v-if="r.status === 'CONFIRMED'"
            class="owner-action-btn"
            @click="markCompleted(r.id as string)"
          >Completar</button>
          <button
            v-if="r.status === 'CONFIRMED'"
            class="owner-action-btn owner-action-btn--danger"
            @click="markNoShow(r.id as string)"
          >No asistió</button>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.owner-reserv-view { padding: 2.5rem; }
.owner-sub-title { font-size: 1.5rem; font-weight: 700; color: #ccc; margin: 0 0 0.375rem; letter-spacing: -0.02em; }
.owner-sub-desc { font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 2rem; }
.owner-table { background: #060606; border: 1px solid #0d0d0d; border-radius: var(--radius-lg); overflow: hidden; }
.owner-table-head { display: grid; grid-template-columns: 1fr 80px 70px 70px 100px 160px; padding: 0.75rem 1.25rem; background: #080808; font-size: 0.5625rem; color: var(--text-muted); letter-spacing: 0.14em; text-transform: uppercase; }
.owner-table-row { display: grid; grid-template-columns: 1fr 80px 70px 70px 100px 160px; padding: 0.875rem 1.25rem; border-top: 1px solid #0a0a0a; align-items: center; }
.owner-table-cell { font-size: 0.8125rem; color: #444; }
.owner-status { font-size: 0.6875rem; letter-spacing: 0.08em; text-transform: uppercase; }
.owner-status--CONFIRMED { color: var(--brand); }
.owner-status--CANCELLED { color: #222; }
.owner-status--COMPLETED { color: #333; }
.owner-status--NO_SHOW { color: var(--danger); }
.owner-actions { display: flex; gap: 0.5rem; }
.owner-action-btn { background: transparent; border: 1px solid #161616; color: #333; border-radius: var(--radius-sm); padding: 4px 10px; font-size: 0.6875rem; font-family: inherit; cursor: pointer; transition: all var(--dur-fast); }
.owner-action-btn:hover { color: #666; border-color: #222; }
.owner-action-btn--danger { border-color: rgba(239,68,68,0.2); color: var(--danger); }
.owner-action-btn--danger:hover { background: rgba(239,68,68,0.06); }
</style>
