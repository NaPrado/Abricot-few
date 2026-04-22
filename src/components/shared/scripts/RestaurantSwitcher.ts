import { computed, onMounted, ref } from 'vue'
import { ChevronDown, Check, Store } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/authStore'
import { useRestaurantContextStore } from '@/stores/restaurantContextStore'
import { userService } from '@/services'
import type { Restaurant } from '@/types'

export function useRestaurantSwitcher() {
  const auth = useAuthStore()
  const ctx = useRestaurantContextStore()

  const open = ref(false)
  const loading = ref(false)
  const restaurants = ref<Restaurant[]>([])
  const error = ref<string | null>(null)

  const active = computed<Restaurant | null>(
    () => restaurants.value.find((r) => r.id === ctx.activeRestaurantId) ?? null,
  )

  async function load(): Promise<void> {
    if (!auth.user) return
    loading.value = true
    error.value = null
    try {
      restaurants.value = await userService.listRestaurants(auth.user.id)
      const first = restaurants.value[0]
      if (!ctx.activeRestaurantId && first !== undefined) {
        ctx.setActive(first.id)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'No se pudo cargar tus restaurantes.'
    } finally {
      loading.value = false
    }
  }

  function choose(id: string): void {
    ctx.setActive(id)
    open.value = false
  }

  onMounted(load)

  return {
    ChevronDown,
    Check,
    Store,
    auth,
    ctx,
    open,
    loading,
    restaurants,
    error,
    active,
    choose,
    load,
  }
}
