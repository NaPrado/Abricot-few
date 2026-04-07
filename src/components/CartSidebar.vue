<script setup lang="ts">
import { useOrderStore } from '@/stores/orderStore'

const store = useOrderStore()
</script>

<template>
  <aside class="flex w-80 flex-col border-l border-gray-200 bg-white p-6">
    <h2 class="mb-4 text-lg font-bold text-gray-900">Tu Pedido</h2>

    <div v-if="store.cart.length === 0" class="flex flex-1 items-center justify-center">
      <p class="text-sm text-gray-400">Carrito vacío</p>
    </div>

    <ul v-else class="flex-1 divide-y divide-gray-100 overflow-y-auto">
      <li
        v-for="entry in store.cart"
        :key="entry.menuItem.id"
        class="flex items-center justify-between py-3"
      >
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-gray-900">
            {{ entry.quantity }}× {{ entry.menuItem.name }}
          </p>
          <p class="text-xs text-gray-400">
            ${{ (entry.menuItem.price * entry.quantity).toLocaleString('es-AR') }}
          </p>
        </div>
        <button
          class="ml-3 text-xs text-red-400 hover:text-red-600"
          @click="store.removeFromCart(entry.menuItem.id)"
        >
          ✕
        </button>
      </li>
    </ul>

    <div class="mt-4 border-t border-gray-200 pt-4">
      <div class="mb-4 flex items-center justify-between">
        <span class="font-semibold text-gray-700">Total</span>
        <span class="font-bold text-gray-900">${{ store.cartTotal.toLocaleString('es-AR') }}</span>
      </div>
      <button
        class="w-full rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="store.cart.length === 0"
        @click="store.checkout()"
      >
        Confirmar Pedido
      </button>
    </div>
  </aside>
</template>
