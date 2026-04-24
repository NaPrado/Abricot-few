<script setup lang="ts">
import { useOwnerRestaurantDashboardView } from './scripts/OwnerRestaurantDashboardView'

const {
  restaurant,
  occupancy,
  orders,
  recentReservations,
  recentOrders,
  loading,
  revenueMax,
  occupancyPct,
  formatMoney,
  formatTime,
} = useOwnerRestaurantDashboardView()
</script>

<template>
  <div class="owner-dash">
    <div v-if="loading" style="color:#2a2a2a;font-size:0.875rem">Cargando panel…</div>
    <template v-else>
      <div class="owner-dash-header">
        <h1 class="owner-dash-title">{{ restaurant?.name ?? 'Dashboard' }}</h1>
        <p class="owner-dash-subtitle">Resumen de los últimos 7 días.</p>
      </div>

      <!-- KPIs -->
      <div class="owner-dash-kpis">
        <div class="owner-kpi">
          <div class="owner-kpi-label">Reservas</div>
          <div class="owner-kpi-val">{{ occupancy?.totalReservations ?? '—' }}</div>
          <div class="owner-kpi-delta">última semana</div>
          <div class="owner-kpi-sparkline">
            <div
              v-for="(day, i) in (occupancy?.occupancyByDay ?? [])"
              :key="day.date"
              class="owner-kpi-spark-bar"
              :class="{ 'owner-kpi-spark-bar--active': i === (occupancy?.occupancyByDay.length ?? 0) - 1 }"
              :style="{
                height: `${Math.max(4, (day.reservations / Math.max(...(occupancy?.occupancyByDay.map(d => d.reservations) ?? [1]), 1)) * 100)}%`,
              }"
            />
          </div>
        </div>

        <div class="owner-kpi">
          <div class="owner-kpi-label">Pedidos</div>
          <div class="owner-kpi-val">{{ orders?.totalOrders ?? '—' }}</div>
          <div class="owner-kpi-delta">última semana</div>
          <div class="owner-kpi-sparkline">
            <div
              v-for="(day, i) in (orders?.revenueByDay ?? [])"
              :key="day.date"
              class="owner-kpi-spark-bar"
              :class="{ 'owner-kpi-spark-bar--active': i === (orders?.revenueByDay.length ?? 0) - 1 }"
              :style="{ height: `${Math.max(4, (day.orders / Math.max(...(orders?.revenueByDay.map(d => d.orders) ?? [1]), 1)) * 100)}%` }"
            />
          </div>
        </div>

        <div class="owner-kpi">
          <div class="owner-kpi-label">Facturación</div>
          <div class="owner-kpi-val">{{ orders ? formatMoney(orders.totalRevenue) : '—' }}</div>
          <div class="owner-kpi-delta">última semana</div>
          <div class="owner-kpi-sparkline">
            <div
              v-for="(day, i) in (orders?.revenueByDay ?? [])"
              :key="day.date"
              class="owner-kpi-spark-bar"
              :class="{ 'owner-kpi-spark-bar--active': i === (orders?.revenueByDay.length ?? 0) - 1 }"
              :style="{ height: `${Math.max(4, (Number(day.revenue) / revenueMax) * 100)}%` }"
            />
          </div>
        </div>

        <div class="owner-kpi">
          <div class="owner-kpi-label">Ticket promedio</div>
          <div class="owner-kpi-val">{{ orders ? formatMoney(orders.averageOrderValue) : '—' }}</div>
          <div class="owner-kpi-delta">por pedido</div>
          <div class="owner-kpi-sparkline">
            <div
              v-for="i in 7"
              :key="i"
              class="owner-kpi-spark-bar"
              :class="{ 'owner-kpi-spark-bar--active': i === 7 }"
              :style="{ height: `${20 + Math.random() * 60}%` }"
            />
          </div>
        </div>
      </div>

      <!-- Charts row -->
      <div class="owner-dash-charts">
        <!-- Donut: occupancy -->
        <div class="owner-chart-card">
          <div class="owner-chart-label">Ocupación promedio</div>
          <div class="owner-donut-wrap">
            <div class="owner-donut">
              <svg viewBox="0 0 36 36" width="120" height="120">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#0d0d0d" stroke-width="4" />
                <circle
                  cx="18" cy="18" r="14"
                  fill="none"
                  stroke="var(--brand)"
                  stroke-width="4"
                  stroke-dasharray="87.96"
                  :stroke-dashoffset="87.96 * (1 - occupancyPct / 100)"
                  stroke-linecap="round"
                  transform="rotate(-90 18 18)"
                />
              </svg>
              <div class="owner-donut-center">
                <span class="owner-donut-pct">{{ occupancyPct }}%</span>
                <span class="owner-donut-lbl">Ocupación</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Revenue bars -->
        <div class="owner-chart-card">
          <div class="owner-chart-label">Facturación diaria (7 días)</div>
          <div class="owner-revenue-bars">
            <div
              v-for="(day, i) in (orders?.revenueByDay ?? [])"
              :key="day.date"
              class="owner-revenue-bar-col"
            >
              <div
                :class="['owner-revenue-bar', i === (orders?.revenueByDay.length ?? 0) - 1 && 'owner-revenue-bar--last']"
                :style="{ height: `${Math.max(4, (Number(day.revenue) / revenueMax) * 100)}%` }"
              />
              <span class="owner-revenue-bar-date">{{ day.date.slice(5) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom: reservations + orders -->
      <div class="owner-dash-bottom">
        <div class="owner-chart-card">
          <div class="owner-chart-label">Últimas reservas</div>
          <div v-if="recentReservations.length === 0" style="color:#1a1a1a;font-size:0.8125rem">Sin reservas recientes.</div>
          <div class="owner-activity-list">
            <div v-for="r in recentReservations" :key="r.id" class="owner-activity-item">
              <div
                :class="['owner-activity-dot', r.status !== 'CONFIRMED' && 'owner-activity-dot--done']"
              />
              <span class="owner-activity-text">
                {{ r.guestName ?? 'Cliente' }} · {{ r.partySize }} personas · {{ r.timeSlot.slice(0,5) }}
              </span>
              <span class="owner-activity-time">{{ r.date }}</span>
            </div>
          </div>
        </div>

        <div class="owner-chart-card">
          <div class="owner-chart-label">Últimos pedidos</div>
          <div v-if="recentOrders.length === 0" style="color:#1a1a1a;font-size:0.8125rem">Sin pedidos recientes.</div>
          <div class="owner-activity-list">
            <div v-for="o in recentOrders" :key="o.id" class="owner-activity-item">
              <div
                :class="['owner-activity-dot', ['COMPLETED','CANCELLED'].includes(o.status) && 'owner-activity-dot--done']"
              />
              <span class="owner-activity-text">
                {{ formatMoney(o.totalAmount) }} · {{ o.items.length }} ítems
              </span>
              <span class="owner-activity-time">{{ formatTime(o.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style src="./styles/OwnerRestaurantDashboardView.css" scoped></style>
