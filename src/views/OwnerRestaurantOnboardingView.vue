<script setup lang="ts">
import { useOwnerRestaurantOnboardingView } from './scripts/OwnerRestaurantOnboardingView'

const {
  loadingLookups,
  submitLoading,
  submitError,
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
  submit,
  toggleCuisine,
  isCuisineSelected,
} = useOwnerRestaurantOnboardingView()
</script>

<template>
  <div class="onboarding-restaurant-page">
    <div class="onboarding-restaurant-card">
      <span class="onboarding-restaurant-logo">Abricot</span>
      <h1 class="onboarding-restaurant-title">Registrá tu restaurante</h1>
      <p class="onboarding-restaurant-hint">Completá los datos de tu local para acceder al panel de administración.</p>

      <div v-if="loadingLookups" class="onboarding-restaurant-loading">Cargando catálogos…</div>

      <form v-else class="rest-create-form" @submit.prevent="submit">
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

        <p v-if="submitError" class="rest-create-error" role="alert">{{ submitError }}</p>

        <button type="submit" class="rest-create-btn rest-create-btn--primary" :disabled="submitLoading">
          {{ submitLoading ? 'Creando…' : 'Crear restaurante' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.onboarding-restaurant-page {
  min-height: 100vh;
  background: var(--bg-base);
  display: grid;
  place-content: center;
  padding: 2rem 1.5rem;
}

.onboarding-restaurant-card {
  width: 100%;
  max-width: 560px;
  background: #050505;
  border: 1px solid #111;
  border-radius: var(--radius-lg);
  padding: 2rem 1.5rem;
}

.onboarding-restaurant-logo {
  display: block;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--brand);
  text-align: center;
  margin-bottom: 1.5rem;
}

.onboarding-restaurant-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ccc;
  margin: 0 0 0.5rem;
  text-align: center;
}

.onboarding-restaurant-hint {
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin: 0 0 1.5rem;
  text-align: center;
}

.onboarding-restaurant-loading {
  color: var(--text-muted);
  font-size: 0.875rem;
  text-align: center;
}

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
.rest-create-btn {
  margin-top: 0.5rem;
  padding: 0.625rem 1rem;
  font-size: 0.8125rem;
  font-weight: 600;
  border-radius: var(--radius-md);
  cursor: pointer;
  border: 1px solid var(--brand);
  background: var(--brand);
  color: #0a0a0a;
}
.rest-create-btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
