import { computed, onMounted, ref, watch } from 'vue'
import { onBeforeRouteUpdate, RouterLink, useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { lookupService, restaurantService } from '@/services'
import { PublicMarketingNav } from '@/components/shared'
import { BaseButton, BaseSpinner, EmptyState } from '@/components/base'
import { Grid3x3, List } from 'lucide-vue-next'
import type { Cuisine, PriceRange, Restaurant, RestaurantListQuery } from '@/types'

type SortKey = 'name_asc' | 'name_desc' | 'created'

function nameFromRoute(route: { query: Record<string, unknown> }): string {
  const q = route.query.name
  if (Array.isArray(q)) return q[0] ?? ''
  return typeof q === 'string' ? q : ''
}

export function useExploreView() {
  const { t } = useI18n()
  const route = useRoute()
  const router = useRouter()

  const cuisines = ref<Cuisine[]>([])
  const priceRanges = ref<PriceRange[]>([])
  const lookupsError = ref(false)

  const searchInput = ref('')
  const selectedPriceRangeId = ref<string>('')
  const selectedCuisineIds = ref<string[]>([])

  const sortBy = ref<SortKey>('name_asc')
  const perPage = ref(12)
  const viewMode = ref<'grid' | 'list'>('grid')
  const page = ref(1)

  const restaurants = ref<Restaurant[]>([])
  const total = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastElapsedSeconds = ref(0)

  const nameFilter = computed(() => nameFromRoute(route))

  const sortOptions = computed(() => [
    { value: 'name_asc' as SortKey, label: t('explore.sortNameAsc') },
    { value: 'name_desc' as SortKey, label: t('explore.sortNameDesc') },
    { value: 'created' as SortKey, label: t('explore.sortRecent') },
  ])

  const perPageOptions = computed(() => [
    { value: 12, label: t('landing.discovery.per12') },
    { value: 24, label: t('landing.discovery.per24') },
    { value: 48, label: t('landing.discovery.per48') },
  ])

  const resultsSummary = computed(() =>
    t('explore.resultsFound', {
      count: total.value,
      seconds: lastElapsedSeconds.value.toFixed(2),
    }),
  )

  function buildQuery(forPage: number): RestaurantListQuery {
    const q: RestaurantListQuery = {
      page: forPage,
      per_page: perPage.value,
    }
    const name = searchInput.value.trim()
    if (name) q.name = name
    if (selectedPriceRangeId.value) q.price_range_id = selectedPriceRangeId.value
    if (selectedCuisineIds.value.length > 0) q.cuisine_type_id = [...selectedCuisineIds.value]
    return q
  }

  function applyClientSort(): void {
    const order = sortBy.value
    restaurants.value = [...restaurants.value].sort((a, b) => {
      if (order === 'name_asc') return a.name.localeCompare(b.name, 'es')
      if (order === 'name_desc') return b.name.localeCompare(a.name, 'es')
      return b.createdAt.localeCompare(a.createdAt)
    })
  }

  async function fetchPage(append: boolean): Promise<void> {
    loading.value = true
    error.value = null
    const t0 = performance.now()
    try {
      const query = buildQuery(page.value)
      const res = await restaurantService.getAll(query)
      if (append) {
        restaurants.value = [...restaurants.value, ...res.data]
      } else {
        restaurants.value = res.data
      }
      total.value = res.total
      lastElapsedSeconds.value = (performance.now() - t0) / 1000
      applyClientSort()
    } catch {
      error.value = t('errors.generic')
      if (!append) {
        restaurants.value = []
        total.value = 0
      }
    } finally {
      loading.value = false
    }
  }

  async function loadLookups(): Promise<void> {
    lookupsError.value = false
    try {
      const [cRes, pRes] = await Promise.all([lookupService.getCuisines(), lookupService.getPriceRanges()])
      cuisines.value = cRes.sort((a, b) => a.label.localeCompare(b.label, 'es'))
      priceRanges.value = pRes.sort((a, b) => a.sortOrder - b.sortOrder)
    } catch {
      lookupsError.value = true
      cuisines.value = []
      priceRanges.value = []
    }
  }

  async function pushSearchQuery(): Promise<void> {
    const name = searchInput.value.trim()
    const nextQuery = { ...route.query } as Record<string, string | string[] | undefined>
    if (name) nextQuery.name = name
    else delete nextQuery.name
    await router.replace({ path: '/explore', query: nextQuery })
  }

  async function submitSearch(): Promise<void> {
    const before = route.fullPath
    await pushSearchQuery()
    if (route.fullPath === before) {
      page.value = 1
      await fetchPage(false)
    }
  }

  async function onFilterChange(): Promise<void> {
    page.value = 1
    await fetchPage(false)
  }

  function togglePriceRange(id: string): void {
    selectedPriceRangeId.value = selectedPriceRangeId.value === id ? '' : id
    void onFilterChange()
  }

  function toggleCuisine(id: string): void {
    const idx = selectedCuisineIds.value.indexOf(id)
    if (idx >= 0) selectedCuisineIds.value = selectedCuisineIds.value.filter((x) => x !== id)
    else selectedCuisineIds.value = [...selectedCuisineIds.value, id]
    void onFilterChange()
  }

  function isPriceSelected(id: string): boolean {
    return selectedPriceRangeId.value === id
  }

  function isCuisineSelected(id: string): boolean {
    return selectedCuisineIds.value.includes(id)
  }

  async function clearFilters(): Promise<void> {
    selectedPriceRangeId.value = ''
    selectedCuisineIds.value = []
    searchInput.value = ''
    await router.replace({ path: '/explore', query: {} })
    page.value = 1
    await fetchPage(false)
  }

  async function loadMore(): Promise<void> {
    if (loading.value || restaurants.value.length >= total.value) return
    page.value += 1
    await fetchPage(true)
  }

  async function retryFetch(): Promise<void> {
    error.value = null
    page.value = 1
    await fetchPage(false)
  }

  watch(sortBy, () => {
    applyClientSort()
  })

  watch(perPage, () => {
    page.value = 1
    void fetchPage(false)
  })

  onBeforeRouteUpdate((to, from) => {
    searchInput.value = nameFromRoute(to)
    if (String(to.query.name ?? '') !== String(from.query.name ?? '')) {
      page.value = 1
      void fetchPage(false)
    }
  })

  onMounted(async () => {
    searchInput.value = nameFromRoute(route)
    await loadLookups()
    page.value = 1
    await fetchPage(false)
  })

  return {
    RouterLink,
    PublicMarketingNav,
    t,
    route,
    cuisines,
    priceRanges,
    lookupsError,
    searchInput,
    sortBy,
    sortOptions,
    perPage,
    perPageOptions,
    viewMode,
    restaurants,
    total,
    page,
    loading,
    error,
    nameFilter,
    resultsSummary,
    submitSearch,
    clearFilters,
    togglePriceRange,
    toggleCuisine,
    isPriceSelected,
    isCuisineSelected,
    loadMore,
    retryFetch,
    BaseButton,
    BaseSpinner,
    EmptyState,
    Grid3x3,
    List,
  }
}
