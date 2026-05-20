import type { UserRoleType } from '@/types'
import { isOwnerRole } from '@/utils/authRole'

export type AccountTypeChoice = 'customer' | 'restaurant_owner'

export function homePathForRole(role: UserRoleType | null | undefined): string {
  if (isOwnerRole(role)) return '/app/restaurants'
  return '/explore'
}

export function redirectAfterProvision(
  role: UserRoleType,
  accountType: AccountTypeChoice,
): string {
  if (isOwnerRole(role)) return '/app/restaurants'
  if (accountType === 'restaurant_owner' && role === 'CUSTOMER') {
    return '/onboarding/restaurant'
  }
  if (accountType === 'customer') return '/explore'
  return homePathForRole(role)
}
