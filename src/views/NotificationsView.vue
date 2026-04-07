<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useNotificationStore } from '@/stores/notificationStore'
import { start, stop } from '@/services/mock/notificationSimulator'

const store = useNotificationStore()

onMounted(() => start())
onUnmounted(() => stop())

function formatTime(date: Date): string {
  return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Notificaciones</h1>
      <button
        class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
        :disabled="store.notifications.length === 0"
        @click="store.clearAll()"
      >
        Limpiar todas
      </button>
    </div>

    <div v-if="store.notifications.length === 0" class="py-16 text-center text-sm text-gray-400">
      No hay notificaciones. El simulador enviará eventos en unos segundos...
    </div>

    <ul class="flex flex-col gap-3">
      <li
        v-for="notification in store.notifications"
        :key="notification.id"
        class="flex items-start justify-between rounded-xl p-4 shadow-sm"
        :class="notification.read ? 'bg-white' : 'bg-blue-50'"
      >
        <div class="flex items-start gap-3">
          <span
            class="mt-1.5 h-2 w-2 shrink-0 rounded-full"
            :class="notification.read ? 'bg-gray-300' : 'bg-blue-500'"
          />
          <div>
            <p class="text-sm font-medium text-gray-900">{{ notification.message }}</p>
            <p class="mt-0.5 text-xs text-gray-400">{{ formatTime(notification.timestamp) }}</p>
          </div>
        </div>
        <button
          v-if="!notification.read"
          class="ml-4 shrink-0 text-xs text-blue-500 hover:text-blue-700"
          @click="store.markAsRead(notification.id)"
        >
          Marcar leída
        </button>
      </li>
    </ul>
  </div>
</template>
