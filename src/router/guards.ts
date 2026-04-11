import type { Router } from 'vue-router'

export function registerGuards(router: Router): void {
  router.beforeEach((to) => {
    const token = localStorage.getItem('access_token')

    if (to.meta.requiresAuth && !token) return '/login'

    if (to.meta.public && token && (to.path === '/login' || to.path === '/register')) {
      return '/app'
    }
  })
}
