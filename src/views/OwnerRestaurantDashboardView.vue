<script setup lang="ts">
import { useOwnerRestaurantDashboardView } from './scripts/OwnerRestaurantDashboardView'

const {
  t,
  stats,
  loading,
  restaurantId,
  quickLinks,
  BaseSpinner,
  RouterLink,
} = useOwnerRestaurantDashboardView()
</script>

<template>
  <div class="owner-dashboard-view">
    <header class="owner-dashboard-view-header">
      <h1 class="owner-dashboard-view-title">{{ t('ownerDashboard.title') }}</h1>
      <p class="owner-dashboard-view-subtitle">{{ t('ownerDashboard.subtitle') }}</p>
    </header>

    <div v-if="!restaurantId" class="owner-dashboard-view-empty">
      {{ t('ownerDashboard.noRestaurant') }}
    </div>

    <template v-else>
      <div v-if="loading" class="owner-dashboard-view-loading">
        <BaseSpinner />
      </div>

      <template v-else>
        <div class="owner-dashboard-view-stats-grid">
          <div class="owner-dashboard-view-stat-card">
            <p class="owner-dashboard-view-stat-value">{{ stats.tables }}</p>
            <p class="owner-dashboard-view-stat-label">{{ t('ownerDashboard.statsTablesToday') }}</p>
          </div>
          <div class="owner-dashboard-view-stat-card">
            <p class="owner-dashboard-view-stat-value">{{ stats.reservationsToday }}</p>
            <p class="owner-dashboard-view-stat-label">{{ t('ownerDashboard.statsReservationsToday') }}</p>
          </div>
          <div class="owner-dashboard-view-stat-card">
            <p class="owner-dashboard-view-stat-value">{{ stats.ordersPending }}</p>
            <p class="owner-dashboard-view-stat-label">{{ t('ownerDashboard.statsOrdersPending') }}</p>
          </div>
          <div class="owner-dashboard-view-stat-card">
            <p class="owner-dashboard-view-stat-value">{{ stats.menusActive }}</p>
            <p class="owner-dashboard-view-stat-label">{{ t('ownerDashboard.statsMenusActive') }}</p>
          </div>
        </div>

        <section class="owner-dashboard-view-quick-nav">
          <h2 class="owner-dashboard-view-quick-nav-title">{{ t('ownerDashboard.quickNav') }}</h2>
          <div class="owner-dashboard-view-quick-nav-grid">
            <RouterLink
              v-for="link in quickLinks"
              :key="link.to"
              :to="link.to"
              class="owner-dashboard-view-quick-link"
            >
              <component :is="link.icon" :size="20" class="owner-dashboard-view-quick-link-icon" />
              <span>{{ link.label }}</span>
            </RouterLink>
          </div>
        </section>
      </template>
    </template>
  </div>
</template>

<style src="./styles/OwnerRestaurantDashboardView.css" scoped></style>
