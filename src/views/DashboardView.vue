<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useReservationStore } from '@/stores/reservationStore'
import { useOrderStore } from '@/stores/orderStore'
import { useAnalyticsStore } from '@/stores/analyticsStore'

const reservationStore = useReservationStore()
const orderStore = useOrderStore()
const analyticsStore = useAnalyticsStore()

onMounted(() => {
  reservationStore.loadReservations()
  orderStore.loadMenu()
  analyticsStore.loadAnalytics()
})

const pendingReservations = computed(
  () => reservationStore.reservations.filter((r) => r.status === 'PENDING').length,
)

const avgOccupancy = computed(() => {
  const data = analyticsStore.metrics?.occupancy
  if (!data || data.length === 0) return 0
  const sum = data.reduce((acc, d) => acc + d.value, 0)
  return Math.round(sum / data.length)
})
</script>

<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold text-gray-900">Dashboard en Tiempo Real</h1>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div class="rounded-xl bg-white p-6 shadow-sm">
        <p class="text-sm font-medium text-gray-500">Reservas Pendientes</p>
        <p class="mt-2 text-4xl font-bold text-gray-900">{{ pendingReservations }}</p>
      </div>

      <div class="rounded-xl bg-white p-6 shadow-sm">
        <p class="text-sm font-medium text-gray-500">Ítems en Menú</p>
        <p class="mt-2 text-4xl font-bold text-gray-900">{{ orderStore.menuItems.length }}</p>
      </div>

      <div class="rounded-xl bg-white p-6 shadow-sm">
        <p class="text-sm font-medium text-gray-500">Ocupación Promedio</p>
        <p class="mt-2 text-4xl font-bold text-gray-900">{{ avgOccupancy }}%</p>
      </div>
    </div>
  </div>
</template>
