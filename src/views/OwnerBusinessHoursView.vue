<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { businessHoursService } from '@/services'
import type { BusinessHour } from '@/types'

const route = useRoute()
const restaurantId = route.params.restaurantId as string

const hours = ref<BusinessHour[]>([])
const loading = ref(true)
const saving = ref(false)
const success = ref(false)
const error = ref('')

// Computed property to check if all open days have valid times
const isValid = computed(() => {
  return hours.value.every(h => {
    if (h.isClosed) return true
    return h.opensAt && h.closesAt && h.opensAt < h.closesAt
  })
})

async function save() {
  saving.value = true
  success.value = false
  error.value = ''
  try {
    // Validate that all open days have times
    for (const h of hours.value) {
      if (!h.isClosed) {
        if (!h.opensAt || !h.closesAt) {
          throw new Error(`${h.dayName}: debes ingresar hora de apertura y cierre`)
        }
        // Validate that opening time is before closing time
        if (h.opensAt >= h.closesAt) {
          throw new Error(`${h.dayName}: la hora de apertura debe ser anterior al cierre`)
        }
      }
    }

    const payload = {
      hours: hours.value.map(h => {
        const hour: Record<string, any> = {
          dayOfWeek: h.dayOfWeek,
          isClosed: h.isClosed,
        }
        // Only include opensAt/closesAt if not closed
        if (!h.isClosed) {
          hour.opensAt = h.opensAt
          hour.closesAt = h.closesAt
        }
        return hour
      }),
    }
    
    console.log('Saving business hours:', payload)
    const result = await businessHoursService.updateByRestaurant(restaurantId, payload)
    console.log('Save result:', result)
    
    success.value = true
    // Clear success message after 3 seconds
    setTimeout(() => {
      success.value = false
    }, 3000)
  } catch (e) {
    console.error('Error saving business hours:', e)
    error.value = e instanceof Error ? e.message : 'Error al guardar horarios'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    console.log('Loading business hours for restaurant:', restaurantId)
    hours.value = await businessHoursService.getByRestaurant(restaurantId)
    console.log('Loaded hours:', hours.value)
  } catch (e) {
    console.error('Error loading business hours:', e)
    error.value = e instanceof Error ? e.message : 'Error al cargar horarios'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="hours-view">
    <h1 class="owner-sub-title">Horarios</h1>
    <p class="owner-sub-desc">Configurá los horarios de apertura y cierre de tu restaurante.</p>

    <div v-if="loading" class="hours-loading">
      <div class="hours-spinner"></div>
      <span>Cargando horarios…</span>
    </div>

    <div v-else-if="error" class="hours-error">
      <span class="hours-error-icon">⚠</span>
      <div>
        <div class="hours-error-title">Error</div>
        <div class="hours-error-message">{{ error }}</div>
      </div>
    </div>

    <template v-else>
      <div class="hours-container">
        <div v-for="h in hours" :key="h.id" class="hours-day-card">
          <div class="hours-day-header">
            <div class="hours-day-name">{{ h.dayName }}</div>
            <label class="owner-toggle">
              <input type="checkbox" :checked="!h.isClosed" @change="h.isClosed = !h.isClosed" />
              <span class="owner-toggle-track" />
              <span class="owner-toggle-thumb" />
            </label>
          </div>

          <div v-if="h.isClosed" class="hours-closed-state">
            Cerrado
          </div>

          <div v-else class="hours-time-inputs">
            <div class="hours-time-group">
              <label class="hours-time-label">Apertura</label>
              <input v-model="h.opensAt" class="hours-time-input" type="time" />
              <div v-if="!h.opensAt" class="hours-time-error">Requerido</div>
            </div>
            <div class="hours-time-separator">—</div>
            <div class="hours-time-group">
              <label class="hours-time-label">Cierre</label>
              <input v-model="h.closesAt" class="hours-time-input" type="time" />
              <div v-if="!h.closesAt" class="hours-time-error">Requerido</div>
            </div>
          </div>
        </div>
      </div>

      <div class="hours-actions">
        <div v-if="success" class="hours-success">
          <span class="hours-success-icon">✓</span>
          <span>Horarios guardados correctamente</span>
        </div>
        <button class="hours-save-btn" :disabled="saving || !isValid" @click="save" :title="!isValid ? 'Completa todos los horarios de los días abiertos' : ''">
          <span v-if="saving" class="hours-btn-spinner"></span>
          {{ saving ? 'Guardando…' : 'Guardar horarios' }}
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.hours-view {
  padding: 2.5rem;
  max-width: 680px;
}

.owner-sub-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ccc;
  margin: 0 0 0.375rem;
  letter-spacing: -0.02em;
}

.owner-sub-desc {
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin-bottom: 2rem;
}

/* Loading state */
.hours-loading {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  color: var(--text-muted);
  font-size: 0.9375rem;
}

.hours-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #222;
  border-top-color: var(--brand);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error state */
.hours-error {
  display: flex;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: #2a0a0a;
  border: 1px solid #4a1515;
  border-radius: var(--radius-lg);
  color: #ff6b6b;
  margin-bottom: 1.5rem;
}

.hours-error-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.hours-error-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.hours-error-message {
  font-size: 0.875rem;
  color: #ff8888;
}

/* Container */
.hours-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.hours-day-card {
  background: #0a0a0a;
  border: 1px solid #151515;
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: border-color var(--dur-fast), background var(--dur-fast);
}

.hours-day-card:hover {
  border-color: #222;
}

.hours-day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hours-day-name {
  font-size: 1rem;
  font-weight: 600;
  color: #e8e8e8;
}

.hours-closed-state {
  padding: 0.75rem 1rem;
  background: #111;
  border-radius: var(--radius-md);
  color: #888;
  font-size: 0.875rem;
  text-align: center;
  font-style: italic;
}

.hours-time-inputs {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
}

.hours-time-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex: 1;
}

