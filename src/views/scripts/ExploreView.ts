import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { restaurantService } from '@/services'
import { debugError, debugSection } from '@/utils/debug'
import { extractRestaurantList } from '@/utils/restaurantResponses'
import {
  ensureRestaurantLookupCatalogues,
  hydrateRestaurantList,
} from '@/utils/restaurantHydration'
import type { Restaurant } from '@/types'

const PRICE_OPTIONS = ['Todos', '$', '$$', '$$$', '$$$$']
const CUISINE_TAGS = ['Todas', 'Parrilla', 'Japonés', 'Café', 'Vegano', 'Italiano', 'Mexicano', 'Árabe']
const SORT_OPTIONS = [
  { label: 'Relevancia', value: 'relevance' },
  { label: 'Mejor calificación', value: 'rating' },
  { label: 'Más nuevos', value: 'newest' },
]

export function useExploreView() {
  const route = useRoute()
  const router = useRouter()

  const restaurants = ref<Restaurant[]>([])
  const loading = ref(true)
  const searchQuery = ref((route.query.q as string) ?? '')
  const activeSort = ref('relevance')
  const activeCuisine = ref('Todas')
  const activePrice = ref('Todos')
  const openNow = ref(false)

  const total = computed(() => restaurants.value.length)

  const filtered = computed(() => {
    let list = restaurants.value
    if (activeCuisine.value !== 'Todas') {
      list = list.filter(r => (r.cuisineTypes ?? []).some(c => c.label.includes(activeCuisine.value)))
    }
    if (activePrice.value !== 'Todos') {
      list = list.filter(r => r.priceRange?.label === activePrice.value)
    }
    return list
  })

  async function load() {
    loading.value = true
    debugSection('explore-view', 'loading public restaurants', {
      page: 1,
      perPage: 24,
      name: searchQuery.value || null,
    })
    try {
      await ensureRestaurantLookupCatalogues()
      const res = await restaurantService.getAll({
        page: 1,
        perPage: 24,
        name: searchQuery.value || undefined,
      })
      const list = extractRestaurantList(res, 'explore-view')
      restaurants.value = hydrateRestaurantList(list)
      debugSection('explore-view', 'public restaurants loaded', {
        count: restaurants.value.length,
        response: res,
      })
    } catch (error) {
      debugError('explore-view', 'failed to load public restaurants', { error })
      restaurants.value = []
    } finally {
      loading.value = false
    }
  }

  function handleSearch(e: Event) {
    e.preventDefault()
    void router.replace({ query: { q: searchQuery.value || undefined } })
    void load()
  }

  watch(
    () => route.query.q,
    (q) => {
      searchQuery.value = (q as string) ?? ''
      void load()
    },
  )

  onMounted(() => void load())

  return {
    restaurants,
    loading,
    searchQuery,
    activeSort,
    activeCuisine,
    activePrice,
    openNow,
    total,
    filtered,
    cuisineTags: CUISINE_TAGS,
    priceOptions: PRICE_OPTIONS,
    sortOptions: SORT_OPTIONS,
    handleSearch,
  }
}
