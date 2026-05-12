<script setup lang="ts">
import BaseModal from '@/components/base/BaseModal.vue'
import { useRestaurantsView } from './scripts/RestaurantsView'

const {
  restaurants,
  loading,
  colorBg,
  navigate,
  showCreate,
  createLoading,
  createError,
  countries,
  provinces,
  cities,
  neighbourhoods,
  cuisines,
  priceRanges,
  selectedCountryId,
  selectedProvinceId,
  selectedCityId,
  selectedNeighbourhoodId,
  selectedPriceRangeId,
  formName,
  formAddress,
  formPhone,
  formEmail,
  formDescription,
  openCreate,
  closeCreate,
  submitCreate,
  toggleCuisine,
  isCuisineSelected,
} = useRestaurantsView()
</script>

<template>
  <div class="restaurants-view">
    <div class="restaurants-view-head">
      <div class="restaurants-view-header">
        <h1 class="restaurants-view-title">Mis restaurantes</h1>
        <p class="restaurants-view-sub">Seleccioná un local para ver su panel de control.</p>
      </div>
      <button type="button" class="restaurants-view-new-btn" @click="openCreate">
        + Crear restaurante
      </button>
    </div>

    <div v-if="loading" style="color:var(--text-muted);font-size:0.875rem">Cargando…</div>
    <div v-else-if="restaurants.length === 0" class="restaurants-view-empty">
      <p>No tenés restaurantes asociados a tu cuenta.</p>
      <button type="button" class="restaurants-view-new-btn restaurants-view-new-btn--inline" @click="openCreate">
        Crear tu primer restaurante
      </button>
    </div>
    <div v-else class="restaurants-grid">
      <div
        v-for="r in restaurants"
        :key="r.id"
        class="restaurant-owner-card"
        @click="navigate(r.id as string)"
      >
        <div
          class="restaurant-owner-card-img"
          :style="{
            background: r.photoUrl
              ? `url(${r.photoUrl}) center/cover`
              : colorBg(r.id as string),
          }"
        />
        <div class="restaurant-owner-card-body">
          <div class="restaurant-owner-card-name">{{ r.name }}</div>
          <div class="restaurant-owner-card-meta">
            {{ r.cuisineTypes?.[0]?.label ?? '' }}
            <span v-if="r.address"> · {{ r.address }}</span>
          </div>
          <div class="restaurant-owner-card-arrow">Ver panel →</div>
        </div>
      </div>
    </div>

    <BaseModal v-if="showCreate" wide @close="closeCreate">
      <div class="rest-create-modal">
        <h2 class="rest-create-title">Nuevo restaurante</h2>
        <p class="rest-create-hint">Los campos con * son obligatorios.</p>

        <form class="rest-create-form" @submit.prevent="submitCreate">
          <label class="rest-create-field">
            <span>Nombre *</span>
            <input v-model="formName" type="text" autocomplete="organization" maxlength="200" />
          </label>
          <label class="rest-create-field rest-create-field--full">
            <span>Dirección *</span>
            <input v-model="formAddress" type="text" autocomplete="street-address" maxlength="500" />
          </label>
          <label class="rest-create-field">
            <span>Teléfono *</span>
            <input v-model="formPhone" type="tel" autocomplete="tel" />
          </label>
          <label class="rest-create-field">
            <span>Email</span>
            <input v-model="formEmail" type="email" autocomplete="email" />
          </label>
          <label class="rest-create-field rest-create-field--full">
            <span>Descripción</span>
            <textarea v-model="formDescription" rows="2" maxlength="2000" placeholder="Opcional" />
          </label>

          <div class="rest-create-row">
            <label class="rest-create-field">
              <span>País *</span>
              <select v-model="selectedCountryId">
                <option value="">Seleccioná…</option>
                <option v-for="c in countries" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </label>
            <label class="rest-create-field">
              <span>Provincia *</span>
              <select v-model="selectedProvinceId" :disabled="!selectedCountryId">
                <option value="">Seleccioná…</option>
                <option v-for="p in provinces" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
            </label>
          </div>
          <label class="rest-create-field rest-create-field--full">
            <span>Ciudad *</span>
            <select v-model="selectedCityId" :disabled="!selectedProvinceId">
              <option value="">Seleccioná…</option>
              <option v-for="ci in cities" :key="ci.id" :value="ci.id">{{ ci.name }}</option>
            </select>
          </label>
          <label v-if="neighbourhoods.length" class="rest-create-field rest-create-field--full">
            <span>Barrio</span>
            <select v-model="selectedNeighbourhoodId">
              <option value="">Opcional</option>
              <option v-for="n in neighbourhoods" :key="n.id" :value="n.id">{{ n.name }}</option>
            </select>
          </label>
          <label class="rest-create-field rest-create-field--full">
            <span>Rango de precios</span>
            <select v-model="selectedPriceRangeId">
              <option value="">Opcional</option>
              <option v-for="pr in priceRanges" :key="pr.id" :value="pr.id">{{ pr.label }}</option>
            </select>
          </label>

          <div v-if="cuisines.length" class="rest-create-cuisines">
            <span class="rest-create-cuisines-label">Tipos de cocina</span>
            <div class="rest-create-cuisines-list">
              <label v-for="cu in cuisines" :key="cu.id" class="rest-create-cuisine">
                <input
                  type="checkbox"
                  :checked="isCuisineSelected(cu.id as string)"
                  @change="toggleCuisine(cu.id as string)"
                />
                <span>{{ cu.label }}</span>
              </label>
            </div>
          </div>

          <p v-if="createError" class="rest-create-error">{{ createError }}</p>

          <div class="rest-create-actions">
            <button type="button" class="rest-create-btn rest-create-btn--ghost" :disabled="createLoading" @click="closeCreate">
              Cancelar
            </button>
            <button type="submit" class="rest-create-btn rest-create-btn--primary" :disabled="createLoading">
              {{ createLoading ? 'Creando…' : 'Crear' }}
            </button>
          </div>
        </form>
      </div>
    </BaseModal>
  </div>
