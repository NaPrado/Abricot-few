import type { Router } from 'vue-router'
import type { UserRoleType } from '@/types'

function clearAuthStorage(): void {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
}

function parseStoredRole(userRaw: string | null): UserRoleType | null {
  if (!userRaw) return null

  try {
    const parsed = JSON.parse(userRaw) as { role?: unknown }
    if (typeof parsed.role === 'string') {
      return parsed.role as UserRoleType
    }
  } catch {
    // Ignore parse errors and treat as unauthenticated state.
  }

  return null
}

export function registerGuards(router: Router): void {
  router.beforeEach((to) => {
    const token = localStorage.getItem('access_token')
    const userRaw = localStorage.getItem('user')
    const role = parseStoredRole(userRaw)

    if (to.meta.requiresAuth && (!token || !role)) {
      clearAuthStorage()
      return '/login?expired=1'
    }

    // Redirect logged-in users away from auth pages
    if (to.meta.public && token && role && (to.path === '/login' || to.path === '/register')) {
      if (role === 'CUSTOMER') return '/me/reservations'
      return '/app/restaurants'
    }

    // Role-based access: check meta.roles if present
    const allowed = to.meta.roles as UserRoleType[] | undefined
    if (allowed && role && !allowed.includes(role)) {
      if (role === 'CUSTOMER') return '/me/reservations'
      return '/app/restaurants'
    }
  })
}
