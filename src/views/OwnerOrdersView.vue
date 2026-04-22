<script setup lang="ts">
import { useOwnerOrdersView } from './scripts/OwnerOrdersView'

const {
  t,
  orders,
  loading,
  statusFilter,
  statusFilterOptions,
  statusOptions,
  selectedOrder,
  newStatus,
  estimatedReady,
  openDetail,
  closeDetail,
  submitStatusUpdate,
  StatusBadge,
  BaseSelect,
  BaseInput,
  BaseButton,
  BaseSpinner,
  EmptyState,
} = useOwnerOrdersView()
</script>

<template>
  <div class="owner-orders-view">
    <header class="owner-orders-view-header">
      <h1 class="owner-orders-view-title">{{ t('ownerOrders.title') }}</h1>
      <p class="owner-orders-view-subtitle">{{ t('ownerOrders.subtitle') }}</p>
    </header>

    <div class="owner-orders-view-filters">
      <BaseSelect v-model="statusFilter" :label="t('ownerOrders.filterStatus')" :options="statusFilterOptions" />
    </div>

    <div v-if="loading" class="owner-orders-view-loading">
      <BaseSpinner />
    </div>

    <EmptyState
      v-else-if="orders.length === 0"
      :message="t('ownerOrders.empty')"
    />

    <ul v-else class="owner-orders-view-list">
      <li
        v-for="order in orders"
        :key="order.id"
        class="owner-orders-view-card"
        @click="openDetail(order)"
      >
        <div class="owner-orders-view-card-main">
          <p class="owner-orders-view-card-id">#{{ order.id.slice(-8) }}</p>
          <p class="owner-orders-view-card-meta">
            {{ order.createdAt.slice(11, 16) }} · ${{ order.totalAmount }} · {{ order.items.length }} ítems
          </p>
        </div>
        <StatusBadge :status="order.status" scope="ownerOrders" />
      </li>
    </ul>

    <!-- Status update drawer -->
    <Teleport to="body">
      <div v-if="selectedOrder" class="owner-orders-view-modal-overlay" @click.self="closeDetail">
        <div class="owner-orders-view-modal">
          <h3 class="owner-orders-view-modal-title">{{ t('ownerOrders.updateStatus') }}</h3>
          <p class="owner-orders-view-modal-meta">
            #{{ selectedOrder.id.slice(-8) }} · ${{ selectedOrder.totalAmount }}
          </p>
          <ul class="owner-orders-view-modal-items">
            <li v-for="item in selectedOrder.items" :key="item.menuItemId" class="owner-orders-view-modal-item">
              {{ item.menuItemName }} × {{ item.quantity }}
            </li>
          </ul>
          <BaseSelect v-model="newStatus" :label="t('ownerOrders.colStatus')" :options="statusOptions" />
          <BaseInput v-model="estimatedReady" :label="t('ownerOrders.estimatedReady')" type="datetime-local" />
          <div class="owner-orders-view-modal-actions">
            <BaseButton variant="ghost" @click="closeDetail">{{ t('common.cancel') }}</BaseButton>
            <BaseButton variant="primary" @click="submitStatusUpdate">{{ t('common.save') }}</BaseButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style src="./styles/OwnerOrdersView.css" scoped></style>
