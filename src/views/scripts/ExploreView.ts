import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { restaurantService } from '@/services'
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
      list = list.filter(r => r.cuisineTypes.some(c => c.label.includes(activeCuisine.value)))
    }
    if (activePrice.value !== 'Todos') {
      list = list.filter(r => r.priceRange?.label === activePrice.value)
    }
    return list
  })

  async function load() {
    loading.value = true
    try {
      const res = await restaurantService.getAll({
        page: 1,
        per_page: 24,
        name: searchQuery.value || undefined,
      })
      restaurants.value = res.data
    } catch {
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
