<script setup lang="ts">
import { ExploreCard } from '@/components/restaurant'
import { useExploreView } from './scripts/ExploreView'

const {
  loading,
  total,
  totalPages,
  page,
  searchQuery,
  activeSort,
  selectedCuisineId,
  selectedPriceRangeId,
  cuisines,
  priceRanges,
  restaurants,
  sortOptions,
  handleSearch,
  selectCuisine,
  selectPrice,
  setSort,
  goToPage,
} = useExploreView()
</script>

<template>
  <div class="explore-view">
    <!-- Sidebar -->
    <aside class="explore-sidebar">
      <!-- Cuisine filter -->
      <div class="explore-sidebar-section">
        <div class="explore-sidebar-label">Cocina</div>
        <div class="explore-filter-list">
          <button
            :class="['explore-filter-item', !selectedCuisineId && 'explore-filter-item--active']"
            @click="selectCuisine(null)"
          >
            Todas
          </button>
          <button
            v-for="cuisine in cuisines"
            :key="cuisine.id"
            :class="['explore-filter-item', selectedCuisineId === cuisine.id && 'explore-filter-item--active']"
            @click="selectCuisine(cuisine.id)"
          >
            {{ cuisine.label }}
          </button>
        </div>
      </div>

      <!-- Price filter -->
      <div class="explore-sidebar-section">
        <div class="explore-sidebar-label">Precio</div>
        <div class="explore-price-row">
          <button
            :class="['explore-price-btn', !selectedPriceRangeId && 'explore-price-btn--active']"
            @click="selectPrice(null)"
          >
            Todos
          </button>
          <button
            v-for="pr in priceRanges"
            :key="pr.id"
            :class="['explore-price-btn', selectedPriceRangeId === pr.id && 'explore-price-btn--active']"
            @click="selectPrice(pr.id)"
          >
            {{ pr.label }}
          </button>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <main class="explore-main">
      <!-- Top bar -->
      <div class="explore-top-bar">
        <form class="explore-search-form" @submit="handleSearch">
          <input
            v-model="searchQuery"
            class="explore-search-input"
            type="text"
            placeholder="Buscar restaurante, cocina…"
          />
          <button class="explore-search-btn" type="submit">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </button>
        </form>

        <div class="explore-sort-row">
          <button
            v-for="opt in sortOptions"
            :key="opt.value"
            :class="['explore-sort-btn', opt.value === activeSort && 'explore-sort-btn--active']"
            @click="setSort(opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- Results -->
      <div v-if="loading" class="explore-loading">Cargando restaurantes…</div>
      <template v-else>
        <p class="explore-results-count">{{ total }} resultado{{ total !== 1 ? 's' : '' }}</p>
        <div v-if="restaurants.length === 0" class="explore-empty">
          <p>Sin resultados para tu búsqueda.</p>
          <p class="explore-empty-hint">Probá con otra cocina o quitá los filtros.</p>
        </div>
        <div v-else class="explore-grid">
          <ExploreCard
            v-for="(restaurant, i) in restaurants"
            :key="restaurant.id"
            :restaurant="restaurant"
            :index="i"
          />
        </div>

        <div v-if="totalPages > 1" class="explore-pagination">
          <button
            class="explore-page-btn"
            :disabled="page <= 1"
            @click="goToPage(page - 1)"
          >
            ←
          </button>
          <span class="explore-page-info">{{ page }} / {{ totalPages }}</span>
          <button
            class="explore-page-btn"
            :disabled="page >= totalPages"
            @click="goToPage(page + 1)"
          >
            →
          </button>
        </div>
      </template>
    </main>
  </div>
</template>

<style src="./styles/ExploreView.css" scoped></style>
