import type { Restaurant } from '@/types'

/** List/card copy: average + count, or “no reviews” when `averageScore` is null / zero reviews. */
export function restaurantRatingLabel(r: Pick<Restaurant, 'averageScore' | 'reviewCount'>): string {
  const reviewCount = Number(r.reviewCount ?? 0)
  const averageScore = Number(r.averageScore)
  if (reviewCount === 0 || !Number.isFinite(averageScore)) return 'Sin valoraciones'
  return `${averageScore.toFixed(1)} (${reviewCount})`
}
