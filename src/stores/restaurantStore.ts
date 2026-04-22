import { defineStore } from "pinia"
import { ref } from "vue"
import { restaurantService } from '@/services'
import type { ApiId, Restaurant, RestaurantCreateRequest, RestaurantUpdateRequest } from '@/types'

export const useRestaurantStore = defineStore("restaurant", () => {
  const restaurants = ref<Restaurant[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const res = await restaurantService.getAll()
      restaurants.value = res.data
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Error al cargar restaurantes"
    } finally {
      isLoading.value = false
    }
  }

  async function create(payload: RestaurantCreateRequest): Promise<Restaurant> {
    const created = await restaurantService.create(payload)
    restaurants.value.push(created)
    return created
  }

  async function update(id: ApiId, payload: RestaurantUpdateRequest): Promise<void> {
    const updated = await restaurantService.update(id, payload)
    const idx = restaurants.value.findIndex((r) => r.id === id)
    if (idx !== -1) restaurants.value[idx] = updated
  }

  async function remove(id: ApiId): Promise<void> {
    await restaurantService.delete(id)
    restaurants.value = restaurants.value.filter((r) => r.id !== id)
  }

  async function uploadPhoto(id: ApiId, file: File): Promise<void> {
    const res = await restaurantService.uploadPhoto(id, file)
    const idx = restaurants.value.findIndex((r) => r.id === id)
    if (idx !== -1) {
      Object.assign(restaurants.value[idx]!, { photoUrl: res.photoUrl })
    }
  }

  return { restaurants, isLoading, error, fetchAll, create, update, remove, uploadPhoto }
})
