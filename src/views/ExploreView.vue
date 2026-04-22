<script setup lang="ts">
import type { Restaurant } from '@/types'
import { useExploreView } from './scripts/ExploreView'

const {
  RouterLink,
  PublicMarketingNav,
  t,
  cuisines,
  priceRanges,
  lookupsError,
  searchInput,
  sortBy,
  sortOptions,
  perPage,
  perPageOptions,
  viewMode,
  restaurants,
  total,
  loading,
  error,
  nameFilter,
  resultsSummary,
  submitSearch,
  clearFilters,
  retryFetch,
  togglePriceRange,
  toggleCuisine,
  isPriceSelected,
  isCuisineSelected,
  loadMore,
  BaseButton,
  BaseSpinner,
  EmptyState,
  Grid3x3,
  List,
} = useExploreView()

function cuisineLine(r: Restaurant): string {
  return r.cuisineTypes.map((c) => c.label).join(' · ')
}

function locationLine(r: Restaurant): string {
  const n = r.neighbourhood?.name
  return n ? `${n} · ${r.city.name}` : r.city.name
}

function metaLine(r: Restaurant): string {
  const c = cuisineLine(r)
  const loc = locationLine(r)
  return c ? `${c} · ${loc}` : loc
}
</script>

<template>
  <div class="explore-page">
    <PublicMarketingNav />

    <div class="explore-layout">
      <aside class="explore-filters" aria-labelledby="explore-filters-heading">
        <div class="explore-filters-header">
          <h2 id="explore-filters-heading" class="explore-filters-title">{{ t('landing.discovery.filterTitle') }}</h2>
          <button type="button" class="explore-filters-clear" @click="clearFilters">
            {{ t('landing.discovery.clearFilters') }}
          </button>
        </div>
        <p v-if="lookupsError" class="explore-filters-warn">{{ t('explore.filtersUnavailable') }}</p>

        <fieldset v-if="priceRanges.length > 0" class="explore-fieldset">
          <legend class="explore-legend">{{ t('landing.discovery.priceTitle') }}</legend>
          <label v-for="pr in priceRanges" :key="pr.id" class="explore-check">
            <input
              type="checkbox"
              :checked="isPriceSelected(pr.id)"
              @change="togglePriceRange(pr.id)"
            />
            <span>{{ pr.label }}</span>
          </label>
        </fieldset>

        <fieldset v-if="cuisines.length > 0" class="explore-fieldset">
          <legend class="explore-legend">{{ t('landing.discovery.cuisineTitle') }}</legend>
          <label v-for="c in cuisines" :key="c.id" class="explore-check">
            <input
              type="checkbox"
              :checked="isCuisineSelected(c.id)"
              @change="toggleCuisine(c.id)"
            />
            <span>{{ c.label }}</span>
          </label>
        </fieldset>
      </aside>

      <div class="explore-main">
        <header class="explore-main-header">
          <h1 class="explore-main-title">{{ t('explore.title') }}</h1>
          <p v-if="nameFilter" class="explore-main-prefix">{{ t('explore.searchPrefix', { q: nameFilter }) }}</p>
        </header>

        <div class="explore-search-row">
          <div class="explore-search-bar">
            <input
              v-model="searchInput"
              type="search"
              class="explore-search-input"
              :placeholder="t('landing.hero.searchPlaceholder')"
              @keydown.enter.prevent="submitSearch"
            />
            <BaseButton variant="primary" type="button" class="explore-search-btn" @click="submitSearch">
              {{ t('landing.hero.searchAction') }}
            </BaseButton>
          </div>
        </div>

        <template v-if="error">
          <p class="explore-error">{{ error }}</p>
          <div class="explore-error-actions">
            <BaseButton variant="ghost" type="button" @click="retryFetch">{{ t('explore.retry') }}</BaseButton>
          </div>
        </template>

        <div v-else-if="loading" class="explore-loading">
          <BaseSpinner />
          <span>{{ t('explore.loading') }}</span>
        </div>

        <template v-else>
          <p class="explore-summary">{{ resultsSummary }}</p>

          <div class="explore-toolbar">
            <label class="explore-select-wrap">
              <span class="explore-select-label">{{ t('landing.discovery.sortBy') }}</span>
              <select v-model="sortBy" class="explore-select">
                <option v-for="o in sortOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
              </select>
            </label>
            <label class="explore-select-wrap">
              <span class="explore-select-label">{{ t('landing.discovery.perPage') }}</span>
              <select v-model.number="perPage" class="explore-select">
                <option v-for="o in perPageOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
              </select>
            </label>
            <div class="explore-view-toggle" role="group">
              <button
                type="button"
                class="explore-view-btn"
                :class="{ 'explore-view-btn--active': viewMode === 'grid' }"
                :title="t('landing.discovery.viewGrid')"
                @click="viewMode = 'grid'"
              >
                <Grid3x3 :size="18" />
              </button>
              <button
                type="button"
                class="explore-view-btn"
                :class="{ 'explore-view-btn--active': viewMode === 'list' }"
                :title="t('landing.discovery.viewList')"
                @click="viewMode = 'list'"
              >
                <List :size="18" />
              </button>
            </div>
          </div>

          <EmptyState
            v-if="restaurants.length === 0"
            :title="t('explore.empty')"
            :description="t('explore.emptyHint')"
          />

          <ul
            v-else
            class="explore-grid"
            :class="{ 'explore-grid--list': viewMode === 'list' }"
          >
            <li v-for="r in restaurants" :key="r.id" class="explore-card">
              <RouterLink :to="`/restaurants/${r.id}`" class="explore-card-link">
                <div class="explore-card-image">
                  <img v-if="r.photoUrl" :src="r.photoUrl" :alt="r.name" class="explore-card-img" />
                  <div v-else class="explore-card-placeholder">{{ r.name.charAt(0) }}</div>
                </div>
                <div class="explore-card-body">
                  <h2 class="explore-card-title">{{ r.name }}</h2>
                  <p class="explore-card-line">{{ metaLine(r) }}</p>
                  <p v-if="r.priceRange" class="explore-card-price">{{ r.priceRange.label }}</p>
                </div>
              </RouterLink>
            </li>
          </ul>

          <div v-if="restaurants.length > 0 && restaurants.length < total" class="explore-more">
            <BaseButton variant="ghost" type="button" @click="loadMore">{{ t('explore.loadMore') }}</BaseButton>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style src="./styles/ExploreView.css" scoped></style>
