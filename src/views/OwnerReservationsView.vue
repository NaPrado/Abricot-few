<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { HttpError } from '@/services/http'
import { reservationService } from '@/services'
import { useToast } from '@/composables'
import type {
  Reservation,
  ReservationSource,
  ReservationStatus,
  RestaurantReservationsQuery,
} from '@/types'

const route = useRoute()
const restaurantId = route.params.restaurantId as string
const toast = useToast()

const reservations = ref<Reservation[]>([])
const loading = ref(true)
const total = ref(0)
const page = ref(1)
const perPage = ref(20)
const filterStatus = ref<ReservationStatus | ''>('')
const filterSource = ref<ReservationSource | ''>('')
const filterDate = ref('')

const STATUS_LABEL: Record<string, string> = {
  CONFIRMED: 'Confirmada',
  CANCELLED: 'Cancelada',
  COMPLETED: 'Completada',
  NO_SHOW: 'No asistió',
}

const STATUS_OPTIONS: ReservationStatus[] = ['CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']
const SOURCE_OPTIONS: ReservationSource[] = ['ONLINE', 'PHONE', 'EVENT']

function statusLabel(s: string): string { return STATUS_LABEL[s] ?? s }

/**
 * Identify who made the reservation. Widget bookings capture `guestName` + `guestEmail`;
 * fall back through the available contact fields so a row never collapses to a bare
 * "Online". The confirmation code (rendered separately) keeps every row unique.
 */
