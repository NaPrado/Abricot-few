<script setup lang="ts">
import { useOrderTrackingView } from './scripts/OrderTrackingView'

const {
  order,
  loading,
  error,
  isActive,
  statusStepIndex,
  steps,
  statusLabel,
  stepLabel,
  formatDateTime,
  formatMoney,
  formatEstimated,
  restaurantName,
  itemName,
  goBack,
} = useOrderTrackingView()
</script>

<template>
  <div class="order-tracking">
    <button class="order-tracking-back" type="button" @click="goBack">← Mis pedidos</button>

    <div v-if="loading" class="order-tracking-loading">Cargando pedido…</div>
    <div v-else-if="error" class="order-tracking-error">{{ error }}</div>
    <template v-else-if="order">

      <!-- Header -->
      <div class="order-tracking-header">
        <div>
          <div class="order-tracking-restaurant">{{ restaurantName() }}</div>
          <div class="order-tracking-meta">
            Pedido · {{ formatDateTime(order.createdAt) }}
          </div>
        </div>
        <span
          :class="[
            'order-tracking-badge',
            order.status === 'CANCELLED'
              ? 'order-tracking-badge--cancelled'
              : order.status === 'COMPLETED'
                ? 'order-tracking-badge--done'
                : 'order-tracking-badge--active',
          ]"
        >
          {{ statusLabel(order.status) }}
        </span>
      </div>

      <!-- Estimated ready time -->
      <div v-if="order.estimatedReadyAt && isActive" class="order-tracking-estimated">
        <span class="order-tracking-estimated-label">Tiempo estimado:</span>
        {{ formatEstimated(order.estimatedReadyAt) }}
      </div>

      <!-- Live indicator -->
      <div v-if="isActive" class="order-tracking-live">
        <span class="order-tracking-live-dot" />
        Actualizando en tiempo real
      </div>

      <!-- Timeline -->
      <div class="order-tracking-timeline-section">
        <div class="order-tracking-section-title">Estado del pedido</div>
        <div class="order-tracking-timeline">
          <div
            v-for="(step, i) in steps"
            :key="step"
            class="order-tracking-timeline-item"
          >
            <div class="order-tracking-dot-col">
              <div
                :class="[
                  'order-tracking-dot',
                  statusStepIndex > i && 'order-tracking-dot--done',
                  statusStepIndex === i && 'order-tracking-dot--current',
                ]"
              />
              <div
                v-if="i < steps.length - 1"
                :class="[
                  'order-tracking-line',
                  statusStepIndex > i && 'order-tracking-line--done',
                ]"
              />
            </div>
            <div
              :class="[
                'order-tracking-step-label',
                statusStepIndex > i && 'order-tracking-step-label--done',
                statusStepIndex === i && 'order-tracking-step-label--current',
              ]"
            >
              {{ stepLabel(step) }}
            </div>
          </div>
          <!-- Cancelled state -->
          <div v-if="order.status === 'CANCELLED'" class="order-tracking-timeline-item">
            <div class="order-tracking-dot-col">
              <div class="order-tracking-dot order-tracking-dot--cancelled" />
            </div>
            <div class="order-tracking-step-label order-tracking-step-label--cancelled">
              Pedido cancelado
            </div>
          </div>
        </div>
      </div>

      <!-- Items -->
      <div v-if="order.items?.length" class="order-tracking-items-section">
        <div class="order-tracking-section-title">Detalle del pedido</div>
        <div
          v-for="item in order.items"
          :key="item.id"
          class="order-tracking-item-row"
        >
          <div class="order-tracking-item-left">
            <span class="order-tracking-item-name">
              {{ itemName(item) }}
            </span>
            <span v-if="item.notes" class="order-tracking-item-notes">{{ item.notes }}</span>
          </div>
          <div class="order-tracking-item-right">
            <span class="order-tracking-item-qty">×{{ item.quantity }}</span>
            <span class="order-tracking-item-price">{{ formatMoney(Number(item.unitPrice) * item.quantity) }}</span>
          </div>
        </div>
        <div class="order-tracking-total-row">
          <span>Total</span>
          <span>{{ formatMoney(order.totalAmount) }}</span>
        </div>
      </div>
      <div v-else class="order-tracking-items-section">
        <div class="order-tracking-section-title">Total</div>
        <div class="order-tracking-total-row">
          <span>Total del pedido</span>
          <span>{{ formatMoney(order.totalAmount) }}</span>
        </div>
      </div>

      <!-- Notes -->
      <div v-if="order.notes" class="order-tracking-notes">
        <div class="order-tracking-section-title">Notas</div>
        <p class="order-tracking-notes-text">{{ order.notes }}</p>
      </div>

    </template>
  </div>
</template>

<style src="./styles/OrderTrackingView.css" scoped></style>
