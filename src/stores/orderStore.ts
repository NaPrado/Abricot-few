import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MenuItem, OrderItem } from '@/types/index'
import { fetchMenuItems } from '@/services/mock/menuService'

export const useOrderStore = defineStore('order', () => {
  const menuItems = ref<MenuItem[]>([])
  const cart = ref<OrderItem[]>([])
  const isLoading = ref(false)

  const cartTotal = computed(() =>
    cart.value.reduce((sum, entry) => sum + entry.menuItem.price * entry.quantity, 0),
  )

  async function loadMenu(): Promise<void> {
    isLoading.value = true
    menuItems.value = await fetchMenuItems()
    isLoading.value = false
  }

  function addToCart(item: MenuItem): void {
    const existing = cart.value.find((entry) => entry.menuItem.id === item.id)
    if (existing) {
      existing.quantity++
    } else {
      cart.value.push({ menuItem: item, quantity: 1 })
    }
  }

  function removeFromCart(itemId: string): void {
    cart.value = cart.value.filter((entry) => entry.menuItem.id !== itemId)
  }

  function checkout(): void {
    cart.value = []
    console.log('✅ Pedido confirmado y enviado a cocina.')
  }

  return { menuItems, cart, isLoading, cartTotal, loadMenu, addToCart, removeFromCart, checkout }
})
