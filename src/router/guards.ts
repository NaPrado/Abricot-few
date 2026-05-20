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

function hasCognitoToken(): boolean {
  return Boolean(localStorage.getItem('access_token') || localStorage.getItem('id_token'))
}

export function registerGuards(router: Router): void {
  router.beforeEach((to, from) => {
    const token = localStorage.getItem('access_token')
    const userRaw = localStorage.getItem('user')
    const role = parseStoredRole(userRaw)
    const allowed = to.meta.roles as UserRoleType[] | undefined
    const requiresCognito = Boolean(to.meta.requiresCognitoAuth)
    const requiresLocalUser = Boolean(to.meta.requiresLocalUser)
    const requiresAuth = Boolean(to.meta.requiresAuth)

    debugSection('router', 'beforeEach', {
      from: from.fullPath,
      to: to.fullPath,
      requiresAuth,
      requiresCognitoAuth: requiresCognito,
      requiresLocalUser,
      public: Boolean(to.meta.public),
      allowedRoles: allowed ?? null,
      hasToken: Boolean(token),
      hasStoredUser: Boolean(userRaw),
      normalizedRole: role,
    })

    if (requiresCognito && !hasCognitoToken()) {
      debugWarn('router', 'missing cognito token; redirecting to login', { to: to.fullPath })
      return '/login?expired=1'
    }

    if (requiresLocalUser && (!token || !role)) {
      debugWarn('router', 'missing local user for protected route; redirecting to login', {
        to: to.fullPath,
        hasToken: Boolean(token),
        normalizedRole: role,
      })
      clearAuthStorage()
      return '/login?expired=1'
    }

    if (requiresAuth && (!token || !role)) {
      debugWarn('router', 'missing auth state for protected route; redirecting to login', {
        to: to.fullPath,
        hasToken: Boolean(token),
        normalizedRole: role,
      })
      clearAuthStorage()
      return '/login?expired=1'
    }

    if (to.meta.public && token && role && to.path === '/login') {
      const redirectPath = role === 'CUSTOMER' ? '/explore' : '/app/restaurants'
      debugSection('router', 'logged-in user on auth page; redirecting', {
        role,
        to: to.fullPath,
        redirectPath,
      })
      return redirectPath
    }

    if (allowed && role && !allowed.includes(role)) {
      const redirectPath = role === 'CUSTOMER' ? '/explore' : '/app/restaurants'
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
