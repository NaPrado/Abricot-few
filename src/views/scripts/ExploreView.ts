import { computed, onMounted, ref, toRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { restaurantService } from '@/services'
import { useLookupStore } from '@/stores/lookupStore'
import { debugError, debugSection } from '@/utils/debug'
import { ensureRestaurantLookupCatalogues, hydrateRestaurantList } from '@/utils/restaurantHydration'
import { extractRestaurantList } from '@/utils/restaurantResponses'
import type { Restaurant } from '@/types'

const SORT_OPTIONS = [
  { label: 'Relevancia', value: 'name' },
  { label: 'Mejor calificación', value: 'rating' },
  { label: 'Más nuevos', value: 'newest' },
]
const PER_PAGE = 24

export function useExploreView() {
  const route = useRoute()
  const router = useRouter()
  const lookupStore = useLookupStore()

  const restaurants = ref<Restaurant[]>([])
  const loading = ref(true)
  const total = ref(0)

  const searchQuery = ref((route.query.q as string) ?? '')
  const activeSort = ref((route.query.sort as string) ?? 'name')
  const selectedCuisineId = ref<string | null>((route.query.cuisine as string) ?? null)
  const selectedPriceRangeId = ref<string | null>((route.query.price as string) ?? null)
  const page = ref(Number(route.query.page) || 1)

  const totalPages = computed(() => (total.value > 0 ? Math.ceil(total.value / PER_PAGE) : 1))

  async function load() {
    loading.value = true
    try {
      await ensureRestaurantLookupCatalogues()
      const res = await restaurantService.getAll({
        page: page.value,
        perPage: PER_PAGE,
        name: searchQuery.value || undefined,
        sort: activeSort.value,
        cuisineTypeIds: selectedCuisineId.value ?? undefined,
        priceRangeId: selectedPriceRangeId.value ?? undefined,
      })
      const list = extractRestaurantList(res, 'explore-view')
      restaurants.value = hydrateRestaurantList(list)
      total.value = res.total
      debugSection('explore-view', 'loaded', { count: restaurants.value.length, total: total.value })
    } catch (error) {
      debugError('explore-view', 'failed to load', { error })
      restaurants.value = []
      total.value = 0
    } finally {
      loading.value = false
    }
  }

  function syncUrl() {
    void router.replace({
      query: {
        ...(searchQuery.value ? { q: searchQuery.value } : {}),
        ...(activeSort.value !== 'name' ? { sort: activeSort.value } : {}),
        ...(selectedCuisineId.value ? { cuisine: selectedCuisineId.value } : {}),
        ...(selectedPriceRangeId.value ? { price: selectedPriceRangeId.value } : {}),
        ...(page.value > 1 ? { page: String(page.value) } : {}),
      },
    })
  }

  function handleSearch(e: Event) {
    e.preventDefault()
    page.value = 1
    syncUrl()
    void load()
  }

  function selectCuisine(id: string | null) {
    selectedCuisineId.value = id
    page.value = 1
    syncUrl()
    void load()
  }

  function selectPrice(id: string | null) {
    selectedPriceRangeId.value = id
    page.value = 1
    syncUrl()
    void load()
  }

  function setSort(value: string) {
    activeSort.value = value
    page.value = 1
    syncUrl()
    void load()
  }

  function goToPage(p: number) {
    page.value = p
    syncUrl()
    void load()
  }

  watch(
    () => route.query,
    (q) => {
      const newQ = (q.q as string) ?? ''
      const newSort = (q.sort as string) ?? 'name'
      const newCuisine = (q.cuisine as string) ?? null
      const newPrice = (q.price as string) ?? null
      const newPage = Number(q.page) || 1

      if (
        newQ !== searchQuery.value ||
        newSort !== activeSort.value ||
        newCuisine !== selectedCuisineId.value ||
        newPrice !== selectedPriceRangeId.value ||
        newPage !== page.value
      ) {
        searchQuery.value = newQ
        activeSort.value = newSort
        selectedCuisineId.value = newCuisine
        selectedPriceRangeId.value = newPrice
        page.value = newPage
        void load()
      }
    },
  )

  onMounted(() => void load())

  return {
    restaurants,
    loading,
    total,
    totalPages,
    page,
    searchQuery,
    activeSort,
    selectedCuisineId,
    selectedPriceRangeId,
    cuisines: toRef(lookupStore, 'cuisines'),
    priceRanges: toRef(lookupStore, 'priceRanges'),
    sortOptions: SORT_OPTIONS,
    handleSearch,
    selectCuisine,
    selectPrice,
    setSort,
    goToPage,
  }
}
