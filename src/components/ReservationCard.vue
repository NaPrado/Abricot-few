<script setup lang="ts">
import type { Reservation, ReservationStatus } from '@/types/index'

defineProps<{ reservation: Reservation }>()

const statusConfig: Record<ReservationStatus, { label: string; classes: string }> = {
  CONFIRMED: { label: 'Confirmada', classes: 'bg-green-100 text-green-800' },
  PENDING: { label: 'Pendiente', classes: 'bg-yellow-100 text-yellow-800' },
  CANCELLED: { label: 'Cancelada', classes: 'bg-red-100 text-red-800' },
}
</script>

<template>
  <div class="rounded-xl bg-white p-5 shadow-sm">
    <div class="mb-3 flex items-start justify-between">
      <p class="font-semibold text-gray-900">{{ reservation.customerName }}</p>
      <span
        class="rounded-full px-2.5 py-0.5 text-xs font-medium"
        :class="statusConfig[reservation.status].classes"
      >
        {{ statusConfig[reservation.status].label }}
      </span>
    </div>

    <div class="flex flex-col gap-1 text-sm text-gray-500">
      <p>📅 {{ reservation.date }} · {{ reservation.time }}</p>
      <p>👥 {{ reservation.guests }} personas</p>
    </div>
  </div>
</template>
