<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { analyticsService } from '@/services'
import type { OccupancyAnalyticsResponse, OrdersAnalyticsResponse, PopularItemsAnalyticsResponse, PeakHoursAnalyticsResponse } from '@/types'

const route = useRoute()
const restaurantId = route.params.restaurantId as string

const TODAY = new Date().toISOString().split('T')[0] as string
const THIRTY_DAYS_AGO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] as string

const occupancy = ref<OccupancyAnalyticsResponse | null>(null)
const orders = ref<OrdersAnalyticsResponse | null>(null)
const popularItems = ref<PopularItemsAnalyticsResponse | null>(null)
const peakHours = ref<PeakHoursAnalyticsResponse | null>(null)
const loading = ref(true)

function revenueMax(data: OrdersAnalyticsResponse): number {
  return Math.max(...data.revenueByDay.map(d => Number(d.revenue)), 1)
}

function peakMax(data: PeakHoursAnalyticsResponse): number {
  return Math.max(...data.reservationsByHour.map(h => h.count), 1)
}

function popularMax(data: PopularItemsAnalyticsResponse): number {
  return Math.max(...data.items.map(i => i.quantitySold), 1)
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
    const [occ, ord, pop, peak] = await Promise.all([
      analyticsService.getOccupancy(restaurantId, { start: THIRTY_DAYS_AGO, end: TODAY }),
      analyticsService.getOrders(restaurantId, { start: THIRTY_DAYS_AGO, end: TODAY }),
      analyticsService.getPopularItems(restaurantId, { start: THIRTY_DAYS_AGO, end: TODAY, limit: 8 }),
      analyticsService.getPeakHours(restaurantId, { start: THIRTY_DAYS_AGO, end: TODAY }),
    ])
    occupancy.value = occ
    orders.value = ord
    popularItems.value = pop
    peakHours.value = peak
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
      <h1 class="analytics-title">Analíticas</h1>
      <p class="analytics-sub">Últimos 30 días · Actualizado hoy</p>
    </div>

    <div v-if="loading" style="color:#2a2a2a;font-size:0.875rem">Cargando…</div>
    <template v-else>
      <!-- Revenue chart -->
      <div class="analytics-card" style="margin-bottom:10px">
        <div class="analytics-card-label">Facturación diaria</div>
        <div v-if="!orders" style="color:#1a1a1a;font-size:0.8125rem">Sin datos.</div>
        <div v-else class="analytics-bars" style="height:120px">
          <div
            v-for="(day, i) in orders.revenueByDay"
            :key="day.date"
            class="analytics-bar-col"
          >
            <div
              class="analytics-bar"
              :class="{ 'analytics-bar--accent': i === orders.revenueByDay.length - 1 }"
              :style="{ height: `${Math.max(2, (Number(day.revenue) / revenueMax(orders)) * 100)}%` }"
            />
          </div>
        </div>
        <div v-if="orders" class="analytics-summary-row">
          <div class="analytics-summary-item">
            <span class="analytics-summary-label">Total facturado</span>
            <span class="analytics-summary-val">{{ formatMoney(orders.totalRevenue) }}</span>
          </div>
          <div class="analytics-summary-item">
            <span class="analytics-summary-label">Pedidos totales</span>
            <span class="analytics-summary-val">{{ orders.totalOrders }}</span>
          </div>
          <div class="analytics-summary-item">
            <span class="analytics-summary-label">Ticket promedio</span>
            <span class="analytics-summary-val">{{ formatMoney(orders.averageOrderValue) }}</span>
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
        <!-- Popular items -->
        <div class="analytics-card">
          <div class="analytics-card-label">Ítems más pedidos</div>
          <div v-if="!popularItems || !popularItems.items.length" style="color:#1a1a1a;font-size:0.8125rem">Sin datos.</div>
          <div v-else class="analytics-item-bars">
            <div v-for="item in popularItems.items.slice(0,6)" :key="item.menuItemId" class="analytics-item-row">
              <span class="analytics-item-name">{{ item.name }}</span>
              <div class="analytics-item-bar-wrap">
                <div
                  class="analytics-item-bar"
                  :style="{ width: `${(item.quantitySold / popularMax(popularItems!)) * 100}%` }"
                />
              </div>
              <span class="analytics-item-count">{{ item.quantitySold }}</span>
            </div>
          </div>
        </div>

        <!-- Peak hours -->
        <div class="analytics-card">
          <div class="analytics-card-label">Horas pico</div>
          <div v-if="!peakHours || !peakHours.reservationsByHour.length" style="color:#1a1a1a;font-size:0.8125rem">Sin datos.</div>
          <div v-else class="analytics-bars" style="height:100px">
            <div
              v-for="h in peakHours.reservationsByHour"
              :key="h.hour"
              class="analytics-bar-col"
              style="align-items:center"
            >
              <div
                class="analytics-bar"
                :style="{ height: `${Math.max(2, (h.count / peakMax(peakHours!)) * 100)}%` }"
              />
              <span style="font-size:0.45rem;color:#1a1a1a;margin-top:2px">{{ h.hour }}h</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Occupancy -->
      <div class="analytics-card">
        <div class="analytics-card-label">Reservas diarias</div>
        <div v-if="!occupancy" style="color:#1a1a1a;font-size:0.8125rem">Sin datos.</div>
        <div v-else class="analytics-bars" style="height:80px">
          <div
            v-for="(day, i) in occupancy.occupancyByDay"
            :key="day.date"
            class="analytics-bar-col"
          >
            <div
              class="analytics-bar"
              :class="{ 'analytics-bar--accent': i === occupancy.occupancyByDay.length - 1 }"
              :style="{ height: `${Math.max(2, (day.reservations / Math.max(...occupancy.occupancyByDay.map(d => d.reservations), 1)) * 100)}%` }"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.analytics-view { padding: 2.5rem; }
.analytics-header { margin-bottom: 2rem; }
.analytics-title { font-size: 1.5rem; font-weight: 700; color: #ccc; margin: 0 0 0.25rem; letter-spacing: -0.02em; }
.analytics-sub { font-size: 0.8125rem; color: #2a2a2a; margin: 0; }
.analytics-card { background: #060606; border: 1px solid #0d0d0d; border-radius: var(--radius-lg); padding: 1.25rem; }
.analytics-card-label { font-size: 0.5625rem; color: #2a2a2a; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 1rem; }
.analytics-bars { display: flex; align-items: flex-end; gap: 3px; }
.analytics-bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; }
.analytics-bar { width: 100%; border-radius: 2px 2px 0 0; background: #111; min-height: 2px; transition: height 0.5s; }
.analytics-bar--accent { background: var(--brand); }
.analytics-summary-row { display: flex; gap: 2rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #0a0a0a; }
.analytics-summary-item { display: flex; flex-direction: column; gap: 3px; }
.analytics-summary-label { font-size: 0.5625rem; color: #2a2a2a; letter-spacing: 0.1em; text-transform: uppercase; }
.analytics-summary-val { font-size: 1.125rem; font-weight: 700; color: #888; letter-spacing: -0.02em; }
.analytics-item-bars { display: flex; flex-direction: column; gap: 0.5rem; }
.analytics-item-row { display: grid; grid-template-columns: 1fr 120px 30px; align-items: center; gap: 0.5rem; }
.analytics-item-name { font-size: 0.75rem; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.analytics-item-bar-wrap { background: #0d0d0d; border-radius: 2px; height: 4px; overflow: hidden; }
.analytics-item-bar { height: 100%; background: var(--brand); border-radius: 2px; transition: width 0.5s; }
.analytics-item-count { font-size: 0.6875rem; color: #222; text-align: right; }
</style>
