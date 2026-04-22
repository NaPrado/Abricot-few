<script setup lang="ts">
import { useMyOrdersView } from './scripts/MyOrdersView'

const {
  t,
  orders,
  loading,
  statusFilter,
  statusFilterOptions,
  StatusBadge,
  BaseSelect,
  BaseSpinner,
  EmptyState,
  RouterLink,
} = useMyOrdersView()
</script>

<template>
  <div class="my-orders-view">
    <header class="my-orders-view-header">
      <h1 class="my-orders-view-title">{{ t('myOrders.title') }}</h1>
      <p class="my-orders-view-subtitle">{{ t('myOrders.subtitle') }}</p>
    </header>

    <div class="my-orders-view-filters">
      <BaseSelect v-model="statusFilter" :label="t('myOrders.filterStatus')" :options="statusFilterOptions" />
    </div>

    <div v-if="loading" class="my-orders-view-loading">
      <BaseSpinner />
    </div>

    <EmptyState
      v-else-if="orders.length === 0"
      :message="t('myOrders.empty')"
      :hint="t('myOrders.emptyHint')"
    />

    <ul v-else class="my-orders-view-list">
      <li v-for="order in orders" :key="order.id" class="my-orders-view-card">
        <div class="my-orders-view-card-main">
          <p class="my-orders-view-card-restaurant">{{ order.restaurantName }}</p>
          <p class="my-orders-view-card-meta">
            {{ order.createdAt.slice(0, 10) }} · ${{ order.totalAmount }}
          </p>
          <p class="my-orders-view-card-items">
            {{ order.items.length }} {{ t('myOrders.colItems').toLowerCase() }}
          </p>
        </div>
        <div class="my-orders-view-card-right">
          <StatusBadge :status="order.status" scope="myOrders" />
          <RouterLink
            :to="`/me/orders/${order.id}`"
            class="my-orders-view-link-btn"
          >
            {{ t('myOrders.viewDetail') }}
          </RouterLink>
        </div>
      </li>
    </ul>
  </div>
</template>

<style src="./styles/MyOrdersView.css" scoped></style>
