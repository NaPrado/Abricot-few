import type { Restaurant } from '@/types'
import { useLookupStore } from '@/stores/lookupStore'

/**
 * Decorate a swagger-shape restaurant (flat IDs) with the optional nested objects the UI
 * components consume. Best-effort — only fills in fields whose ID is already cached in the
 * lookup store. Returns the same restaurant when nothing is enrichable.
 */
export function hydrateRestaurantWithLookups(restaurant: Restaurant): Restaurant {
  const store = useLookupStore()

  const next: Restaurant = { ...restaurant }

  if (!next.city) {
    const city = store.asRestaurantCity(next.cityId)
    if (city) next.city = city
  }
  if (next.neighbourhood === undefined) {
    const nb = store.asRestaurantNeighbourhood(next.neighbourhoodId)
    next.neighbourhood = nb ?? null
  }
  if (next.priceRange === undefined) {
    const pr = store.asRestaurantPriceRange(next.priceRangeId)
    next.priceRange = pr ?? null
  }
  if (!next.cuisineTypes) {
    next.cuisineTypes = store.asRestaurantCuisineTypes(next.cuisineTypeIds)
  }

  return next
}

export function hydrateRestaurantList(list: Restaurant[]): Restaurant[] {
  return list.map(hydrateRestaurantWithLookups)
}

/**
 * Ensure the lookup catalogues that drive label resolution are loaded. Safe to call
 * repeatedly — internal flags prevent duplicate requests.
 */
export async function ensureRestaurantLookupCatalogues(): Promise<void> {
  const store = useLookupStore()
  await Promise.all([store.ensureCuisines(), store.ensurePriceRanges()])
}
