<script setup lang="ts">
import { useRouter } from "vue-router"
import { useAuthStore } from "@/stores/authStore"
import { LogOut } from "lucide-vue-next"

const router = useRouter()
const authStore = useAuthStore()

function logout(): void {
  authStore.logout()
  router.push("/login")
}
</script>

<template>
  <nav class="flex h-full w-64 flex-col bg-gray-900 px-4 py-6">
    <!-- Logo -->
    <div class="mb-8 px-2">
      <RouterLink to="/" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <img src="/abricot.png" alt="Abricot" class="h-8 w-auto" />
        <span class="text-xl font-bold text-white">Abricot</span>
      </RouterLink>
    </div>

    <!-- Nav links -->
    <ul class="flex flex-col gap-1 flex-1">
      <li>
        <RouterLink
          to="/app/restaurants"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          active-class="bg-gray-800 text-white"
        >
          <span>🏠</span> Restaurantes
        </RouterLink>
      </li>
    </ul>

    <!-- User + logout -->
    <div class="border-t border-gray-800 pt-4 mt-4">
      <div class="px-3 mb-3">
        <p class="text-xs text-gray-400 truncate">
          {{ authStore.user?.name }} {{ authStore.user?.surname }}
        </p>
        <p class="text-xs text-gray-500 truncate">{{ authStore.user?.email }}</p>
      </div>
      <button
        @click="logout"
        class="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
      >
        <LogOut :size="16" /> Cerrar sesión
      </button>
    </div>
  </nav>
</template>