function clientLabel(r: Reservation): string {
  const candidate = r.guestName ?? r.guestEmail ?? r.guestPhone
  if (typeof candidate === 'string' && candidate.trim()) return candidate.trim()
  return r.userId ? 'Cliente registrado' : 'Sin datos'
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

async function load() {
  loading.value = true
  try {
    const query: RestaurantReservationsQuery = { page: page.value, perPage: perPage.value }
    if (filterStatus.value) query.status = filterStatus.value
    if (filterSource.value) query.source = filterSource.value
    if (filterDate.value) query.date = filterDate.value
    const res = await reservationService.getByRestaurant(restaurantId, query)
    reservations.value = res.data
    total.value = res.total
  } catch (e) {
    if (e instanceof HttpError && (e.status === 401 || e.status === 403)) {
      toast.show('No tenés permisos para ver estas reservas.', 'error')
    } else if (!(e instanceof HttpError)) {
      toast.show('No pudimos cargar las reservas.', 'error')
    }
    reservations.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

async function markCompleted(r: Reservation) {
  try {
    const updated = await reservationService.complete(r.id)
    const idx = reservations.value.findIndex(x => x.id === r.id)
    if (idx !== -1) reservations.value[idx] = updated
  } catch (e) {
    if (e instanceof HttpError && e.status === 409) {
      toast.show('No se puede completar la reserva desde su estado actual.', 'error')
      return
    }
    toast.show('No pudimos completar la reserva.', 'error')
  }
}

async function markNoShow(r: Reservation) {
  try {
    const updated = await reservationService.noShow(r.id)
    const idx = reservations.value.findIndex(x => x.id === r.id)
    if (idx !== -1) reservations.value[idx] = updated
  } catch (e) {
    if (e instanceof HttpError && e.status === 409) {
      toast.show('No se puede marcar como No asistió desde el estado actual.', 'error')
      return
    }
    toast.show('No pudimos actualizar la reserva.', 'error')
  }
}

async function cancelReservation(r: Reservation) {
  if (!window.confirm('¿Cancelar la reserva?')) return
  const reason = window.prompt('Motivo (opcional):') ?? undefined
  try {
    const updated = await reservationService.cancel(r.id, reason ? { reason } : undefined)
    const idx = reservations.value.findIndex(x => x.id === r.id)
    if (idx !== -1) reservations.value[idx] = updated
  } catch (e) {
    if (e instanceof HttpError && e.status === 409) {
      toast.show('No se puede cancelar desde el estado actual.', 'error')
      return
    }
    toast.show('No pudimos cancelar la reserva.', 'error')
  }
}

function goToPage(next: number) {
  if (next < 1) return
  if (next > Math.max(1, Math.ceil(total.value / perPage.value))) return
  page.value = next
  void load()
}

watch([filterStatus, filterSource, filterDate], () => {
  page.value = 1
  void load()
})

onMounted(() => void load())
</script>

<template>
  <div class="owner-reserv-view">
    <h1 class="owner-sub-title">Reservas</h1>
    <p class="owner-sub-desc">Gestión de reservas del restaurante.</p>

    <div class="owner-reserv-filters">
      <label>
        <span>Estado</span>
        <select v-model="filterStatus">
          <option value="">Todos</option>
          <option v-for="s in STATUS_OPTIONS" :key="s" :value="s">{{ statusLabel(s) }}</option>
        </select>
      </label>
      <label>
        <span>Origen</span>
        <select v-model="filterSource">
          <option value="">Todos</option>
          <option v-for="s in SOURCE_OPTIONS" :key="s" :value="s">{{ s }}</option>
        </select>
      </label>
      <label>
        <span>Fecha</span>
        <input v-model="filterDate" type="date" />
      </label>
    </div>

    <div v-if="loading" style="color:var(--text-muted);font-size:0.875rem">Cargando…</div>
    <div v-else-if="reservations.length === 0" style="color:var(--text-muted);font-size:0.875rem;padding:2rem 0">
      Sin reservas para los filtros aplicados.
    </div>
    <div v-else class="owner-table">
      <div class="owner-table-head">
        <span>Cliente</span>
        <span>Código</span>
        <span>Fecha</span>
        <span>Hora</span>
        <span>Personas</span>
        <span>Estado</span>
        <span>Acciones</span>
      </div>
      <div v-for="r in reservations" :key="r.id" class="owner-table-row">
        <span class="owner-table-cell owner-client">
          <span class="owner-client-name">{{ clientLabel(r) }}</span>
          <span v-if="r.guestEmail && r.guestEmail !== clientLabel(r)" class="owner-client-email">{{ r.guestEmail }}</span>
        </span>
        <span class="owner-table-cell">
          <span v-if="r.confirmationCode" class="owner-code">{{ r.confirmationCode }}</span>
          <span v-else>—</span>
        </span>
        <span class="owner-table-cell">{{ formatDate(r.date) }}</span>
        <span class="owner-table-cell">{{ r.timeSlot.slice(0,5) }}</span>
        <span class="owner-table-cell">{{ r.partySize }}</span>
        <span :class="['owner-table-cell', 'owner-status', `owner-status--${r.status}`]">{{ statusLabel(r.status) }}</span>
        <span class="owner-table-cell owner-actions">
          <button
            v-if="r.status === 'CONFIRMED'"
            class="owner-action-btn"
            @click="markCompleted(r)"
          >Completar</button>
          <button
            v-if="r.status === 'CONFIRMED'"
            class="owner-action-btn owner-action-btn--danger"
            @click="markNoShow(r)"
          >No asistió</button>
          <button
            v-if="r.status === 'CONFIRMED'"
            class="owner-action-btn owner-action-btn--danger"
            @click="cancelReservation(r)"
          >Cancelar</button>
        </span>
      </div>
    </div>

    <div v-if="total > perPage" class="owner-reserv-pagination">
      <button class="owner-action-btn" :disabled="page <= 1" @click="goToPage(page - 1)">Anterior</button>
      <span class="owner-reserv-page">Página {{ page }} de {{ Math.ceil(total / perPage) }}</span>
      <button
        class="owner-action-btn"
        :disabled="page >= Math.ceil(total / perPage)"
        @click="goToPage(page + 1)"
      >Siguiente</button>
    </div>
  </div>
</template>

<style scoped>
.owner-reserv-view { padding: 2.5rem; }
.owner-sub-title { font-size: 1.5rem; font-weight: 700; color: #ccc; margin: 0 0 0.375rem; letter-spacing: -0.02em; }
.owner-sub-desc { font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 2rem; }
.owner-reserv-filters { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
.owner-reserv-filters label { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.5625rem; color: var(--text-muted); letter-spacing: 0.14em; text-transform: uppercase; }
.owner-reserv-filters select,
.owner-reserv-filters input { min-height: 2.25rem; padding: 0 0.65rem; border-radius: var(--radius-sm); border: 1px solid #1a1a1a; background: #0a0a0a; color: #ccc; font-family: inherit; font-size: 0.8125rem; }
.owner-table { background: #060606; border: 1px solid #0d0d0d; border-radius: var(--radius-lg); overflow: hidden; }
.owner-table-head { display: grid; grid-template-columns: 1.4fr 110px 80px 70px 70px 100px 220px; padding: 0.75rem 1.25rem; background: #080808; font-size: 0.5625rem; color: var(--text-muted); letter-spacing: 0.14em; text-transform: uppercase; }
.owner-table-row { display: grid; grid-template-columns: 1.4fr 110px 80px 70px 70px 100px 220px; padding: 0.875rem 1.25rem; border-top: 1px solid #0a0a0a; align-items: center; }
.owner-table-cell { font-size: 0.8125rem; color: #444; }
.owner-client { display: flex; flex-direction: column; gap: 2px; }
.owner-client-name { color: #888; }
.owner-client-email { font-size: 0.6875rem; color: var(--text-muted); }
.owner-code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.75rem; letter-spacing: 0.06em; color: var(--brand); }
.owner-status { font-size: 0.6875rem; letter-spacing: 0.08em; text-transform: uppercase; }
.owner-status--CONFIRMED { color: var(--brand); }
.owner-status--CANCELLED { color: #222; }
.owner-status--COMPLETED { color: #333; }
.owner-status--NO_SHOW { color: var(--danger); }
.owner-actions { display: flex; gap: 0.35rem; flex-wrap: wrap; }
.owner-action-btn { background: transparent; border: 1px solid #161616; color: #333; border-radius: var(--radius-sm); padding: 4px 10px; font-size: 0.6875rem; font-family: inherit; cursor: pointer; transition: all var(--dur-fast); }
.owner-action-btn:hover { color: #666; border-color: #222; }
.owner-action-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.owner-action-btn--danger { border-color: rgba(239,68,68,0.2); color: var(--danger); }
.owner-action-btn--danger:hover { background: rgba(239,68,68,0.06); }
.owner-reserv-pagination { display: flex; align-items: center; gap: 0.75rem; margin-top: 1rem; }
.owner-reserv-page { font-size: 0.75rem; color: var(--text-muted); }
</style>
