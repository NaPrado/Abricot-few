import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { lookupService, restaurantService, userService } from '@/services'
import { useAuthStore } from '@/stores/authStore'
import { useRestaurantContextStore } from '@/stores/restaurantContextStore'
import type { City, Country, Cuisine, Neighbourhood, PriceRange, Province, Restaurant } from '@/types'

export function useRestaurantsView() {
  const authStore = useAuthStore()
  const contextStore = useRestaurantContextStore()
  const router = useRouter()

  const restaurants = ref<Restaurant[]>([])
  const loading = ref(true)

  const showCreate = ref(false)
  const createLoading = ref(false)
  const createError = ref('')

  const countries = ref<Country[]>([])
  const provinces = ref<Province[]>([])
  const cities = ref<City[]>([])
  const neighbourhoods = ref<Neighbourhood[]>([])
  const cuisines = ref<Cuisine[]>([])
  const priceRanges = ref<PriceRange[]>([])

  const selectedCountryId = ref('')
  const selectedProvinceId = ref('')
  const selectedCityId = ref('')
  const selectedNeighbourhoodId = ref('')
  const selectedPriceRangeId = ref('')
  const selectedCuisineIds = ref<string[]>([])

  const formName = ref('')
  const formAddress = ref('')
  const formPhone = ref('')
  const formEmail = ref('')
  const formDescription = ref('')

  function colorBg(id: string): string {
    const colors = ['#1a1208', '#0a0f1a', '#120a08', '#100808', '#080f0a', '#0f0f08']
    const idx = id.charCodeAt(0) % colors.length
    return colors[idx] ?? '#111'
  }

  function navigate(id: string) {
    contextStore.setActive(id)
    void router.push(`/app/restaurants/${id}`)
  }

  function resetCreateForm() {
    createError.value = ''
    formName.value = ''
    formAddress.value = ''
    formPhone.value = ''
    formEmail.value = ''
    formDescription.value = ''
    selectedCountryId.value = ''
    selectedProvinceId.value = ''
    selectedCityId.value = ''
    selectedNeighbourhoodId.value = ''
    selectedPriceRangeId.value = ''
    selectedCuisineIds.value = []
    provinces.value = []
    cities.value = []
    neighbourhoods.value = []
  }

  async function loadBaseLookups() {
    const [c, cu, pr] = await Promise.all([
      lookupService.getCountries(),
      lookupService.getCuisines(),
      lookupService.getPriceRanges(),
    ])
    countries.value = c
    cuisines.value = cu
    priceRanges.value = pr
  }

  async function openCreate() {
    resetCreateForm()
    showCreate.value = true
    try {
      if (!countries.value.length) await loadBaseLookups()
    } catch {
      createError.value = 'No se pudieron cargar países y catálogos. Reintentá.'
    }
  }

  function closeCreate() {
    if (createLoading.value) return
    showCreate.value = false
  }

  function toggleCuisine(id: string) {
    const arr = selectedCuisineIds.value
    const i = arr.indexOf(id)
    if (i === -1) arr.push(id)
    else arr.splice(i, 1)
  }

  function isCuisineSelected(id: string): boolean {
    return selectedCuisineIds.value.includes(id)
  }

  watch(selectedCountryId, async (id) => {
    selectedProvinceId.value = ''
    selectedCityId.value = ''
    selectedNeighbourhoodId.value = ''
    provinces.value = []
    cities.value = []
    neighbourhoods.value = []
    if (!id) return
    try {
      provinces.value = await lookupService.getProvincesByCountry(id)
    } catch {
      provinces.value = []
    }
  })

  watch(selectedProvinceId, async (id) => {
    selectedCityId.value = ''
    selectedNeighbourhoodId.value = ''
    cities.value = []
    neighbourhoods.value = []
    if (!id) return
    try {
      cities.value = await lookupService.getCitiesByProvince(id)
    } catch {
      cities.value = []
    }
  })

  watch(selectedCityId, async (id) => {
    selectedNeighbourhoodId.value = ''
    neighbourhoods.value = []
    if (!id) return
    try {
      neighbourhoods.value = await lookupService.getNeighbourhoodsByCity(id)
    } catch {
      neighbourhoods.value = []
    }
  })

  async function submitCreate() {
    createError.value = ''
    const name = formName.value.trim()
    const address = formAddress.value.trim()
    const phone = formPhone.value.trim()
    if (!name || !address || !phone || !selectedCityId.value) {
      createError.value = 'Completá nombre, dirección, teléfono y ciudad.'
      return
    }
    createLoading.value = true
    try {
      const created = await restaurantService.create({
        name,
        address,
        cityId: selectedCityId.value,
        phone,
        email: formEmail.value.trim() || undefined,
        description: formDescription.value.trim() || undefined,
        neighbourhoodId: selectedNeighbourhoodId.value || undefined,
        priceRangeId: selectedPriceRangeId.value || undefined,
        cuisineTypeIds: selectedCuisineIds.value.length ? selectedCuisineIds.value : undefined,
      })
      if (authStore.user) {
        restaurants.value = await userService.listRestaurants(authStore.user.id)
      }
      contextStore.setActive(created.id as string)
      showCreate.value = false
      resetCreateForm()
      void router.push(`/app/restaurants/${created.id}`)
    } catch {
      createError.value = 'No se pudo crear el restaurante. Verificá los datos o probá más tarde.'
    } finally {
      createLoading.value = false
    }
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

  return {
    restaurants,
    loading,
    colorBg,
    navigate,
    showCreate,
    createLoading,
    createError,
    countries,
    provinces,
    cities,
    neighbourhoods,
    cuisines,
    priceRanges,
    selectedCountryId,
    selectedProvinceId,
    selectedCityId,
    selectedNeighbourhoodId,
    selectedPriceRangeId,
    formName,
    formAddress,
    formPhone,
    formEmail,
    formDescription,
    openCreate,
    closeCreate,
    submitCreate,
    toggleCuisine,
    isCuisineSelected,
  }
}
