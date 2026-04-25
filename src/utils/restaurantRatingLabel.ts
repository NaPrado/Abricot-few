import type { Restaurant } from '@/types'

/** List/card copy: average + count, or “no reviews” when `averageScore` is null / zero reviews. */
export function restaurantRatingLabel(r: Pick<Restaurant, 'averageScore' | 'reviewCount'>): string {
  if (r.reviewCount === 0 || r.averageScore == null) return 'Sin valoraciones'
  return `${r.averageScore.toFixed(1)} (${r.reviewCount})`
}
