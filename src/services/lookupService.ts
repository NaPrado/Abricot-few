import { http } from './http'
import type { ApiId, City, Country, Cuisine, Neighbourhood, PriceRange, Province } from '@/types'

type LookupType = 'country' | 'province' | 'city' | 'neighbourhood' | 'price-range' | 'cuisine-type'

interface LookupResponse<T> {
  data: T[]
}

function getLookup<T>(type: LookupType, parentId?: ApiId): Promise<LookupResponse<T>> {
  return http.get<LookupResponse<T>>('/lookups', {
    query: {
      type,
      parentId,
    },
  })
}

export const lookupService = {
  getCuisines: () =>
    getLookup<Cuisine>('cuisine-type').then(response => response.data),
  getPriceRanges: () =>
    getLookup<PriceRange>('price-range').then(response => response.data),
  getCountries: () =>
    getLookup<Country>('country').then(response => response.data),
  getProvincesByCountry: (countryId: ApiId) =>
    getLookup<Province>('province', countryId).then(response => response.data),
  getCitiesByProvince: (provinceId: ApiId) =>
    getLookup<City>('city', provinceId).then(response => response.data),
  getNeighbourhoodsByCity: (cityId: ApiId) =>
    getLookup<Neighbourhood>('neighbourhood', cityId).then(response => response.data),
}
