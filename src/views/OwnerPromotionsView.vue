<script setup lang="ts">
import { useOwnerPromotionsView } from './scripts/OwnerPromotionsView'

const {
  promotions,
  loading,
  menuPickItems,
  menuPickLoading,
  showForm,
  formSubmitting,
  formError,
  formTitle,
  formDescription,
  formDiscountType,
  formDiscountValue,
  formStartDate,
  formEndDate,
  formNotifyUsers,
  discountTypeLabels,
  discountTypes,
  discountDisplay,
  formatDate,
  toggleMenuItem,
  isMenuItemSelected,
  submitCreate,
  removePromotion,
  menuItemSummary,
  openForm,
  closeForm,
} = useOwnerPromotionsView()
</script>

<template>
  <div class="owner-promos-view">
    <div class="owner-promos-head">
      <div>
        <h1 class="owner-sub-title">Promociones</h1>
        <p class="owner-sub-desc">
          Creá ofertas takeout. Para modificar una existente, eliminá y volvé a crear (la API no expone edición).
        </p>
      </div>
      <button type="button" class="owner-promos-new-btn" @click="openForm">+ Nueva promoción</button>
    </div>

    <div v-if="showForm" class="owner-promos-form-card">
      <div class="owner-promos-form-head">
        <h2 class="owner-promos-form-title">Nueva promoción</h2>
        <button type="button" class="owner-promos-form-close" @click="closeForm">Cerrar</button>
      </div>

      <div class="owner-promos-form-grid">
        <label class="owner-promos-field">
          <span>Título *</span>
          <input v-model="formTitle" type="text" maxlength="200" placeholder="Ej. 20% en bebidas" />
        </label>
        <label class="owner-promos-field owner-promos-field--full">
          <span>Descripción</span>
          <textarea v-model="formDescription" rows="2" placeholder="Opcional" />
        </label>
        <label class="owner-promos-field">
          <span>Tipo de descuento *</span>
          <select v-model="formDiscountType">
            <option v-for="t in discountTypes" :key="t" :value="t">{{ discountTypeLabels[t] }}</option>
          </select>
        </label>
        <label class="owner-promos-field">
          <span>Valor * (numérico, ≥ 0)</span>
          <input v-model="formDiscountValue" type="text" placeholder="15.00" />
        </label>
        <label class="owner-promos-field">
          <span>Inicio * (YYYY-MM-DD)</span>
          <input v-model="formStartDate" type="date" />
        </label>
        <label class="owner-promos-field">
          <span>Fin *</span>
          <input v-model="formEndDate" type="date" />
        </label>
        <label class="owner-promos-field owner-promos-field--checkbox">
          <input v-model="formNotifyUsers" type="checkbox" />
          <span>Notificar usuarios con preferencia de promos</span>
        </label>
      </div>

      <div class="owner-promos-menu-section">
        <div class="owner-promos-menu-title">Platos en alcance (opcional)</div>
        <p class="owner-promos-menu-hint">
          Si no marcás ninguno, el backend aplica la regla general del local. Los UUID deben ser ítems de este restaurante.
        </p>
        <div v-if="menuPickLoading" class="owner-promos-menu-loading">Cargando carta…</div>
        <div v-else-if="menuPickItems.length === 0" class="owner-promos-menu-empty">No hay ítems en la carta.</div>
        <div v-else class="owner-promos-menu-chips">
          <label
            v-for="it in menuPickItems"
            :key="it.id"
            class="owner-promos-chip"
          >
            <input
              type="checkbox"
              :checked="isMenuItemSelected(it.id)"
              @change="toggleMenuItem(it.id)"
            />
            <span>{{ it.name }}</span>
          </label>
        </div>
      </div>

      <p v-if="formError" class="owner-promos-form-error">{{ formError }}</p>
      <div class="owner-promos-form-actions">
        <button type="button" class="owner-promos-submit" :disabled="formSubmitting" @click="submitCreate">
          {{ formSubmitting ? 'Creando…' : 'Crear promoción' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="owner-promos-loading">Cargando…</div>
    <div v-else-if="promotions.length === 0" class="owner-promos-empty">
      Sin promociones configuradas.
    </div>
    <div v-else class="promos-list">
      <div
        v-for="p in promotions"
        :key="p.id"
        :class="['promo-card', !p.isActive && 'promo-card--inactive']"
      >
        <div class="promo-card-top">
          <div>
            <div class="promo-card-title">{{ p.title }}</div>
            <div class="promo-card-dates">{{ formatDate(p.startDate) }} — {{ formatDate(p.endDate) }}</div>
            <div class="promo-card-scope">{{ menuItemSummary(p) }}</div>
          </div>
          <div class="promo-card-discount">{{ discountDisplay(p) }}</div>
        </div>
        <p v-if="p.description" class="promo-card-desc">{{ p.description }}</p>
        <div class="promo-card-footer">
          <div class="promo-card-meta">
            <span class="promo-badge" :class="p.isActive ? 'promo-badge--on' : 'promo-badge--off'">
              {{ p.isActive ? 'Activa' : 'Inactiva' }}
            </span>
            <span class="promo-card-notify">
              Notificar: {{ p.notifyUsers ? 'Sí' : 'No' }}
            </span>
          </div>
          <button type="button" class="promo-delete-btn" @click="removePromotion(p)">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.owner-promos-view { padding: 2.5rem; }
.owner-promos-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}
.owner-sub-title { font-size: 1.5rem; font-weight: 700; color: #ccc; margin: 0 0 0.375rem; letter-spacing: -0.02em; }
.owner-sub-desc { font-size: 0.8125rem; color: #2a2a2a; margin: 0; max-width: 36rem; line-height: 1.5; }
.owner-promos-new-btn {
  font-family: inherit;
  font-size: 0.8125rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(249, 115, 22, 0.4);
  background: rgba(249, 115, 22, 0.08);
  color: var(--brand);
  cursor: pointer;
  white-space: nowrap;
}
.owner-promos-new-btn:hover { background: rgba(249, 115, 22, 0.14); }

.owner-promos-form-card {
  background: #060606;
  border: 1px solid #0d0d0d;
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 2rem;
}
.owner-promos-form-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}
.owner-promos-form-title { font-size: 1rem; font-weight: 700; color: #aaa; margin: 0; }
.owner-promos-form-close {
  font-family: inherit;
  font-size: 0.75rem;
  color: #666;
  background: none;
  border: none;
  cursor: pointer;
}
.owner-promos-form-close:hover { color: #999; }

.owner-promos-form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}
.owner-promos-field { display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.75rem; color: #555; }
.owner-promos-field--full { grid-column: 1 / -1; }
.owner-promos-field--checkbox { flex-direction: row; align-items: center; gap: 0.5rem; grid-column: 1 / -1; }
.owner-promos-field input,
.owner-promos-field select,
.owner-promos-field textarea {
  font-family: inherit;
  font-size: 0.8125rem;
  padding: 0.5rem 0.65rem;
  border-radius: var(--radius-sm);
  border: 1px solid #1a1a1a;
  background: #0a0a0a;
  color: #ccc;
}
.owner-promos-menu-section {
  margin-top: 1.25rem;
  padding-top: 1.25rem;
  border-top: 1px solid #0a0a0a;
}
.owner-promos-menu-title { font-size: 0.8125rem; font-weight: 600; color: #888; margin-bottom: 0.35rem; }
.owner-promos-menu-hint { font-size: 0.6875rem; color: #444; margin: 0 0 0.75rem; line-height: 1.45; }
.owner-promos-menu-loading,
.owner-promos-menu-empty { font-size: 0.75rem; color: #444; }
.owner-promos-menu-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  max-height: 180px;
  overflow-y: auto;
}
.owner-promos-chip {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.6875rem;
  color: #666;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  border: 1px solid #141414;
  cursor: pointer;
}
.owner-promos-chip input { accent-color: var(--brand); }

.owner-promos-form-error { font-size: 0.75rem; color: var(--danger, #ef4444); margin: 1rem 0 0; }
.owner-promos-form-actions { margin-top: 1rem; }
.owner-promos-submit {
  font-family: inherit;
  font-size: 0.8125rem;
  padding: 0.5rem 1.25rem;
  border-radius: var(--radius-sm);
  border: none;
  background: var(--brand);
  color: #000;
  font-weight: 600;
  cursor: pointer;
}
.owner-promos-submit:disabled { opacity: 0.5; cursor: not-allowed; }

.owner-promos-loading,
.owner-promos-empty { color: #2a2a2a; font-size: 0.875rem; padding: 2rem 0; }

.promos-list { display: flex; flex-direction: column; gap: 10px; }
.promo-card { background: #060606; border: 1px solid #0d0d0d; border-radius: var(--radius-lg); padding: 1.25rem; transition: opacity var(--dur-fast); }
.promo-card--inactive { opacity: 0.55; }
.promo-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; gap: 1rem; }
.promo-card-title { font-size: 1rem; font-weight: 600; color: #bbb; margin-bottom: 2px; }
.promo-card-dates { font-size: 0.75rem; color: #2a2a2a; }
.promo-card-scope { font-size: 0.6875rem; color: #444; margin-top: 0.35rem; }
.promo-card-discount { font-size: 1.25rem; font-weight: 800; color: var(--brand); letter-spacing: -0.02em; white-space: nowrap; }
.promo-card-desc { font-size: 0.8125rem; color: #2a2a2a; line-height: 1.6; margin: 0 0 0.875rem; }
.promo-card-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 0.75rem; border-top: 1px solid #0a0a0a; gap: 1rem; flex-wrap: wrap; }
.promo-card-meta { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
.promo-badge { font-size: 0.5625rem; letter-spacing: 0.08em; text-transform: uppercase; padding: 3px 8px; border-radius: 99px; }
.promo-badge--on { color: #22c55e; background: rgba(34, 197, 94, 0.08); border: 1px solid rgba(34, 197, 94, 0.2); }
.promo-badge--off { color: #888; background: #0a0a0a; border: 1px solid #111; }
.promo-card-notify { font-size: 0.75rem; color: #2a2a2a; }
.promo-delete-btn {
  font-family: inherit;
  font-size: 0.6875rem;
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.06);
  color: #f87171;
  cursor: pointer;
}
.promo-delete-btn:hover { background: rgba(239, 68, 68, 0.12); }
</style>