.hours-time-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.hours-time-input {
  background: #111;
  border: 1px solid #222;
  border-radius: var(--radius-md);
  padding: 0.625rem 0.75rem;
  color: #e8e8e8;
  font-size: 1rem;
  font-weight: 500;
  font-family: 'Monaco', 'Courier New', monospace;
  outline: none;
  transition: border-color var(--dur-fast), background var(--dur-fast);
  cursor: pointer;
}

.hours-time-input:hover {
  border-color: #333;
}

.hours-time-input:focus {
  border-color: var(--brand);
  background: #0d0d0d;
}

.hours-time-error {
  font-size: 0.65rem;
  color: #ff6b6b;
  margin-top: 0.25rem;
  font-weight: 500;
}

.hours-time-separator {
  color: #333;
  font-weight: 300;
  margin-bottom: 0.625rem;
  font-size: 1.25rem;
}

/* Actions */
.hours-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-start;
}

/* Success message */
.hours-success {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  background: #0a2a0a;
  border: 1px solid #1a5a1a;
  border-radius: var(--radius-md);
  color: var(--brand);
  font-size: 0.875rem;
  font-weight: 500;
  animation: slideIn 0.3s ease-out;
}

.hours-success-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Save button */
.hours-save-btn {
  min-width: 200px;
  padding: 0.875rem 2rem;
  background: var(--brand);
  border: none;
  border-radius: var(--radius-md);
  color: #000;
  font-weight: 700;
  font-size: 0.9375rem;
  font-family: inherit;
  cursor: pointer;
  transition: opacity var(--dur-fast), transform var(--dur-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.hours-save-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.hours-save-btn:active:not(:disabled) {
  transform: translateY(0);
}

.hours-save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.hours-btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #00000033;
  border-top-color: #000;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Toggle styles */
.owner-toggle {
  position: relative;
  width: 40px;
  height: 24px;
  cursor: pointer;
  flex-shrink: 0;
}

.owner-toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.owner-toggle-track {
  position: absolute;
  inset: 0;
  background: #222;
  border-radius: 99px;
  transition: background var(--dur-fast);
  border: 1px solid #333;
}

.owner-toggle input:checked + .owner-toggle-track {
  background: var(--brand);
  border-color: var(--brand);
}

.owner-toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  background: #fff;
  border-radius: 50%;
  transition: transform var(--dur-fast);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.owner-toggle input:checked ~ .owner-toggle-thumb {
  transform: translateX(16px);
}

/* Responsive */
@media (max-width: 640px) {
  .hours-view {
    padding: 1.5rem;
  }

  .hours-container {
    grid-template-columns: 1fr;
  }

  .hours-day-card {
    padding: 1.25rem;
  }

  .hours-time-inputs {
    flex-direction: column;
    gap: 0.75rem;
  }

  .hours-time-separator {
    display: none;
  }

  .hours-save-btn {
    width: 100%;
  }
}
</style>
