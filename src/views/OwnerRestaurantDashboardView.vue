<script setup lang="ts">
import { useOwnerRestaurantDashboardView } from './scripts/OwnerRestaurantDashboardView'

const {
  restaurant,
  metrics,
  orders,
  recentReservations,
  recentOrders,
  loading,
  widgetCopied,
  widgetUrl,
  widgetIframeSnippet,
  revenueMax,
  formatMoney,
  formatTime,
  copyWidgetSnippet,
} = useOwnerRestaurantDashboardView()
</script>

<template>
  <div class="owner-dash">
    <div v-if="loading" style="color:var(--text-muted);font-size:0.875rem">Cargando panel…</div>
    <template v-else>
      <div class="owner-dash-header">
        <h1 class="owner-dash-title">{{ restaurant?.name ?? 'Dashboard' }}</h1>
        <p class="owner-dash-subtitle">Resumen de los últimos 7 días.</p>
      </div>

      <section class="owner-widget-card" aria-labelledby="reservation-widget-title">
        <div>
          <p class="owner-widget-eyebrow">Widget de reservas</p>
          <h2 id="reservation-widget-title">Reservas online para web y redes</h2>
          <p class="owner-widget-copy">
            Compartí el link directo o pegá el iframe en la web del restaurante. El cliente elige
            fecha y horario, el sistema valida cupo y registra la reserva sin login.
          </p>
        </div>

        <div class="owner-widget-actions">
          <a class="owner-widget-link" :href="widgetUrl" target="_blank" rel="noopener noreferrer">
            Abrir widget
          </a>
          <button class="owner-widget-button" type="button" @click="copyWidgetSnippet">
            {{ widgetCopied ? 'Copiado' : 'Copiar iframe' }}
          </button>
        </div>

        <label class="owner-widget-snippet">
          <span>Código para insertar</span>
          <textarea :value="widgetIframeSnippet" readonly rows="3" />
        </label>
      </section>

      <!-- KPIs -->
      <div class="owner-dash-kpis">
        <div class="owner-kpi">
          <div class="owner-kpi-label">Reservas</div>
          <div class="owner-kpi-val">{{ metrics?.totalReservations ?? '—' }}</div>
          <div class="owner-kpi-delta">última semana</div>
          <div class="owner-kpi-sparkline">
            <div class="owner-kpi-spark-bar owner-kpi-spark-bar--active" style="height: 72%" />
          </div>
        </div>

        <div class="owner-kpi">
          <div class="owner-kpi-label">Pedidos</div>
          <div class="owner-kpi-val">{{ orders?.totalOrders ?? '—' }}</div>
          <div class="owner-kpi-delta">última semana</div>
          <div class="owner-kpi-sparkline">
            <div
              v-for="(day, i) in (orders?.revenueByDay ?? [])"
              :key="day.date ?? `o-${i}`"
              class="owner-kpi-spark-bar"
              :class="{ 'owner-kpi-spark-bar--active': i === (orders?.revenueByDay?.length ?? 0) - 1 }"
              :style="{ height: `${Math.max(4, (Number(day.orders) / Math.max(...(orders?.revenueByDay?.map(d => Number(d.orders) || 0) ?? [1]), 1)) * 100)}%` }"
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
              :key="day.date ?? `r-${i}`"
              class="owner-kpi-spark-bar"
              :class="{ 'owner-kpi-spark-bar--active': i === (orders?.revenueByDay?.length ?? 0) - 1 }"
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
        <div class="owner-chart-card">
          <div class="owner-chart-label">Métricas generales</div>
          <div style="display:flex;gap:1.5rem;align-items:center;min-height:120px">
            <div>
              <div class="owner-kpi-label">Reservas</div>
              <div class="owner-kpi-val">{{ metrics?.totalReservations ?? '—' }}</div>
            </div>
            <div>
              <div class="owner-kpi-label">Pedidos</div>
              <div class="owner-kpi-val">{{ metrics?.totalOrders ?? orders?.totalOrders ?? '—' }}</div>
            </div>
            <div>
              <div class="owner-kpi-label">Facturación</div>
              <div class="owner-kpi-val">
                {{ metrics ? formatMoney(metrics.totalRevenue) : orders ? formatMoney(orders.totalRevenue) : '—' }}
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
              :key="day.date ?? i"
              class="owner-revenue-bar-col"
            >
              <div
                :class="['owner-revenue-bar', i === (orders?.revenueByDay?.length ?? 0) - 1 && 'owner-revenue-bar--last']"
                :style="{ height: `${Math.max(4, (Number(day.revenue) / revenueMax) * 100)}%` }"
              />
              <span class="owner-revenue-bar-date">{{ day.date?.slice(5) ?? '—' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom: reservations + orders -->
      <div class="owner-dash-bottom">
        <div class="owner-chart-card">
          <div class="owner-chart-label">Últimas reservas</div>
          <div v-if="recentReservations.length === 0" style="color:var(--text-secondary);font-size:0.8125rem">Sin reservas recientes.</div>
          <div class="owner-activity-list">
            <div v-for="r in recentReservations" :key="r.id" class="owner-activity-item">
              <div
                :class="['owner-activity-dot', r.status !== 'CONFIRMED' && 'owner-activity-dot--done']"
              />
              <span class="owner-activity-text">
                {{ r.guestName ?? 'Cliente' }} · {{ r.partySize }} personas · {{ r.timeSlot?.slice(0, 5) ?? '—' }}
              </span>
              <span class="owner-activity-time">{{ r.date }}</span>
            </div>
          </div>
        </div>

        <div class="owner-chart-card">
          <div class="owner-chart-label">Últimos pedidos</div>
          <div v-if="recentOrders.length === 0" style="color:var(--text-secondary);font-size:0.8125rem">Sin pedidos recientes.</div>
          <div class="owner-activity-list">
            <div v-for="o in recentOrders" :key="o.id" class="owner-activity-item">
              <div
                :class="['owner-activity-dot', ['COMPLETED','CANCELLED'].includes(o.status) && 'owner-activity-dot--done']"
              />
              <span class="owner-activity-text">
                {{ formatMoney(o.totalAmount) }} · {{ o.items?.length ?? 0 }} ítems
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
