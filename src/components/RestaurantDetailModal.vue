<script setup lang="ts">
import { X } from "lucide-vue-next"
import type { Restaurant } from "@/types"

defineProps<{ restaurant: Restaurant }>()
const emit = defineEmits<{ (e: "close"): void }>()

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
    @click.self="emit('close')"
  >
    <div class="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-5 border-b border-gray-800">
        <h2 class="text-lg font-semibold text-white">{{ restaurant.name }}</h2>
        <button @click="emit('close')" class="text-gray-400 hover:text-white transition-colors">
          <X :size="18" />
        </button>
      </div>

      <!-- Body -->
      <div class="px-6 py-6 flex flex-col gap-4 text-sm">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-gray-500 text-xs mb-1">Dirección</p>
            <p class="text-white">{{ restaurant.address }}</p>
          </div>
          <div>
            <p class="text-gray-500 text-xs mb-1">Teléfono</p>
            <p class="text-white">{{ restaurant.phone }}</p>
          </div>
        </div>

        <div>
          <p class="text-gray-500 text-xs mb-1">Email</p>
          <p class="text-white">{{ restaurant.email ?? "—" }}</p>
        </div>

        <div>
          <p class="text-gray-500 text-xs mb-1">Descripción</p>
          <p class="text-white leading-relaxed">{{ restaurant.description ?? "—" }}</p>
        </div>

        <div>
          <p class="text-gray-500 text-xs mb-1">Alta</p>
          <p class="text-gray-400">{{ formatDate(restaurant.createdAt) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
