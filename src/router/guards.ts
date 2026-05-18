import type { Router } from 'vue-router'
import type { UserRoleType } from '@/types'
import { debugSection, debugWarn } from '@/utils/debug'
import { normalizeUserRole } from '@/utils/authRole'

const ACTIVE_RESTAURANT_STORAGE_KEY = 'abricot_active_restaurant_id'
const COGNITO_STORAGE_KEYS = [
  'id_token',
  'cognito_id_token',
  'cognito_expires_in',
  'cognito_expires_at',
] as const

function clearAuthStorage(): void {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
  localStorage.removeItem(ACTIVE_RESTAURANT_STORAGE_KEY)
  for (const key of COGNITO_STORAGE_KEYS) {
    localStorage.removeItem(key)
  }
}

function parseStoredRole(userRaw: string | null): UserRoleType | null {
  if (!userRaw) return null

  try {
    const parsed = JSON.parse(userRaw) as { role?: unknown }
    return normalizeUserRole(parsed.role)
  } catch {
    // Ignore parse errors and treat as unauthenticated state.
  }

  return null
}

export function registerGuards(router: Router): void {
  router.beforeEach((to, from) => {
    const token = localStorage.getItem('access_token')
    const userRaw = localStorage.getItem('user')
    const role = parseStoredRole(userRaw)
    const allowed = to.meta.roles as UserRoleType[] | undefined

    debugSection('router', 'beforeEach', {
      from: from.fullPath,
      to: to.fullPath,
      requiresAuth: Boolean(to.meta.requiresAuth),
      public: Boolean(to.meta.public),
      allowedRoles: allowed ?? null,
      hasToken: Boolean(token),
      hasStoredUser: Boolean(userRaw),
      normalizedRole: role,
    })

    if (to.meta.requiresAuth && (!token || !role)) {
      debugWarn('router', 'missing auth state for protected route; redirecting to login', {
        to: to.fullPath,
        hasToken: Boolean(token),
        normalizedRole: role,
      })
      clearAuthStorage()
      return '/login?expired=1'
    }

    // Redirect logged-in users away from auth pages
    if (to.meta.public && token && role && (to.path === '/login' || to.path === '/register')) {
      const redirectPath = role === 'CUSTOMER' ? '/me/reservations' : '/app/restaurants'
      debugSection('router', 'logged-in user on auth page; redirecting', {
        role,
        to: to.fullPath,
        redirectPath,
      })
      return redirectPath
    }

    // Role-based access: check meta.roles if present
    if (allowed && role && !allowed.includes(role)) {
      const redirectPath = role === 'CUSTOMER' ? '/me/reservations' : '/app/restaurants'
      debugWarn('router', 'role not allowed for route', {
        role,
        allowed,
        to: to.fullPath,
        redirectPath,
      })
      if (to.path === redirectPath) {
        debugWarn('router', 'blocked self-redirect to avoid router loop', {
          role,
          to: to.fullPath,
        })
        return false
      }
      return redirectPath
    }
  })
}
