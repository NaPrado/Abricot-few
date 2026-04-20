import { http } from './http'
import type { ApiId, City, Country, Cuisine, Neighbourhood, PriceRange, Province } from '@/types'

export const lookupService = {
  getCuisines: () =>
    http.get<Cuisine[]>('/cuisines/', { authMode: 'none' }),
  getPriceRanges: () =>
    http.get<PriceRange[]>('/price-ranges/', { authMode: 'none' }),
  getCountries: () =>
    http.get<Country[]>('/countries/', { authMode: 'none' }),
  getProvincesByCountry: (countryId: ApiId) =>
    http.get<Province[]>(`/countries/${countryId}/provinces/`, { authMode: 'none' }),
  getCitiesByProvince: (provinceId: ApiId) =>
    http.get<City[]>(`/provinces/${provinceId}/cities/`, { authMode: 'none' }),
  getNeighbourhoodsByCity: (cityId: ApiId) =>
    http.get<Neighbourhood[]>(`/cities/${cityId}/neighbourhoods/`, { authMode: 'none' }),
}