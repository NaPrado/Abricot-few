import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'abricot_active_restaurant_id'

export const useRestaurantContextStore = defineStore('restaurantContext', () => {
  const activeRestaurantId = ref<string | null>(localStorage.getItem(STORAGE_KEY))

  function setActive(id: string): void {
    activeRestaurantId.value = id
    localStorage.setItem(STORAGE_KEY, id)
  }

  function clear(): void {
    activeRestaurantId.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  return { activeRestaurantId, setActive, clear }
})
