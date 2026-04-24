<script setup lang="ts">
import { SmokeCanvas, CustomSelect } from '@/components/shared'
import { PremiumCard, ListCard } from '@/components/restaurant'
import { useLandingView } from './scripts/LandingView'

const {
  loading,
  searchQuery,
  searchNeighbourhood,
  searchType,
  activeTag,
  phraseVisible,
  phrase,
  eyebrowDate,
  tags,
  neighbourhoodOptions,
  typeOptions,
  featuredRestaurants,
  filteredRestaurants,
  handleSearch,
  navigateToExplore,
  navigateToRegisterOwner,
} = useLandingView()
</script>

<template>
  <div class="landing-view">
    <!-- ── HERO ── -->
    <section class="landing-hero">
      <div class="landing-hero-bg" />
      <div class="landing-hero-grid" />
      <SmokeCanvas />

      <div class="landing-hero-inner">
        <!-- Eyebrow -->
        <div class="landing-hero-eyebrow">
          <span class="landing-hero-eyebrow-dot" />
          {{ eyebrowDate }}
        </div>

        <!-- Rotating title -->
        <div class="landing-hero-title-wrap">
          <h1
            class="landing-hero-title"
            :class="{ 'landing-hero-title--hidden': !phraseVisible }"
          >
            {{ phrase.top }}<br />
            <span class="landing-hero-accent">{{ phrase.accent }}</span>
          </h1>
        </div>

        <!-- Subtitle -->
        <p class="landing-hero-sub">
          La plataforma que conecta restaurantes y comensales sin fricción.
        </p>

        <!-- Stats -->
        <div class="landing-hero-stats">
          <div class="landing-hero-stat">
            <span class="landing-hero-stat-val">150+</span>
            <span class="landing-hero-stat-lbl">Restaurantes</span>
          </div>
          <div class="landing-hero-stat">
            <span class="landing-hero-stat-val">98%</span>
            <span class="landing-hero-stat-lbl">Disponibilidad</span>
          </div>
          <div class="landing-hero-stat">
            <span class="landing-hero-stat-val">∞</span>
            <span class="landing-hero-stat-lbl">Posibilidades</span>
          </div>
        </div>

        <!-- Search card -->
        <form class="landing-search-card" @submit="handleSearch">
          <div class="landing-search-field">
            <span class="landing-search-field-label">¿Qué buscás?</span>
            <input
              v-model="searchQuery"
              class="landing-search-input"
              type="text"
              placeholder="Restaurante, cocina, barrio…"
            />
          </div>

          <div class="landing-search-divider" />

          <CustomSelect
            label="Barrio"
            :options="neighbourhoodOptions"
            v-model="searchNeighbourhood"
          />

          <div class="landing-search-divider" />

          <CustomSelect
            label="Tipo"
            :options="typeOptions"
            v-model="searchType"
          />

          <button class="landing-search-btn" type="submit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            Buscar
          </button>
        </form>
      </div>
    </section>

    <!-- ── FEATURED ── -->
    <section class="landing-featured">
      <div class="landing-section-header">
        <div>
          <div class="landing-section-eye">Selección editorial</div>
          <h2 class="landing-section-title">Destacados del mes</h2>
        </div>
        <button class="landing-see-all-btn" @click="navigateToExplore">Ver todos →</button>
      </div>

      <div v-if="loading" class="landing-empty-state">
        <p>Cargando restaurantes…</p>
      </div>
      <div v-else-if="featuredRestaurants.length === 0" class="landing-empty-state">
        <p>No hay restaurantes disponibles.</p>
        <p class="landing-empty-state-hint">Volvé pronto, estamos sumando locales.</p>
      </div>
      <div v-else class="landing-featured-grid">
        <PremiumCard :restaurant="featuredRestaurants[0]!" />
        <PremiumCard v-if="featuredRestaurants[1]" :restaurant="featuredRestaurants[1]" :small="true" />
        <PremiumCard v-if="featuredRestaurants[2]" :restaurant="featuredRestaurants[2]" :small="true" />
      </div>
    </section>

    <!-- ── RECOMMENDED ── -->
    <section class="landing-recommended">
      <div class="landing-section-header">
        <div>
          <div class="landing-section-eye">Para vos</div>
          <h2 class="landing-section-title">Recomendados</h2>
        </div>
      </div>

      <!-- Tag filters -->
      <div class="landing-tag-row">
        <button
          v-for="tag in tags"
          :key="tag"
          :class="['landing-tag', tag === activeTag && 'landing-tag--active']"
          @click="activeTag = tag"
        >
          {{ tag }}
        </button>
      </div>

      <div v-if="filteredRestaurants.length === 0" class="landing-empty-state">
        <p>Sin resultados para esta categoría.</p>
      </div>
      <div v-else class="landing-rec-grid">
        <ListCard
          v-for="restaurant in filteredRestaurants"
          :key="restaurant.id"
          :restaurant="restaurant"
        />
      </div>
    </section>

    <!-- ── OWNER BANNER ── -->
    <div class="landing-owner-banner">
      <div class="landing-owner-banner-inner">
        <!-- Left: copy -->
        <div>
          <div class="landing-section-eye">Para propietarios</div>
          <h2 class="landing-owner-title">Tu restaurante,<br />en la nube.</h2>
          <p class="landing-owner-sub">
            Gestioná reservas, pedidos y analíticas desde un solo panel. Sin hojas de cálculo,
            sin llamadas, sin caos. Abricot escala con vos.
          </p>
          <button class="landing-owner-btn" @click="navigateToRegisterOwner">
            Sumar mi restaurante
            <span class="landing-owner-btn-arrow">→</span>
          </button>
        </div>

        <!-- Right: mini dashboard mockup -->
        <div class="landing-dash-mock">
          <div class="landing-dash-mock-header">
            <span style="font-size:0.6875rem;color:#333;letter-spacing:0.1em;text-transform:uppercase">Panel de control</span>
            <span style="font-size:0.6875rem;color:#222">Hoy</span>
          </div>

          <div class="landing-dash-mock-row">
            <span class="landing-dash-mock-key">Reservas confirmadas</span>
            <div style="display:flex;align-items:baseline;gap:8px">
              <span class="landing-dash-mock-val">24</span>
              <span class="landing-dash-mock-delta">+12%</span>
            </div>
          </div>
          <div class="landing-dash-mock-row">
            <span class="landing-dash-mock-key">Pedidos activos</span>
            <div style="display:flex;align-items:baseline;gap:8px">
              <span class="landing-dash-mock-val">8</span>
              <span class="landing-dash-mock-delta">+3</span>
            </div>
          </div>
          <div class="landing-dash-mock-row">
            <span class="landing-dash-mock-key">Facturación del día</span>
            <div style="display:flex;align-items:baseline;gap:8px">
              <span class="landing-dash-mock-val">$142k</span>
              <span class="landing-dash-mock-delta">+8%</span>
            </div>
          </div>

          <!-- Bar chart -->
          <div class="landing-dash-mock-bars">
            <div
              v-for="(h, i) in [30, 55, 40, 70, 85, 60, 90]"
              :key="i"
              class="landing-dash-mock-bar"
              :style="{
                height: `${h}%`,
                background: i === 6 ? 'var(--brand)' : '#161616',
              }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style src="./styles/LandingView.css" scoped></style>
