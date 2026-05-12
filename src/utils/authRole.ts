import type { User, UserRole } from '@/types'

const RESTAURANT_ADMIN_ALIASES = new Set([
  'RESTAURANT_ADMIN',
  'RESTAURANT_OWNER',
  'OWNER',
])

export function normalizeUserRole(role: unknown): UserRole | null {
  if (typeof role !== 'string') return null

  const normalized = role.trim().toUpperCase()
  if (normalized === 'CUSTOMER') return 'CUSTOMER'
  if (normalized === 'SUPER_ADMIN') return 'SUPER_ADMIN'
  if (RESTAURANT_ADMIN_ALIASES.has(normalized)) return 'RESTAURANT_ADMIN'

  return null
}

export function normalizeAuthUser(userData: unknown): User | null {
  if (typeof userData !== 'object' || userData === null) return null

  const role = normalizeUserRole((userData as { role?: unknown }).role)
  if (!role) return null

  return {
    ...(userData as User),
    role,
  }
}

export function isOwnerRole(role: unknown): boolean {
  const normalized = normalizeUserRole(role)
  return normalized === 'RESTAURANT_ADMIN' || normalized === 'SUPER_ADMIN'
}
