import { ref } from 'vue'
import { HttpError } from '@/services/http'
import { restaurantService } from '@/services'
import type { ApiId } from '@/types'

/**
 * Lazy resolver for restaurantId → name. Used by customer-side views (orders / reservations /
 * notification preferences) that receive flat IDs from the API. Caches results in-memory for
 * the component lifetime; falls back to a short ID slice when the restaurant cannot be loaded
 * (e.g. 404, 403).
 */
export function useRestaurantNames() {
  const namesById = ref<Map<string, string>>(new Map())
  const inflight = new Map<string, Promise<void>>()

  async function ensure(restaurantId: ApiId): Promise<void> {
    if (!restaurantId) return
    if (namesById.value.has(restaurantId)) return
    if (inflight.has(restaurantId)) return inflight.get(restaurantId)

    const promise = (async () => {
      try {
        const r = await restaurantService.getById(restaurantId)
        namesById.value.set(restaurantId, r.name)
      } catch (error) {
        if (!(error instanceof HttpError)) throw error
        namesById.value.set(restaurantId, '')
      } finally {
        inflight.delete(restaurantId)
      }
    })()
    inflight.set(restaurantId, promise)
    return promise
  }

  async function ensureMany(ids: Iterable<ApiId>): Promise<void> {
    const unique = new Set<string>()
    for (const id of ids) if (id) unique.add(id)
    await Promise.all([...unique].map(id => ensure(id)))
  }

  function nameFor(restaurantId: ApiId | null | undefined, fallback?: string): string {
    if (!restaurantId) return fallback ?? ''
    const cached = namesById.value.get(restaurantId)
    if (cached) return cached
    return fallback ?? `Restaurante ${restaurantId.slice(0, 6)}`
  }

  return { namesById, ensure, ensureMany, nameFor }
}
