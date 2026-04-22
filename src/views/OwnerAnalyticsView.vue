<script setup lang="ts">
import { useOwnerAnalyticsView } from './scripts/OwnerAnalyticsView'

const {
  t,
  dateFrom,
  dateTo,
  loading,
  occupancy,
  orders,
  popularItems,
  promotions,
  peakHours,
  loadAnalytics,
  BaseInput,
  BaseButton,
  BaseSpinner,
} = useOwnerAnalyticsView()
</script>

<template>
  <div class="owner-analytics-view">
    <header class="owner-analytics-view-header">
      <h1 class="owner-analytics-view-title">{{ t('ownerAnalytics.title') }}</h1>
      <p class="owner-analytics-view-subtitle">{{ t('ownerAnalytics.subtitle') }}</p>
    </header>

    <!-- Date range filters -->
    <div class="owner-analytics-view-filters">
      <BaseInput v-model="dateFrom" :label="t('ownerAnalytics.dateFrom')" type="date" />
      <BaseInput v-model="dateTo" :label="t('ownerAnalytics.dateTo')" type="date" />
      <BaseButton variant="primary" @click="loadAnalytics" :loading="loading">
        {{ t('ownerAnalytics.load') }}
      </BaseButton>
    </div>

    <div v-if="loading" class="owner-analytics-view-loading">
      <BaseSpinner />
      <p>{{ t('ownerAnalytics.loading') }}</p>
    </div>

    <template v-else-if="occupancy">
      <!-- Occupancy -->
      <section class="owner-analytics-view-section">
        <h2 class="owner-analytics-view-section-title">{{ t('ownerAnalytics.occupancy.title') }}</h2>
        <div class="owner-analytics-view-stats-row">
          <div class="owner-analytics-view-stat">
            <p class="owner-analytics-view-stat-value">{{ occupancy.totalReservations }}</p>
            <p class="owner-analytics-view-stat-label">{{ t('ownerAnalytics.occupancy.total') }}</p>
          </div>
          <div class="owner-analytics-view-stat">
            <p class="owner-analytics-view-stat-value">{{ occupancy.totalCovers }}</p>
            <p class="owner-analytics-view-stat-label">{{ t('ownerAnalytics.occupancy.covers') }}</p>
          </div>
        </div>
      </section>

      <!-- Orders -->
      <section v-if="orders" class="owner-analytics-view-section">
        <h2 class="owner-analytics-view-section-title">{{ t('ownerAnalytics.orders.title') }}</h2>
        <div class="owner-analytics-view-stats-row">
          <div class="owner-analytics-view-stat">
            <p class="owner-analytics-view-stat-value">{{ orders.totalOrders }}</p>
            <p class="owner-analytics-view-stat-label">{{ t('ownerAnalytics.orders.total') }}</p>
          </div>
          <div class="owner-analytics-view-stat">
            <p class="owner-analytics-view-stat-value">${{ orders.totalRevenue }}</p>
            <p class="owner-analytics-view-stat-label">{{ t('ownerAnalytics.orders.revenue') }}</p>
          </div>
        </div>
      </section>

      <!-- Popular items -->
      <section v-if="popularItems?.items?.length" class="owner-analytics-view-section">
        <h2 class="owner-analytics-view-section-title">{{ t('ownerAnalytics.popularItems.title') }}</h2>
        <table class="owner-analytics-view-table">
          <thead>
            <tr>
              <th>{{ t('ownerAnalytics.popularItems.item') }}</th>
              <th>{{ t('ownerAnalytics.popularItems.count') }}</th>
              <th>{{ t('ownerAnalytics.popularItems.revenue') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in popularItems.items" :key="item.menuItemId">
              <td>{{ item.name }}</td>
              <td>{{ item.quantitySold }}</td>
              <td>${{ item.revenue }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- Peak hours -->
      <section
        v-if="peakHours && (peakHours.reservationsByHour.length || peakHours.ordersByHour.length)"
        class="owner-analytics-view-section"
      >
        <h2 class="owner-analytics-view-section-title">{{ t('ownerAnalytics.peakHours.title') }}</h2>
        <table class="owner-analytics-view-table">
          <thead>
            <tr>
              <th>{{ t('ownerAnalytics.peakHours.hour') }}</th>
              <th>{{ t('ownerAnalytics.peakHours.count') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="ph in peakHours.reservationsByHour.length ? peakHours.reservationsByHour : peakHours.ordersByHour"
              :key="ph.hour"
            >
              <td>{{ ph.hour }}:00</td>
              <td>{{ ph.count }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- Promotions -->
      <section v-if="promotions?.promotions?.length" class="owner-analytics-view-section">
        <h2 class="owner-analytics-view-section-title">{{ t('ownerAnalytics.promotions.title') }}</h2>
        <table class="owner-analytics-view-table">
          <thead>
            <tr>
              <th>{{ t('ownerAnalytics.promotions.name') }}</th>
              <th>{{ t('ownerAnalytics.promotions.uses') }}</th>
              <th>{{ t('ownerAnalytics.promotions.revenue') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="promo in promotions.promotions" :key="promo.promotionId">
              <td>{{ promo.title }}</td>
              <td>{{ promo.ordersWithPromotion }}</td>
              <td>${{ promo.revenueImpact }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </template>
  </div>
</template>

<style src="./styles/OwnerAnalyticsView.css" scoped></style>
