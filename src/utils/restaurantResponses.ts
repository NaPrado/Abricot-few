import type { Restaurant } from '@/types'
import { debugWarn } from '@/utils/debug'

const LIST_KEYS = ['data', 'restaurants', 'items', 'results']

export function extractRestaurantList(response: unknown, scope: string): Restaurant[] {
  if (Array.isArray(response)) {
    return response as Restaurant[]
  }

  if (typeof response === 'object' && response !== null) {
    for (const key of LIST_KEYS) {
      const value = (response as Record<string, unknown>)[key]
      if (Array.isArray(value)) {
        return value as Restaurant[]
      }
    }
  }

  debugWarn(scope, 'restaurant list response did not contain an array', {
    response,
    checkedKeys: LIST_KEYS,
  })
  return []
}
