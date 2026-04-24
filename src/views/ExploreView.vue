<script setup lang="ts">
import { ExploreCard } from '@/components/restaurant'
import { useExploreView } from './scripts/ExploreView'

const {
  loading,
  searchQuery,
  activeSort,
  activeCuisine,
  activePrice,
  openNow,
  filtered,
  cuisineTags,
  priceOptions,
  sortOptions,
  handleSearch,
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
            v-for="tag in cuisineTags"
            :key="tag"
            :class="['explore-filter-item', tag === activeCuisine && 'explore-filter-item--active']"
            @click="activeCuisine = tag"
          >
            {{ tag }}
          </button>
        </div>
      </div>

      <!-- Price filter -->
      <div class="explore-sidebar-section">
        <div class="explore-sidebar-label">Precio</div>
        <div class="explore-price-row">
          <button
            v-for="p in priceOptions"
            :key="p"
            :class="['explore-price-btn', p === activePrice && 'explore-price-btn--active']"
            @click="activePrice = p"
          >
            {{ p }}
          </button>
        </div>
      </div>

      <!-- Open now toggle -->
      <div class="explore-sidebar-section">
        <div class="explore-toggle-row">
          <span class="explore-toggle-label">Abierto ahora</span>
          <label class="explore-toggle">
            <input v-model="openNow" type="checkbox" />
            <span class="explore-toggle-track" />
            <span class="explore-toggle-thumb" />
          </label>
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
            @click="activeSort = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- Results -->
      <div v-if="loading" class="explore-loading">Cargando restaurantes…</div>
      <template v-else>
        <p class="explore-results-count">{{ filtered.length }} resultados</p>
        <div v-if="filtered.length === 0" class="explore-empty">
          <p>Sin resultados para tu búsqueda.</p>
          <p class="explore-empty-hint">Probá con otra cocina o quitá los filtros.</p>
        </div>
        <div v-else class="explore-grid">
          <ExploreCard
            v-for="(restaurant, i) in filtered"
            :key="restaurant.id"
            :restaurant="restaurant"
            :index="i"
          />
        </div>
      </template>
    </main>
  </div>
</template>

<style src="./styles/ExploreView.css" scoped></style>
