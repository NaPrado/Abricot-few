<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useAuthStore } from "@/stores/authStore"
import { ApiError } from "@/services/api"

const router = useRouter()
const authStore = useAuthStore()

const name = ref("")
const surname = ref("")
const email = ref("")
const password = ref("")
const errorMsg = ref<string | null>(null)
const isLoading = ref(false)

async function handleSubmit(): Promise<void> {
  errorMsg.value = null
  if (password.value.length < 8) {
    errorMsg.value = "La contraseña debe tener al menos 8 caracteres"
    return
  }
  isLoading.value = true
  try {
    await authStore.register({
      name: name.value,
      surname: surname.value,
      email: email.value,
      password: password.value,
    })
    router.push("/app")
  } catch (e) {
    errorMsg.value = e instanceof ApiError ? e.message : "Error al registrarse"
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
        <RouterLink to="/" class="inline-block hover:opacity-80 transition-opacity">
          <img src="/abricot.png" alt="Abricot" class="h-12 w-auto mx-auto" />
        </RouterLink>
        <p class="text-gray-400 mt-2 text-sm">Creá tu cuenta gratis</p>
      </div>

      <!-- Card -->
      <div class="bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-800">
        <form @submit.prevent="handleSubmit" class="flex flex-col gap-5">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1.5">Nombre</label>
              <input
                v-model="name"
                type="text"
                required
                placeholder="Juan"
                class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1.5">Apellido</label>
              <input
                v-model="surname"
                type="text"
                required
                placeholder="García"
                class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              />
            </div>
          </div>

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
            <label class="block text-sm font-medium text-gray-300 mb-1.5">
              Contraseña
              <span class="text-gray-500 font-normal">(mín. 8 caracteres)</span>
            </label>
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
            {{ isLoading ? "Creando cuenta..." : "Crear cuenta" }}
          </button>
        </form>
      </div>

      <p class="text-center text-sm text-gray-500 mt-6">
        ¿Ya tenés cuenta?
        <RouterLink to="/login" class="text-orange-400 hover:text-orange-300 font-medium">
          Iniciar sesión
        </RouterLink>
      </p>
    </div>
  </div>
</template>
