import type { NonNegativeIntType, PageType, PerPageType } from '../scalar'

export interface PaginatedResponseType<T> {
  data: T[]
  total: NonNegativeIntType
  page: PageType
  perPage: PerPageType
}
