import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { lookupService, restaurantService } from '@/services'
import { useAuthStore } from '@/stores/authStore'
import { useRestaurantContextStore } from '@/stores/restaurantContextStore'
import { debugError, debugSection, debugWarn } from '@/utils/debug'
import type { City, Country, Cuisine, Neighbourhood, PriceRange, Province } from '@/types'

export function useOwnerRestaurantOnboardingView() {
  const authStore = useAuthStore()
  const contextStore = useRestaurantContextStore()
  const router = useRouter()

  const loadingLookups = ref(true)
  const submitLoading = ref(false)
  const submitError = ref('')

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

  async function loadLookups() {
    const [c, cu, pr] = await Promise.all([
      lookupService.getCountries(),
      lookupService.getCuisines(),
      lookupService.getPriceRanges(),
    ])
    countries.value = c
    cuisines.value = cu
    priceRanges.value = pr
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

  async function submit(): Promise<void> {
    submitError.value = ''
    const name = formName.value.trim()
    const address = formAddress.value.trim()
    const phone = formPhone.value.trim()
    if (!name || !address || !phone || !selectedCityId.value) {
      debugWarn('owner-restaurant-onboarding', 'validation failed', {
        hasName: Boolean(name),
        hasAddress: Boolean(address),
        hasPhone: Boolean(phone),
        cityId: selectedCityId.value || null,
      })
      submitError.value = 'Completá nombre, dirección, teléfono y ciudad.'
      return
    }

    submitLoading.value = true
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

      await authStore.refreshLocalUser()
      contextStore.setActive(created.id as string)
      debugSection('owner-restaurant-onboarding', 'restaurant created; navigating to app', {
        restaurantId: created.id,
        role: authStore.user?.role ?? null,
      })
      await router.replace(`/app/restaurants/${created.id}`)
    } catch (error) {
      debugError('owner-restaurant-onboarding', 'create restaurant failed', { error })
      submitError.value = 'No se pudo crear el restaurante. Reintentá.'
    } finally {
      submitLoading.value = false
    }
  }

  onMounted(async () => {
    if (!authStore.user) {
      await router.replace('/onboarding/account-type')
      return
    }
    try {
      await loadLookups()
    } catch (error) {
      debugError('owner-restaurant-onboarding', 'lookups failed', { error })
      submitError.value = 'No se pudieron cargar los catálogos. Reintentá.'
    } finally {
      loadingLookups.value = false
    }
  })

  return {
    loadingLookups,
    submitLoading,
    submitError,
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
    submit,
    toggleCuisine,
    isCuisineSelected,
  }
}
