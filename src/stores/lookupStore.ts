import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { lookupService } from '@/services'
import type {
  ApiId,
  City,
  Cuisine,
  Neighbourhood,
  PriceRange,
  RestaurantCity,
  RestaurantCuisineType,
  RestaurantNeighbourhood,
  RestaurantPriceRange,
} from '@/types'

interface LoadState {
  cuisines: boolean
  priceRanges: boolean
  neighbourhoodsByCity: Set<string>
  citiesByProvince: Set<string>
}

export const useLookupStore = defineStore('lookups', () => {
  const cuisines = ref<Cuisine[]>([])
  const priceRanges = ref<PriceRange[]>([])
  const citiesById = ref<Map<string, City>>(new Map())
  const neighbourhoodsById = ref<Map<string, Neighbourhood>>(new Map())

  const loaded: LoadState = {
    cuisines: false,
    priceRanges: false,
    neighbourhoodsByCity: new Set(),
    citiesByProvince: new Set(),
  }

  const cuisineById = computed(() => {
    const map = new Map<string, Cuisine>()
    for (const c of cuisines.value) map.set(c.id, c)
    return map
  })

  const priceRangeById = computed(() => {
    const map = new Map<string, PriceRange>()
    for (const p of priceRanges.value) map.set(p.id, p)
    return map
  })

  async function ensureCuisines(): Promise<void> {
    if (loaded.cuisines) return
    cuisines.value = await lookupService.getCuisines()
    loaded.cuisines = true
  }

  async function ensurePriceRanges(): Promise<void> {
    if (loaded.priceRanges) return
    priceRanges.value = await lookupService.getPriceRanges()
    loaded.priceRanges = true
  }

  async function ensureCitiesForProvince(provinceId: ApiId): Promise<City[]> {
    if (!loaded.citiesByProvince.has(provinceId)) {
      const cities = await lookupService.getCitiesByProvince(provinceId)
      for (const c of cities) citiesById.value.set(c.id, { ...c, provinceId: c.provinceId ?? provinceId })
      loaded.citiesByProvince.add(provinceId)
      return cities
    }
    return [...citiesById.value.values()].filter(c => c.provinceId === provinceId)
  }

  async function ensureNeighbourhoodsForCity(cityId: ApiId): Promise<Neighbourhood[]> {
    if (!loaded.neighbourhoodsByCity.has(cityId)) {
      const list = await lookupService.getNeighbourhoodsByCity(cityId)
      for (const n of list) neighbourhoodsById.value.set(n.id, { ...n, cityId: n.cityId ?? cityId })
      loaded.neighbourhoodsByCity.add(cityId)
      return list
    }
    return [...neighbourhoodsById.value.values()].filter(n => n.cityId === cityId)
  }

  function seedCity(city: City): void {
    citiesById.value.set(city.id, city)
  }

  function seedNeighbourhood(n: Neighbourhood): void {
    neighbourhoodsById.value.set(n.id, n)
  }

  function asRestaurantCity(cityId: ApiId | null | undefined): RestaurantCity | undefined {
    if (!cityId) return undefined
    const city = citiesById.value.get(cityId)
    if (!city) return undefined
    return { id: city.id, name: city.name }
  }

  function asRestaurantNeighbourhood(id: ApiId | null | undefined): RestaurantNeighbourhood | undefined {
    if (!id) return undefined
    const n = neighbourhoodsById.value.get(id)
    if (!n) return undefined
    return { id: n.id, name: n.name }
  }

  function asRestaurantPriceRange(id: ApiId | null | undefined): RestaurantPriceRange | undefined {
    if (!id) return undefined
    return priceRangeById.value.get(id)
  }

  function asRestaurantCuisineTypes(ids: ApiId[] | null | undefined): RestaurantCuisineType[] {
    if (!ids?.length) return []
    const out: RestaurantCuisineType[] = []
    for (const id of ids) {
      const c = cuisineById.value.get(id)
      if (c) out.push(c)
    }
    return out
  }

  return {
    cuisines,
    priceRanges,
    citiesById,
    neighbourhoodsById,
    cuisineById,
    priceRangeById,
    ensureCuisines,
    ensurePriceRanges,
    ensureCitiesForProvince,
    ensureNeighbourhoodsForCity,
    seedCity,
    seedNeighbourhood,
    asRestaurantCity,
    asRestaurantNeighbourhood,
    asRestaurantPriceRange,
    asRestaurantCuisineTypes,
  }
})
