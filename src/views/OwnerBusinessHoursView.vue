<script setup lang="ts">
import { useOwnerBusinessHoursView } from './scripts/OwnerBusinessHoursView'

const {
  days,
  loading,
  saving,
  success,
  isValid,
  loadError,
  saveError,
  addRange,
  removeRange,
  toggleDay,
  save,
} = useOwnerBusinessHoursView()
</script>

<template>
  <div class="hours-view">
    <h1 class="owner-sub-title">Horarios</h1>
    <p class="owner-sub-desc">
      Configurá los tramos de apertura de cada día. Podés agregar varios turnos por día
      (por ejemplo, almuerzo y cena).
    </p>

    <div v-if="loading" class="hours-loading">
      <div class="hours-spinner" />
      <span>Cargando horarios…</span>
    </div>

    <div v-else-if="loadError" class="hours-error">
      <span class="hours-error-icon">⚠</span>
      <div>
        <div class="hours-error-title">Error</div>
        <div class="hours-error-message">{{ loadError }}</div>
      </div>
    </div>

    <template v-else>
      <div class="hours-container">
        <div
          v-for="day in days"
          :key="day.dayOfWeek"
          class="hours-day-card"
          :class="{ 'hours-day-card--open': !day.isClosed }"
        >
          <!-- Day header with toggle -->
          <div class="hours-day-header">
            <div class="hours-day-name">{{ day.dayName }}</div>
            <label class="owner-toggle">
              <input
                type="checkbox"
                :checked="!day.isClosed"
                @change="toggleDay(day)"
              />
              <span class="owner-toggle-track" />
              <span class="owner-toggle-thumb" />
            </label>
          </div>

          <!-- Closed -->
          <div v-if="day.isClosed" class="hours-closed-state">Cerrado</div>

          <!-- Open: list of ranges -->
          <template v-else>
            <div
              v-for="(range, idx) in day.ranges"
              :key="idx"
              class="hours-range-row"
            >
              <div class="hours-time-group">
                <label class="hours-time-label">Apertura</label>
                <input
                  v-model="range.opensAt"
                  class="hours-time-input"
                  type="time"
                />
              </div>
              <span class="hours-time-separator">—</span>
              <div class="hours-time-group">
                <label class="hours-time-label">Cierre</label>
                <input
                  v-model="range.closesAt"
                  class="hours-time-input"
                  type="time"
                />
              </div>
              <button
                v-if="day.ranges.length > 1"
                class="hours-range-remove"
                type="button"
                title="Eliminar tramo"
                @click="removeRange(day, idx)"
              >
                ×
              </button>
            </div>

            <button
              class="hours-add-range-btn"
              type="button"
              @click="addRange(day)"
            >
              + Agregar tramo
            </button>
          </template>
        </div>
      </div>

      <!-- Actions -->
      <div class="hours-actions">
        <div v-if="saveError" class="hours-error hours-error--inline">
          <span class="hours-error-icon">⚠</span>
          <div>
            <div class="hours-error-title">No se pudo guardar</div>
            <div class="hours-error-message">{{ saveError }}</div>
          </div>
        </div>
        <div v-if="success" class="hours-success">
          <span class="hours-success-icon">✓</span>
          <span>Horarios guardados correctamente</span>
        </div>
        <button
          class="hours-save-btn"
          :disabled="saving || !isValid"
          :title="!isValid ? 'Completá los tramos con horarios válidos' : ''"
          @click="save"
        >
          <span v-if="saving" class="hours-btn-spinner" />
          {{ saving ? 'Guardando…' : 'Guardar horarios' }}
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.hours-view {
  padding: 2.5rem;
  max-width: 720px;
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

/* Loading */
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

@keyframes spin { to { transform: rotate(360deg); } }

/* Error */
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
.hours-error-icon { font-size: 1.5rem; flex-shrink: 0; }
.hours-error-title { font-weight: 600; margin-bottom: 0.25rem; }
.hours-error-message { font-size: 0.875rem; color: #ff8888; }
.hours-error--inline { margin-bottom: 0; }

/* Day grid */
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
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  transition: border-color var(--dur-fast);
}
.hours-day-card--open { border-color: #1a1a1a; }
.hours-day-card:hover { border-color: #222; }

.hours-day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.hours-day-name { font-size: 1rem; font-weight: 600; color: #e8e8e8; }

/* Closed pill */
.hours-closed-state {
  padding: 0.625rem 1rem;
  background: #111;
  border-radius: var(--radius-md);
  color: #555;
  font-size: 0.8125rem;
  text-align: center;
  font-style: italic;
}

/* Range row */
.hours-range-row {
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  padding-right: 36px; /* reserve space for the remove button without shrinking inputs */
}

.hours-time-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1;
}

.hours-time-label {
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.hours-time-input {
  background: #111;
  border: 1px solid #222;
  border-radius: var(--radius-sm);
  padding: 0.5rem 0.625rem;
  color: #e8e8e8;
  font-size: 0.9375rem;
  font-weight: 500;
  font-family: 'Monaco', 'Courier New', monospace;
  outline: none;
  width: 100%;
  transition: border-color var(--dur-fast);
  cursor: pointer;
}
.hours-time-input:hover { border-color: #333; }
.hours-time-input:focus { border-color: var(--brand); background: #0d0d0d; }

.hours-time-separator {
  color: #333;
  font-weight: 300;
  font-size: 1.125rem;
  padding-bottom: 0.5rem;
  flex-shrink: 0;
}

.hours-range-remove {
  position: absolute;
  right: 0;
  bottom: 1px;
  background: transparent;
  border: 1px solid #2a1515;
  color: #884444;
  border-radius: var(--radius-sm);
  width: 28px;
  height: 28px;
  font-size: 1.125rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 2px;
  transition: background var(--dur-fast), border-color var(--dur-fast), color var(--dur-fast);
}
.hours-range-remove:hover { background: #2a1010; border-color: #aa3333; color: #ff6b6b; }

.hours-add-range-btn {
  background: transparent;
  border: 1px dashed #252525;
  color: #555;
  border-radius: var(--radius-md);
  padding: 0.5rem 0.875rem;
  font-size: 0.75rem;
  font-family: inherit;
  cursor: pointer;
  transition: color var(--dur-fast), border-color var(--dur-fast);
  align-self: flex-start;
}
.hours-add-range-btn:hover { color: var(--brand); border-color: rgba(249,115,22,0.4); }

/* Actions */
.hours-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-start;
}

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
.hours-success-icon { font-size: 1.25rem; flex-shrink: 0; }

@keyframes slideIn {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}

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
.hours-save-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
.hours-save-btn:active:not(:disabled) { transform: translateY(0); }
.hours-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.hours-btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #00000033;
  border-top-color: #000;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Toggle */
.owner-toggle {
  position: relative;
  width: 40px;
  height: 24px;
  cursor: pointer;
  flex-shrink: 0;
}
.owner-toggle input { opacity: 0; width: 0; height: 0; }
.owner-toggle-track {
  position: absolute;
  inset: 0;
  background: #222;
  border-radius: 99px;
  transition: background var(--dur-fast);
  border: 1px solid #333;
}
.owner-toggle input:checked + .owner-toggle-track { background: var(--brand); border-color: var(--brand); }
.owner-toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  background: #fff;
  border-radius: 50%;
  transition: transform var(--dur-fast);
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}
.owner-toggle input:checked ~ .owner-toggle-thumb { transform: translateX(16px); }

@media (max-width: 640px) {
  .hours-view { padding: 1.5rem; }
  .hours-container { grid-template-columns: 1fr; }
  .hours-day-card { padding: 1.125rem; }
  .hours-range-row { flex-wrap: wrap; gap: 0.5rem; }
  .hours-time-separator { display: none; }
  .hours-save-btn { width: 100%; }
}
</style>
