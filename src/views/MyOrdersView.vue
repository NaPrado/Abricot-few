<script setup lang="ts">
import { useMyOrdersView } from './scripts/MyOrdersView'

const {
  orders,
  loading,
  expandedId,
  steps,
  statusLabel,
  isActive,
  statusStepIndex,
  stepDescription,
  formatDateTime,
  formatMoney,
  toggle,
  restaurantNameFor,
  itemName,
  viewOrder,
} = useMyOrdersView()
</script>

<template>
  <div class="my-orders">
    <h1 class="my-orders-title">Mis pedidos</h1>
    <p class="my-orders-sub">Seguí el estado de tus pedidos en tiempo real.</p>

    <div v-if="loading" style="color:var(--text-muted);font-size:0.875rem">Cargando…</div>
    <div v-else-if="orders.length === 0" class="my-orders-empty">
      No tenés pedidos todavía.
    </div>
    <template v-else>
      <div v-for="order in orders" :key="order.id" class="order-row">
        <!-- Header -->
        <div class="order-row-header" @click="toggle(order.id as string)">
          <div>
            <div class="order-row-restaurant">{{ restaurantNameFor(order) }}</div>
            <div class="order-row-meta">{{ formatDateTime(order.createdAt) }} · {{ order.items?.length ?? '—' }} ítems</div>
          </div>
          <span class="order-row-total">{{ formatMoney(order.totalAmount) }}</span>
          <span
            :class="[
              'order-row-status',
              order.status === 'CANCELLED'
                ? 'order-row-status--cancelled'
                : ['COMPLETED'].includes(order.status)
                  ? 'order-row-status--done'
                  : 'order-row-status--active',
            ]"
          >
            {{ statusLabel(order.status) }}
          </span>
          <span :class="['order-row-chevron', expandedId === order.id && 'order-row-chevron--open']">▼</span>
        </div>

        <!-- Expanded -->
        <div v-if="expandedId === order.id" class="order-row-body">
          <!-- Timeline -->
          <div class="order-timeline">
            <div
              v-for="(step, i) in steps"
              :key="step"
              class="order-timeline-item"
            >
              <div class="order-timeline-dot-col">
                <div
                  :class="[
                    'order-timeline-dot',
                    statusStepIndex(order.status) > i && 'order-timeline-dot--done',
                    statusStepIndex(order.status) === i && 'order-timeline-dot--current',
                  ]"
                />
                <div
                  v-if="i < steps.length - 1"
                  :class="[
                    'order-timeline-line',
                    statusStepIndex(order.status) > i && 'order-timeline-line--done',
                  ]"
                />
              </div>
              <div
                :class="[
                  'order-timeline-label',
                  statusStepIndex(order.status) > i && 'order-timeline-label--done',
                  statusStepIndex(order.status) === i && 'order-timeline-label--current',
                ]"
              >
                {{ stepDescription(step) }}
              </div>
            </div>
          </div>

          <!-- Items + actions -->
          <div>
            <div class="order-items-title">Detalle del pedido</div>
            <div v-if="!order.items?.length" class="order-item-row order-item-row--empty" style="color:var(--text-muted)">
              Sin detalle de ítems disponible.
            </div>
            <div v-for="item in order.items ?? []" :key="item.id" class="order-item-row">
              <span>
                <span class="order-item-name">{{ itemName(item) }}</span>
                <span class="order-item-qty">×{{ item.quantity }}</span>
              </span>
              <span class="order-item-price">{{ formatMoney(Number(item.unitPrice) * item.quantity) }}</span>
            </div>

            <!-- View detail button for active orders -->
            <button
              v-if="isActive(order.status)"
              class="order-view-btn"
              @click.stop="viewOrder(order.id as string)"
            >
              Seguir pedido en tiempo real →
            </button>
            <button
              v-else
              class="order-view-btn order-view-btn--muted"
              @click.stop="viewOrder(order.id as string)"
            >
              Ver detalle completo →
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style src="./styles/MyOrdersView.css" scoped></style>
