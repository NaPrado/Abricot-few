<script setup lang="ts">
import { onMounted } from 'vue'
import { useOrderStore } from '@/stores/orderStore'
import MenuItemCard from '@/components/MenuItemCard.vue'
import CartSidebar from '@/components/CartSidebar.vue'

const store = useOrderStore()

onMounted(() => {
  store.loadMenu()
})
</script>

<template>
  <div class="flex h-full">
    <div class="flex-1 overflow-y-auto p-6">
      <h1 class="mb-6 text-2xl font-bold text-gray-900">Pedidos</h1>

      <p v-if="store.isLoading" class="text-sm text-gray-500">Cargando menú desde la nube...</p>

      <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <MenuItemCard
          v-for="item in store.menuItems"
          :key="item.id"
          :item="item"
          @add-to-cart="store.addToCart"
        />
      </div>
    </div>

    <CartSidebar />
  </div>
</template>
