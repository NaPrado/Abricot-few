<script setup lang="ts">
import { ref } from "vue"
import { useRouter, useRoute } from "vue-router"
import { useAuthStore } from "@/stores/authStore"
import { ApiError } from "@/services/api"

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const sessionExpired = route.query.expired === "1"

const email = ref("")
const password = ref("")
const errorMsg = ref<string | null>(null)
const isLoading = ref(false)

async function handleSubmit(): Promise<void> {
  errorMsg.value = null
  isLoading.value = true
  try {
    await authStore.login({ email: email.value, password: password.value })
    router.push("/app")
  } catch (e) {
    errorMsg.value = e instanceof ApiError ? e.message : "Error al iniciar sesión"
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-950 flex items-center justify-center px-4">
    <div class="w-full max-w-sm">
      <!-- Logo -->
      <div class="text-center mb-8">
        <RouterLink to="/" class="text-3xl font-bold text-white">🍑 Abricot</RouterLink>
        <p class="text-gray-400 mt-2 text-sm">Iniciá sesión en tu cuenta</p>
      </div>

      <!-- Session expired banner -->
      <div
        v-if="sessionExpired"
        class="mb-4 flex items-center gap-3 bg-yellow-900/40 border border-yellow-700/50 text-yellow-300 rounded-xl px-4 py-3 text-sm"
      >
        <span>⚠️</span>
        Tu sesión expiró. Iniciá sesión nuevamente.
      </div>

      <!-- Card -->
      <div class="bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-800">
        <form @submit.prevent="handleSubmit" class="flex flex-col gap-5">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <input
              v-model="email"
              type="email"
              required
              placeholder="hola@restaurante.com"
              class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1.5">Contraseña</label>
            <input
              v-model="password"
              type="password"
              required
              placeholder="••••••••"
              class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
            />
          </div>

          <p v-if="errorMsg" class="text-red-400 text-sm text-center">{{ errorMsg }}</p>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
          >
            {{ isLoading ? "Ingresando..." : "Iniciar sesión" }}
          </button>
        </form>
      </div>

      <p class="text-center text-sm text-gray-500 mt-6">
        ¿No tenés cuenta?
        <RouterLink to="/register" class="text-orange-400 hover:text-orange-300 font-medium">
          Registrate
        </RouterLink>
      </p>
    </div>
  </div>
</template>
