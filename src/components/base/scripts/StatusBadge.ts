import { computed, type ComputedRef } from 'vue'

export type StatusBadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'brand'

/** i18n root for `t(\`\${scope}.status.\${status}\`)` when `label` is omitted */
export type StatusBadgeScope = 'myOrders' | 'ownerOrders' | 'myReservations' | 'ownerReservations'

export interface StatusBadgeProps {
  tone?: StatusBadgeTone
  /** Explicit text; omit when using `status` + `scope` */
  label?: string
  dot?: boolean
  status?: string
  scope?: StatusBadgeScope
}

export function toneForStatus(status: string | undefined): StatusBadgeTone {
  if (!status) return 'neutral'
  switch (status) {
    case 'CANCELLED':
      return 'danger'
    case 'COMPLETED':
    case 'READY':
    case 'CONFIRMED':
      return 'success'
    case 'PENDING':
      return 'warning'
    case 'IN_PREPARATION':
      return 'info'
    case 'NO_SHOW':
      return 'warning'
    default:
      return 'neutral'
  }
}

export function useStatusBadgeClasses(tone: ComputedRef<StatusBadgeTone>): ComputedRef<string[]> {
  return computed(() => ['status-badge', `status-badge--${tone.value}`])
}
