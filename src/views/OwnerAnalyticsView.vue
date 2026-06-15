<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { analyticsService } from '@/services'
import type { DashboardAnalyticsResponse, OrdersAnalyticsResponse } from '@/types'

const route = useRoute()
const restaurantId = route.params.restaurantId as string

const TODAY = new Date().toISOString().split('T')[0] as string
const THIRTY_DAYS_AGO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] as string

const dashboard = ref<DashboardAnalyticsResponse | null>(null)
// Kept only to feed "Pedidos por estado" — report=dashboard has no per-status breakdown.
const orders = ref<OrdersAnalyticsResponse | null>(null)
const loading = ref(true)

const averageTicket = computed(() => {
  const totals = dashboard.value?.totals
  return totals && totals.orders > 0 ? Number(totals.revenue) / totals.orders : 0
})

function revenueMax(data: DashboardAnalyticsResponse): number {
  if (!data.byDay.length) return 1
  return Math.max(...data.byDay.map(d => Number(d.revenue)), 1)
}

function statusMax(data: OrdersAnalyticsResponse): number {
  const rows = data.ordersByStatus
  if (!rows?.length) return 1
  return Math.max(...rows.map(s => Number(s.count) || 0), 1)
}

function formatMoney(n: string | number): string {
  const v = Number(n)
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`
  if (v >= 1000) return `$${Math.round(v / 1000)}k`
  return `$${Math.round(v)}`
}

onMounted(async () => {
  loading.value = true
  try {
    const [dash, ord] = await Promise.all([
      analyticsService.getDashboard(restaurantId, { start: THIRTY_DAYS_AGO, end: TODAY }),
      analyticsService.getOrders(restaurantId, { start: THIRTY_DAYS_AGO, end: TODAY }),
    ])
    dashboard.value = dash
    orders.value = ord
  } catch {
    // silently degrade
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="analytics-view">
    <div class="analytics-header">
      <h1 class="analytics-title">Analiticas</h1>
      <p class="analytics-sub">Ultimos 30 dias - Actualizado hoy</p>
    </div>

    <div v-if="loading" style="color:var(--text-muted);font-size:0.875rem">Cargando...</div>
    <template v-else>
      <div class="analytics-card" style="margin-bottom:10px">
        <div class="analytics-card-label">Facturacion diaria</div>
        <div v-if="!dashboard" style="color:var(--text-secondary);font-size:0.8125rem">Sin datos.</div>
        <div v-else-if="!dashboard.byDay.length" style="color:var(--text-secondary);font-size:0.8125rem">Sin datos.</div>
        <div v-else class="analytics-bars" style="height:120px">
          <div
            v-for="(day, i) in dashboard.byDay"
            :key="day.date ?? i"
            class="analytics-bar-col"
          >
            <div
              class="analytics-bar"
              :class="{ 'analytics-bar--accent': i === dashboard.byDay.length - 1 }"
              :style="{ height: `${Math.max(2, (Number(day.revenue) / revenueMax(dashboard)) * 100)}%` }"
            />
          </div>
        </div>
        <div v-if="dashboard" class="analytics-summary-row">
          <div class="analytics-summary-item">
            <span class="analytics-summary-label">Total facturado</span>
            <span class="analytics-summary-val">{{ formatMoney(dashboard.totals.revenue) }}</span>
          </div>
          <div class="analytics-summary-item">
            <span class="analytics-summary-label">Pedidos totales</span>
            <span class="analytics-summary-val">{{ dashboard.totals.orders }}</span>
          </div>
          <div class="analytics-summary-item">
            <span class="analytics-summary-label">Ticket promedio</span>
            <span class="analytics-summary-val">{{ formatMoney(averageTicket) }}</span>
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div class="analytics-card">
          <div class="analytics-card-label">Metricas generales</div>
          <div v-if="!dashboard" style="color:var(--text-secondary);font-size:0.8125rem">Sin datos.</div>
          <div v-else class="analytics-metrics-grid">
            <div>
              <span class="analytics-summary-label">Reservas</span>
              <span class="analytics-summary-val">{{ dashboard.totals.reservations }}</span>
            </div>
            <div>
              <span class="analytics-summary-label">Pedidos</span>
              <span class="analytics-summary-val">{{ dashboard.totals.orders }}</span>
            </div>
            <div>
              <span class="analytics-summary-label">Facturacion</span>
              <span class="analytics-summary-val">{{ formatMoney(dashboard.totals.revenue) }}</span>
            </div>
          </div>
        </div>

        <div class="analytics-card">
          <div class="analytics-card-label">Pedidos por estado</div>
          <div v-if="!orders || !orders.ordersByStatus?.length" style="color:var(--text-secondary);font-size:0.8125rem">Sin datos.</div>
          <div v-else class="analytics-item-bars">
            <div v-for="status in orders.ordersByStatus" :key="status.status" class="analytics-item-row">
              <span class="analytics-item-name">{{ status.status }}</span>
              <div class="analytics-item-bar-wrap">
                <div
                  class="analytics-item-bar"
                  :style="{ width: `${(status.count / statusMax(orders)) * 100}%` }"
                />
              </div>
              <span class="analytics-item-count">{{ status.count }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.analytics-view { padding: 2.5rem; }
.analytics-header { margin-bottom: 2rem; }
.analytics-title { font-size: 1.5rem; font-weight: 700; color: #ccc; margin: 0 0 0.25rem; letter-spacing: 0; }
.analytics-sub { font-size: 0.8125rem; color: var(--text-muted); margin: 0; }
.analytics-card { background: #060606; border: 1px solid #0d0d0d; border-radius: var(--radius-lg); padding: 1.25rem; }
.analytics-card-label { font-size: 0.5625rem; color: var(--text-muted); letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 1rem; }
.analytics-bars { display: flex; align-items: flex-end; gap: 3px; }
.analytics-bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; }
.analytics-bar { width: 100%; border-radius: 2px 2px 0 0; background: #111; min-height: 2px; transition: height 0.5s; }
.analytics-bar--accent { background: var(--brand); }
.analytics-summary-row { display: flex; gap: 2rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #0a0a0a; }
.analytics-summary-item { display: flex; flex-direction: column; gap: 3px; }
.analytics-summary-label { display: block; font-size: 0.5625rem; color: var(--text-muted); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.25rem; }
.analytics-summary-val { display: block; font-size: 1.125rem; font-weight: 700; color: var(--text-secondary); letter-spacing: 0; }
.analytics-metrics-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
.analytics-item-bars { display: flex; flex-direction: column; gap: 0.5rem; }
.analytics-item-row { display: grid; grid-template-columns: 1fr 120px 30px; align-items: center; gap: 0.5rem; }
.analytics-item-name { font-size: 0.75rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.analytics-item-bar-wrap { background: #0d0d0d; border-radius: 2px; height: 4px; overflow: hidden; }
.analytics-item-bar { height: 100%; background: var(--brand); border-radius: 2px; transition: width 0.5s; }
.analytics-item-count { font-size: 0.6875rem; color: var(--text-muted); text-align: right; }
</style>
