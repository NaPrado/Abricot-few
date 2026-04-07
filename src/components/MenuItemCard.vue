<script setup lang="ts">
import type { MenuItem } from '@/types/index'

defineProps<{ item: MenuItem }>()
const emit = defineEmits<{ 'add-to-cart': [item: MenuItem] }>()
</script>

<template>
  <div class="flex flex-col rounded-xl bg-white p-4 shadow-sm">
    <div class="mb-3 flex h-24 items-center justify-center rounded-lg bg-gray-100 text-4xl">
      🍽️
    </div>
    <p class="font-semibold text-gray-900">{{ item.name }}</p>
    <p class="mt-1 flex-1 text-xs text-gray-400">{{ item.description }}</p>
    <div class="mt-4 flex items-center justify-between">
      <span class="font-bold text-gray-900">${{ item.price.toLocaleString('es-AR') }}</span>
      <button
        class="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700"
        @click="emit('add-to-cart', item)"
      >
        Agregar
      </button>
    </div>
  </div>
</template>
