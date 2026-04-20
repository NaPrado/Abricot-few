import type { PageType, PerPageType } from '../scalar'

export interface PaginationQueryType {
  page?: PageType
  per_page?: PerPageType
}