</template>

<style scoped>
.restaurants-view { padding: 2.5rem; }
.restaurants-view-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
}
.restaurants-view-header { margin: 0; }
.restaurants-view-title { font-size: 1.5rem; font-weight: 700; color: #ccc; margin: 0 0 0.375rem; letter-spacing: -0.02em; }
.restaurants-view-sub { font-size: 0.8125rem; color: var(--text-muted); margin: 0; }
.restaurants-view-new-btn {
  flex-shrink: 0;
  padding: 0.625rem 1rem;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--brand);
  background: rgba(249, 115, 22, 0.08);
  border: 1px solid rgba(249, 115, 22, 0.35);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background var(--dur-fast), border-color var(--dur-fast);
}
.restaurants-view-new-btn:hover:not(:disabled) {
  background: rgba(249, 115, 22, 0.14);
  border-color: rgba(249, 115, 22, 0.5);
}
.restaurants-view-new-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.restaurants-view-new-btn--inline { margin-top: 0.75rem; }
.restaurants-view-empty {
  color: var(--text-muted);
  font-size: 0.875rem;
  padding: 2rem 0;
}
.restaurants-view-empty p { margin: 0; }
.restaurants-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
.restaurant-owner-card { background: #060606; border: 1px solid #0d0d0d; border-radius: var(--radius-lg); overflow: hidden; cursor: pointer; transition: border-color var(--dur-fast); }
.restaurant-owner-card:hover { border-color: #1a1a1a; }
.restaurant-owner-card-img { height: 160px; }
.restaurant-owner-card-body { padding: 1.125rem; }
.restaurant-owner-card-name { font-size: 1rem; font-weight: 600; color: #bbb; margin-bottom: 4px; }
.restaurant-owner-card-meta { font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 1rem; }
.restaurant-owner-card-arrow { font-size: 0.75rem; color: var(--brand); letter-spacing: 0.04em; }

.rest-create-modal { padding: 1.75rem 1.5rem 1.5rem; max-height: 85vh; overflow-y: auto; }
.rest-create-title { font-size: 1.125rem; font-weight: 700; color: #bbb; margin: 0 0 0.25rem; letter-spacing: -0.02em; }
.rest-create-hint { font-size: 0.75rem; color: var(--text-muted); margin: 0 0 1.25rem; }
.rest-create-form { display: flex; flex-direction: column; gap: 0.875rem; }
.rest-create-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem; }
@media (max-width: 520px) { .rest-create-row { grid-template-columns: 1fr; } }
.rest-create-field { display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.6875rem; color: var(--text-muted); letter-spacing: 0.06em; text-transform: uppercase; }
.rest-create-field--full { grid-column: 1 / -1; }
.rest-create-field input,
.rest-create-field select,
.rest-create-field textarea {
  padding: 0.5rem 0.65rem;
  font-size: 0.875rem;
  color: #ccc;
  background: #111;
  border: 1px solid #222;
  border-radius: var(--radius-sm);
  font-family: inherit;
}
.rest-create-field textarea { resize: vertical; min-height: 3rem; }
.rest-create-field select:disabled { opacity: 0.45; }
.rest-create-cuisines { margin-top: 0.25rem; }
.rest-create-cuisines-label { display: block; font-size: 0.6875rem; color: var(--text-muted); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 0.5rem; }
.rest-create-cuisines-list {
  display: flex; flex-wrap: wrap; gap: 0.5rem 1rem;
  max-height: 140px; overflow-y: auto; padding: 0.5rem;
  background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: var(--radius-sm);
}
.rest-create-cuisine {
  display: flex; align-items: center; gap: 0.35rem;
  font-size: 0.8125rem; color: #888; text-transform: none; letter-spacing: normal; cursor: pointer;
}
.rest-create-cuisine input { accent-color: var(--brand); }
.rest-create-error { font-size: 0.8125rem; color: #f87171; margin: 0.25rem 0 0; }
.rest-create-actions {
  display: flex; justify-content: flex-end; gap: 0.75rem;
  margin-top: 0.5rem; padding-top: 1rem; border-top: 1px solid #1a1a1a;
}
.rest-create-btn {
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
  font-weight: 600;
  border-radius: var(--radius-md);
  cursor: pointer;
  border: 1px solid transparent;
  transition: opacity var(--dur-fast);
}
.rest-create-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.rest-create-btn--ghost { background: transparent; color: var(--text-muted); border-color: #333; }
.rest-create-btn--ghost:hover:not(:disabled) { color: var(--text-secondary); border-color: #444; }
.rest-create-btn--primary { background: var(--brand); color: #0a0a0a; border-color: var(--brand); }
.rest-create-btn--primary:hover:not(:disabled) { filter: brightness(1.05); }
</style>
