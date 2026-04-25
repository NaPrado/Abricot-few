import type { PageType, PerPageType } from '../scalar'

/** API uses camelCase (`perPage`); see `abricot_frontend_guide.md` §1. */
export interface PaginationQueryType {
  page?: PageType
  perPage?: PerPageType
}
