<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { HttpError } from '@/services/http'
import { notificationPreferenceService } from '@/services'
import { useAuthStore } from '@/stores/authStore'
import { useRestaurantNames, useToast } from '@/composables'
import type { NotificationPreference } from '@/types'

const authStore = useAuthStore()
const restaurantNames = useRestaurantNames()
const toast = useToast()
const prefs = ref<NotificationPreference[]>([])
const loading = ref(true)
const loadError = ref('')

async function toggle(
  pref: NotificationPreference,
  field: 'receivePromotions' | 'receiveOrderUpdates' | 'receiveReservationReminders',
) {
  if (!authStore.user) return
  const updated = { ...pref, [field]: !pref[field] }
  const idx = prefs.value.findIndex(p => p.restaurantId === pref.restaurantId)
  if (idx !== -1) prefs.value[idx] = updated
  try {
    await notificationPreferenceService.updateByRestaurant(
      authStore.user.id,
      pref.restaurantId,
      {
        receivePromotions: updated.receivePromotions,
        receiveOrderUpdates: updated.receiveOrderUpdates,
        receiveReservationReminders: updated.receiveReservationReminders,
      },
    )
  } catch (e) {
    if (idx !== -1) prefs.value[idx] = pref
    if (e instanceof HttpError && e.status === 404) {
      toast.show('Preferencia no encontrada para ese restaurante.', 'error')
      return
    }
    if (e instanceof HttpError && (e.status === 401 || e.status === 403)) {
      toast.show('No tenés permisos para actualizar esta preferencia.', 'error')
      return
    }
    toast.show('No pudimos guardar la preferencia.', 'error')
  }
}

function nameFor(pref: NotificationPreference): string {
  return pref.restaurantName ?? restaurantNames.nameFor(pref.restaurantId)
}

onMounted(async () => {
  if (!authStore.user) return
  try {
    const res = await notificationPreferenceService.listByUser(authStore.user.id)
    prefs.value = res
    await restaurantNames.ensureMany(res.map(p => p.restaurantId))
  } catch (e) {
    loadError.value = e instanceof HttpError ? e.message : 'No pudimos cargar tus preferencias.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="notif-view">
    <h1 class="notif-title">Notificaciones</h1>
    <p class="notif-sub">Elegí qué querés recibir de cada restaurante.</p>

    <div v-if="loading" style="color:var(--text-muted);font-size:0.875rem">Cargando…</div>
    <div v-else-if="loadError" class="notif-error">{{ loadError }}</div>
    <div v-else-if="prefs.length === 0" style="color:var(--text-muted);font-size:0.875rem;padding:2rem 0">
      Sin preferencias configuradas.
    </div>
    <div v-else class="notif-list">
      <div v-for="pref in prefs" :key="pref.restaurantId as string" class="notif-card">
        <div class="notif-card-name">{{ nameFor(pref) }}</div>
        <div class="notif-row">
          <span class="notif-row-label">Promociones</span>
          <label class="notif-toggle">
            <input type="checkbox" :checked="pref.receivePromotions" @change="toggle(pref, 'receivePromotions')" />
            <span class="notif-toggle-track" />
            <span class="notif-toggle-thumb" />
          </label>
        </div>
        <div class="notif-row">
          <span class="notif-row-label">Estado de pedidos</span>
          <label class="notif-toggle">
            <input type="checkbox" :checked="pref.receiveOrderUpdates" @change="toggle(pref, 'receiveOrderUpdates')" />
            <span class="notif-toggle-track" />
            <span class="notif-toggle-thumb" />
          </label>
        </div>
        <div class="notif-row">
          <span class="notif-row-label">Recordatorios de reserva</span>
          <label class="notif-toggle">
            <input type="checkbox" :checked="pref.receiveReservationReminders" @change="toggle(pref, 'receiveReservationReminders')" />
            <span class="notif-toggle-track" />
            <span class="notif-toggle-thumb" />
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notif-view { padding: 2.5rem; max-width: 640px; }
.notif-title { font-size: 1.5rem; font-weight: 700; color: #ccc; margin: 0 0 0.375rem; letter-spacing: -0.02em; }
.notif-sub { font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 2rem; }
.notif-list { display: flex; flex-direction: column; gap: 10px; }
.notif-card { background: #060606; border: 1px solid #0d0d0d; border-radius: var(--radius-lg); padding: 1.25rem; }
.notif-card-name { font-size: 0.9375rem; font-weight: 600; color: #888; margin-bottom: 1rem; }
.notif-row { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid #0a0a0a; }
.notif-row:last-child { border-bottom: none; }
.notif-row-label { font-size: 0.8125rem; color: #333; }
.notif-error { padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid rgba(239, 68, 68, 0.25); background: rgba(239, 68, 68, 0.08); color: var(--danger-hover); font-size: 0.8125rem; }
.notif-toggle { position: relative; width: 34px; height: 18px; cursor: pointer; }
.notif-toggle input { opacity: 0; width: 0; height: 0; }
.notif-toggle-track { position: absolute; inset: 0; background: #111; border-radius: 99px; transition: background var(--dur-fast); }
.notif-toggle input:checked + .notif-toggle-track { background: var(--brand); }
.notif-toggle-thumb { position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; background: #333; border-radius: 50%; transition: transform var(--dur-fast), background var(--dur-fast); }
.notif-toggle input:checked ~ .notif-toggle-thumb { transform: translateX(16px); background: #000; }
</style>
