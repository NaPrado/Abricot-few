<script setup lang="ts">
import { useNotificationStore } from '@/stores/notificationStore'

const notificationStore = useNotificationStore()
</script>

<template>
  <nav class="flex h-full w-64 flex-col bg-gray-900 px-4 py-6">
    <div class="mb-8 px-2">
      <span class="text-xl font-bold text-white">🍑 Abricot</span>
    </div>

    <ul class="flex flex-col gap-1">
      <li>
        <RouterLink
          to="/"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
          exact-active-class="bg-gray-800 text-white"
        >
          <span>📊</span> Dashboard
        </RouterLink>
      </li>
      <li>
        <RouterLink
          to="/reservations"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
          exact-active-class="bg-gray-800 text-white"
        >
          <span>📅</span> Reservas
        </RouterLink>
      </li>
      <li>
        <RouterLink
          to="/orders"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
          exact-active-class="bg-gray-800 text-white"
        >
          <span>🛒</span> Pedidos
        </RouterLink>
      </li>
      <li>
        <RouterLink
          to="/notifications"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
          exact-active-class="bg-gray-800 text-white"
        >
          <span>🔔</span>
          <span class="flex-1">Notificaciones</span>
          <span
            v-if="notificationStore.unreadCount > 0"
            class="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white"
          >
            {{ notificationStore.unreadCount }}
          </span>
        </RouterLink>
      </li>
      <li>
        <RouterLink
          to="/analytics"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
          exact-active-class="bg-gray-800 text-white"
        >
          <span>📈</span> Analytics
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>
