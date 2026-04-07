<script setup lang="ts">
import { onMounted } from 'vue'
import { useAnalyticsStore } from '@/stores/analyticsStore'
import OccupancyChart from '@/components/OccupancyChart.vue'
import PeakHoursChart from '@/components/PeakHoursChart.vue'

const store = useAnalyticsStore()

onMounted(() => {
  store.loadAnalytics()
})
</script>

<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold text-gray-900">Analytics</h1>

    <p v-if="store.isLoading" class="text-sm text-gray-500">Cargando métricas desde la nube...</p>

    <template v-else-if="store.metrics">
      <div class="mb-8 rounded-xl bg-white p-6 shadow-sm">
        <p class="text-sm font-medium text-gray-500">Ingresos Totales (últimos 7 días)</p>
        <p class="mt-2 text-4xl font-bold text-gray-900">
          ${{ store.metrics.revenue.toLocaleString('es-AR') }}
        </p>
      </div>

      <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div class="rounded-xl bg-white p-6 shadow-sm">
          <h2 class="mb-4 text-sm font-semibold text-gray-700">Ocupación semanal</h2>
          <OccupancyChart :data="store.metrics.occupancy" />
        </div>

        <div class="rounded-xl bg-white p-6 shadow-sm">
          <h2 class="mb-4 text-sm font-semibold text-gray-700">Horas pico</h2>
          <PeakHoursChart :data="store.metrics.peakHours" />
        </div>
      </div>
    </template>
  </div>
</template>
