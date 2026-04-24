import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { userService } from '@/services'
import { useAuthStore } from '@/stores/authStore'
import type { Restaurant } from '@/types'

export function useRestaurantsView() {
  const authStore = useAuthStore()
  const router = useRouter()

  const restaurants = ref<Restaurant[]>([])
  const loading = ref(true)

  function colorBg(id: string): string {
    const colors = ['#1a1208', '#0a0f1a', '#120a08', '#100808', '#080f0a', '#0f0f08']
    const idx = id.charCodeAt(0) % colors.length
    return colors[idx] ?? '#111'
  }

  function navigate(id: string) {
    void router.push(`/app/restaurants/${id}`)
  }

  onMounted(async () => {
    if (!authStore.user) return
    try {
      restaurants.value = await userService.listRestaurants(authStore.user.id)
    } catch {
      // silently degrade
    } finally {
      loading.value = false
    }
  })

  return { restaurants, loading, colorBg, navigate }
}
