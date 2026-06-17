import type { OrderItem } from '@/types'

/**
 * Resolve the name the backend snapshots onto an order line at creation. The rebuilt
 * backend may emit it under any of these camelCase keys; fall back to the id ONLY when
 * none is present (which would indicate a backend gap, not a frontend one).
 *
 * Shared by the customer order views (`MyOrdersView`, `OrderTrackingView`) and the
 * owner backoffice (`OwnerOrdersView`) so both resolve plate names identically.
 */
export function orderItemDisplayName(item: OrderItem): string {
  const snapshot = item.menuItemName ?? item.itemName ?? item.name
  if (typeof snapshot === 'string' && snapshot.trim()) return snapshot.trim()
  return `Ítem ${String(item.menuItemId).slice(0, 8)}`
}
