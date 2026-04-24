<script setup lang="ts">
import { useRestaurantsView } from './scripts/RestaurantsView'

const { restaurants, loading, colorBg, navigate } = useRestaurantsView()
</script>

<template>
  <div class="restaurants-view">
    <div class="restaurants-view-header">
      <h1 class="restaurants-view-title">Mis restaurantes</h1>
      <p class="restaurants-view-sub">Seleccioná un local para ver su panel de control.</p>
    </div>

    <div v-if="loading" style="color:#2a2a2a;font-size:0.875rem">Cargando…</div>
    <div v-else-if="restaurants.length === 0" style="color:#2a2a2a;font-size:0.875rem;padding:2rem 0">
      No tenés restaurantes asociados a tu cuenta.
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
            {{ r.cuisineTypes[0]?.label ?? '' }}
            <span v-if="r.address"> · {{ r.address }}</span>
          </div>
          <div class="restaurant-owner-card-arrow">Ver panel →</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.restaurants-view { padding: 2.5rem; }
.restaurants-view-header { margin-bottom: 2rem; }
.restaurants-view-title { font-size: 1.5rem; font-weight: 700; color: #ccc; margin: 0 0 0.375rem; letter-spacing: -0.02em; }
.restaurants-view-sub { font-size: 0.8125rem; color: #2a2a2a; margin: 0; }
.restaurants-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
.restaurant-owner-card { background: #060606; border: 1px solid #0d0d0d; border-radius: var(--radius-lg); overflow: hidden; cursor: pointer; transition: border-color var(--dur-fast); }
.restaurant-owner-card:hover { border-color: #1a1a1a; }
.restaurant-owner-card-img { height: 160px; }
.restaurant-owner-card-body { padding: 1.125rem; }
.restaurant-owner-card-name { font-size: 1rem; font-weight: 600; color: #bbb; margin-bottom: 4px; }
.restaurant-owner-card-meta { font-size: 0.8125rem; color: #2a2a2a; margin-bottom: 1rem; }
.restaurant-owner-card-arrow { font-size: 0.75rem; color: var(--brand); letter-spacing: 0.04em; }
</style>
