import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { redirectToCognitoSignup, restaurantService } from '@/services'
import { useLookupStore } from '@/stores/lookupStore'
import { debugError, debugSection } from '@/utils/debug'
import { extractRestaurantList } from '@/utils/restaurantResponses'
import type { Restaurant } from '@/types'

const HERO_PHRASES = [
  { top: 'Tu mesa favorita', accent: 'te espera.' },
  { top: 'Reserva en segundos.', accent: 'Sin caos.' },
  { top: 'Tu restaurante,', accent: 'desde aquí.' },
  { top: 'Pedidos. Reservas.', accent: 'Todo integrado.' },
  { top: 'Buenos Aires', accent: 'en un plato.' },
  { top: 'Sin papel. Sin espera.', accent: 'Sin límites.' },
]

export function useLandingView() {
  const router = useRouter()
  const lookupStore = useLookupStore()
  const restaurants = ref<Restaurant[]>([])
  const restaurantCount = ref(0)
  const loading = ref(true)
  const searchQuery = ref('')
  const searchNeighbourhood = ref('Todos')
  const searchType = ref('Todos')
  const activeTag = ref('Todos')
  const phraseIdx = ref(0)
  const phraseVisible = ref(true)

  const tags = ['Todos', 'Parrilla', 'Japonés', 'Café', 'Vegano']
  const neighbourhoodOptions = [
    'Todos', 'Palermo', 'San Telmo', 'Recoleta', 'Belgrano', 'Caballito', 'Núñez',
    'Villa Urquiza', 'San Nicolás', 'Monserrat', 'La Boca', 'Barracas', 'Puerto Madero',
    'Almagro', 'Villa Crespo', 'Flores', 'Balvanera', 'Once', 'Liniers', 'Mataderos',
    'Villa del Parque', 'Colegiales', 'Chacarita', 'Parque Patricios', 'Saavedra',
    'Villa Real', 'Versalles',
  ]
  const typeOptions = computed(() => ['Todos', ...lookupStore.cuisines.map(c => c.label)])

  const phrase = computed<{ top: string; accent: string }>(() =>
    HERO_PHRASES[phraseIdx.value] ?? HERO_PHRASES[0] ?? { top: '', accent: '' },
  )


  const eyebrowDate = computed(() =>
    new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }),
  )

  const featuredRestaurants = computed(() => restaurants.value.slice(0, 3))
  const filteredRestaurants = computed(() => {
    if (activeTag.value === 'Todos') return restaurants.value.slice(0, 6)
    return restaurants.value
      .filter(r => (r.cuisineTypes ?? []).some(c => c.label.includes(activeTag.value)))
      .slice(0, 6)
  })

  let phraseTimer: ReturnType<typeof setInterval> | null = null

  function startPhraseRotation() {
    phraseTimer = setInterval(() => {
      phraseVisible.value = false
      setTimeout(() => {
        phraseIdx.value = (phraseIdx.value + 1) % HERO_PHRASES.length
        phraseVisible.value = true
      }, 500)
    }, 5500)
  }

  function handleSearch(e: Event) {
    e.preventDefault()
    const selectedCuisine =
      searchType.value !== 'Todos'
        ? lookupStore.cuisines.find(c => c.label === searchType.value)
        : undefined
    void router.push({
      path: '/explore',
      query: {
        ...(searchQuery.value ? { q: searchQuery.value } : {}),
        ...(selectedCuisine ? { cuisine: selectedCuisine.id } : {}),
      },
    })
  }

  function navigateToExplore() {
    void router.push('/explore')
  }

  function navigateToRegisterOwner() {
    try {
      redirectToCognitoSignup()
    } catch {
      void router.push('/login')
    }
  }

  async function loadRestaurants() {
    debugSection('landing-view', 'loading public restaurants')
    try {
      const res = await restaurantService.getAll({ page: 1, perPage: 12 })
      restaurants.value = extractRestaurantList(res, 'landing-view')
      // `total` is the catalogue-wide count (not just this page) — powers the real stat.
      restaurantCount.value = res.total ?? restaurants.value.length
      debugSection('landing-view', 'public restaurants loaded', {
        count: restaurants.value.length,
        total: restaurantCount.value,
        response: res,
      })
    } catch (error) {
      debugError('landing-view', 'failed to load public restaurants', { error })
      // silently degrade — hero/sections still render
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    void loadRestaurants()
    void lookupStore.ensureCuisines()
    startPhraseRotation()
  })

  onUnmounted(() => {
    if (phraseTimer) clearInterval(phraseTimer)
  })

  return {
    restaurants,
    restaurantCount,
    loading,
    searchQuery,
    searchNeighbourhood,
    searchType,
    activeTag,
    phraseVisible,
    phrase,
    eyebrowDate,
    tags,
    neighbourhoodOptions,
    typeOptions,
    featuredRestaurants,
    filteredRestaurants,
    handleSearch,
    navigateToExplore,
    navigateToRegisterOwner,
  }
}
