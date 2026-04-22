<script setup lang="ts">
import { useOrderTrackingView } from './scripts/OrderTrackingView'

const {
  t,
  order,
  loading,
  showCancelModal,
  openCancel,
  closeCancel,
  confirmCancel,
  refresh,
  statusLabel,
  statusClass,
  lineSubtotal,
  BaseButton,
  BaseSpinner,
  RouterLink,
  RefreshCw,
} = useOrderTrackingView()
</script>

<template>
  <div class="order-tracking-view">
    <RouterLink to="/me/orders" class="order-tracking-view-back">
      {{ t('orderTracking.back') }}
    </RouterLink>

    <div v-if="loading" class="order-tracking-view-loading">
      <BaseSpinner />
    </div>

    <p v-else-if="!order" class="order-tracking-view-not-found">
      {{ t('orderTracking.notFound') }}
    </p>

    <div v-else class="order-tracking-view-content">
      <header class="order-tracking-view-header">
        <h1 class="order-tracking-view-title">{{ t('orderTracking.title') }}</h1>
        <button type="button" class="order-tracking-view-refresh" @click="refresh">
          <RefreshCw :size="15" />
          {{ t('orderTracking.refresh') }}
        </button>
      </header>

      <!-- Status banner -->
      <div class="order-tracking-view-status-banner" :class="statusClass">
        <p class="order-tracking-view-status-label">{{ statusLabel }}</p>
        <p v-if="order.estimatedReadyAt" class="order-tracking-view-estimated">
          {{ t('orderTracking.estimatedReady') }}: {{ order.estimatedReadyAt.slice(11, 16) }}
        </p>
      </div>

      <!-- Details -->
      <div class="order-tracking-view-card">
        <dl class="order-tracking-view-details">
          <div class="order-tracking-view-detail-row">
            <dt>{{ t('orderTracking.restaurant') }}</dt>
            <dd>{{ order.restaurantName }}</dd>
          </div>
          <div class="order-tracking-view-detail-row">
            <dt>{{ t('orderTracking.orderedAt') }}</dt>
            <dd>{{ order.createdAt.slice(0, 16).replace('T', ' ') }}</dd>
          </div>
          <div class="order-tracking-view-detail-row">
            <dt>{{ t('orderTracking.total') }}</dt>
            <dd>${{ order.totalAmount }}</dd>
          </div>
          <div v-if="order.notes" class="order-tracking-view-detail-row">
            <dt>{{ t('orderTracking.notes') }}</dt>
            <dd>{{ order.notes }}</dd>
          </div>
        </dl>
      </div>

      <!-- Items table -->
      <div class="order-tracking-view-items-section">
        <h2 class="order-tracking-view-items-title">{{ t('orderTracking.items') }}</h2>
        <table class="order-tracking-view-table">
          <thead>
            <tr>
              <th>{{ t('orderTracking.colItem') }}</th>
              <th>{{ t('orderTracking.colQty') }}</th>
              <th>{{ t('orderTracking.colPrice') }}</th>
              <th>{{ t('orderTracking.colSubtotal') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in order.items" :key="item.menuItemId">
              <td>{{ item.menuItemName }}</td>
              <td>{{ item.quantity }}</td>
              <td>${{ item.unitPrice }}</td>
              <td>${{ lineSubtotal(item) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="order.status === 'PENDING' || order.status === 'CONFIRMED'" class="order-tracking-view-cancel-section">
        <BaseButton variant="danger" @click="openCancel">
          {{ t('orderTracking.cancel') }}
        </BaseButton>
      </div>
    </div>

    <!-- Cancel modal -->
    <Teleport to="body">
      <div v-if="showCancelModal" class="order-tracking-view-modal-overlay" @click.self="closeCancel">
        <div class="order-tracking-view-modal">
          <h3 class="order-tracking-view-modal-title">{{ t('orderTracking.cancelConfirm') }}</h3>
          <div class="order-tracking-view-modal-actions">
            <BaseButton variant="ghost" @click="closeCancel">{{ t('common.cancel') }}</BaseButton>
            <BaseButton variant="danger" @click="confirmCancel">{{ t('common.confirm') }}</BaseButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style src="./styles/OrderTrackingView.css" scoped></style>
