<script setup lang="ts">
import { ref, watch } from "vue"
import type { Restaurant, RestaurantCreateRequest } from "@/types"

interface Props {
  restaurant?: Restaurant | null
}

const props = withDefaults(defineProps<Props>(), { restaurant: null })
const emit = defineEmits<{
  (e: "save", payload: RestaurantCreateRequest): void
  (e: "close"): void
}>()

const name = ref("")
const address = ref("")
const phone = ref("")
const email = ref("")
const description = ref("")

watch(
  () => props.restaurant,
  (r) => {
    name.value = r?.name ?? ""
    address.value = r?.address ?? ""
    phone.value = r?.phone ?? ""
    email.value = r?.email ?? ""
    description.value = r?.description ?? ""
  },
  { immediate: true },
)

function handleSubmit(): void {
  const payload: RestaurantCreateRequest = {
    name: name.value,
    address: address.value,
    phone: phone.value,
  }
  if (email.value) payload.email = email.value
  if (description.value) payload.description = description.value
  emit("save", payload)
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
    @click.self="emit('close')"
  >
    <div class="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-5 border-b border-gray-800">
        <h2 class="text-lg font-semibold text-white">
          {{ restaurant ? "Editar restaurante" : "Nuevo restaurante" }}
        </h2>
        <button
          @click="emit('close')"
          class="text-gray-400 hover:text-white transition-colors text-xl leading-none"
        >
          ✕
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="px-6 py-6 flex flex-col gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1.5">
            Nombre <span class="text-red-400">*</span>
          </label>
          <input
            v-model="name"
            type="text"
            required
            placeholder="La Parolaccia"
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1.5">
            Dirección <span class="text-red-400">*</span>
          </label>
          <input
            v-model="address"
            type="text"
            required
            placeholder="Av. Corrientes 1234, CABA"
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1.5">
            Teléfono <span class="text-red-400">*</span>
          </label>
          <input
            v-model="phone"
            type="text"
            required
            placeholder="+54 11 4444-5555"
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1.5">Email (opcional)</label>
          <input
            v-model="email"
            type="email"
            placeholder="reservas@restaurante.com"
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1.5">
            Descripción (opcional)
          </label>
          <textarea
            v-model="description"
            rows="3"
            placeholder="Breve descripción del restaurante..."
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm resize-none"
          />
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-2">
          <button
            type="button"
            @click="emit('close')"
            class="flex-1 py-2.5 rounded-lg border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 text-sm font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="flex-1 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition-colors"
          >
            {{ restaurant ? "Guardar cambios" : "Crear restaurante" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
