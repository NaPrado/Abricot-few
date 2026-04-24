<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { businessHoursService } from '@/services'
import type { BusinessHour } from '@/types'

const route = useRoute()
const restaurantId = route.params.restaurantId as string

const hours = ref<BusinessHour[]>([])
const loading = ref(true)
const saving = ref(false)
const success = ref(false)

async function save() {
  saving.value = true
  success.value = false
  try {
    await businessHoursService.updateByRestaurant(restaurantId, hours.value.map(h => ({
      dayOfWeek: h.dayOfWeek,
      opensAt: h.isClosed ? null : h.opensAt,
      closesAt: h.isClosed ? null : h.closesAt,
      isClosed: h.isClosed,
    })))
    success.value = true
  } catch {
    // silently fail
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    hours.value = await businessHoursService.getByRestaurant(restaurantId)
  } catch {
    // silently degrade
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="hours-view">
    <h1 class="owner-sub-title">Horarios</h1>
    <p class="owner-sub-desc">Configurá los horarios de apertura y cierre de tu restaurante.</p>

    <div v-if="loading" style="color:#2a2a2a;font-size:0.875rem">Cargando…</div>
    <template v-else>
      <div class="hours-list">
        <div v-for="h in hours" :key="h.id" class="hours-row">
          <span class="hours-day">{{ h.dayName }}</span>
          <label class="owner-toggle">
            <input type="checkbox" :checked="!h.isClosed" @change="h.isClosed = !h.isClosed" />
            <span class="owner-toggle-track" />
            <span class="owner-toggle-thumb" />
          </label>
          <span class="hours-open-label">{{ h.isClosed ? 'Cerrado' : 'Abierto' }}</span>
          <template v-if="!h.isClosed">
            <input v-model="h.opensAt" class="hours-input" type="time" />
            <span style="color:#1a1a1a">—</span>
            <input v-model="h.closesAt" class="hours-input" type="time" />
          </template>
          <template v-else>
            <span class="hours-closed-placeholder">—</span>
          </template>
        </div>
      </div>

      <p v-if="success" style="color:var(--brand);font-size:0.8125rem;margin-bottom:0.75rem">Horarios guardados.</p>
      <button class="hours-save-btn" :disabled="saving" @click="save">
        {{ saving ? 'Guardando…' : 'Guardar horarios' }}
      </button>
    </template>
  </div>
</template>

<style scoped>
.hours-view { padding: 2.5rem; max-width: 640px; }
.owner-sub-title { font-size: 1.5rem; font-weight: 700; color: #ccc; margin: 0 0 0.375rem; letter-spacing: -0.02em; }
.owner-sub-desc { font-size: 0.8125rem; color: #2a2a2a; margin-bottom: 2rem; }
.hours-list { display: flex; flex-direction: column; gap: 2px; margin-bottom: 1.5rem; }
.hours-row { display: flex; align-items: center; gap: 1rem; padding: 0.875rem 1.25rem; background: #060606; border: 1px solid #0d0d0d; border-radius: var(--radius-md); }
.hours-day { font-size: 0.875rem; color: #666; width: 90px; flex-shrink: 0; }
.hours-open-label { font-size: 0.75rem; color: #2a2a2a; width: 55px; }
.hours-input { background: #080808; border: 1px solid #111; border-radius: var(--radius-sm); padding: 4px 8px; color: #ccc; font-size: 0.8125rem; font-family: inherit; outline: none; }
.hours-closed-placeholder { flex: 1; color: #111; font-size: 0.8125rem; }
.hours-save-btn { padding: 0.75rem 2rem; background: #e8e8e8; border: none; border-radius: var(--radius-md); color: #060606; font-weight: 700; font-size: 0.875rem; font-family: inherit; cursor: pointer; transition: opacity var(--dur-fast); }
.hours-save-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.owner-toggle { position: relative; width: 34px; height: 18px; cursor: pointer; }
.owner-toggle input { opacity: 0; width: 0; height: 0; }
.owner-toggle-track { position: absolute; inset: 0; background: #111; border-radius: 99px; transition: background var(--dur-fast); }
.owner-toggle input:checked + .owner-toggle-track { background: var(--brand); }
.owner-toggle-thumb { position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; background: #333; border-radius: 50%; transition: transform var(--dur-fast), background var(--dur-fast); }
.owner-toggle input:checked ~ .owner-toggle-thumb { transform: translateX(16px); background: #000; }
</style>
