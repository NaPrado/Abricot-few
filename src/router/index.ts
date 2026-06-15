import { createRouter, createWebHistory } from 'vue-router'
import { AppLayout } from '@/components/shared'
import { registerGuards } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ── Public ──────────────────────────────────────────────────
    {
      path: '/',
      component: () => import('@/views/LandingView.vue'),
      meta: { public: true },
    },
    {
      path: '/login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/register',
      component: () => import('@/views/RegisterRedirectView.vue'),
      meta: { public: true },
    },
    {
      path: '/auth/callback',
      component: () => import('@/views/AuthCallbackView.vue'),
      meta: { public: true },
    },
    {
      path: '/onboarding/account-type',
      component: () => import('@/views/AccountTypeOnboardingView.vue'),
      meta: { requiresCognitoAuth: true, requiresLocalUser: false },
    },
    {
      path: '/onboarding/restaurant',
      component: () => import('@/views/OwnerRestaurantOnboardingView.vue'),
      meta: { requiresCognitoAuth: true, requiresLocalUser: true },
    },
    {
      path: '/explore',
      component: () => import('@/views/ExploreView.vue'),
      meta: { public: true },
    },
    {
      path: '/restaurants/:restaurantId',
      component: () => import('@/views/RestaurantPublicView.vue'),
      meta: { public: true },
    },
    {
      path: '/widgets/reservas/:restaurantId',
      component: () => import('@/views/ReservationWidgetView.vue'),
      meta: { public: true },
    },

    // ── Owner shell (/app) ───────────────────────────────────────
    {
      path: '/app',
      component: AppLayout,
      meta: { requiresAuth: true, roles: ['RESTAURANT_ADMIN', 'SUPER_ADMIN'], layout: 'admin' },
      children: [
        { path: '', redirect: '/app/restaurants' },
        {
          path: 'restaurants',
          component: () => import('@/views/RestaurantsView.vue'),
        },
        {
          path: 'restaurants/:restaurantId',
          component: () => import('@/views/OwnerRestaurantDashboardView.vue'),
        },
        {
          path: 'restaurants/:restaurantId/tables',
          component: () => import('@/views/OwnerTablesView.vue'),
        },
        {
          path: 'restaurants/:restaurantId/hours',
          component: () => import('@/views/OwnerBusinessHoursView.vue'),
        },
        {
          path: 'restaurants/:restaurantId/reservations',
          component: () => import('@/views/OwnerReservationsView.vue'),
        },
        {
          path: 'restaurants/:restaurantId/orders',
          component: () => import('@/views/OwnerOrdersView.vue'),
        },
        {
          path: 'restaurants/:restaurantId/menus',
          component: () => import('@/views/OwnerMenusView.vue'),
        },
        {
          path: 'restaurants/:restaurantId/promotions',
          component: () => import('@/views/OwnerPromotionsView.vue'),
        },
        {
          path: 'restaurants/:restaurantId/stats',
          component: () => import('@/views/OwnerAnalyticsView.vue'),
        },
        {
          path: 'restaurants/:restaurantId/admins',
          component: () => import('@/views/OwnerAdminsView.vue'),
        },
      ],
    },

    // ── Customer shell (/me) ─────────────────────────────────────
    {
      path: '/me',
      component: AppLayout,
      meta: { requiresAuth: true, roles: ['CUSTOMER'], layout: 'customer' },
      children: [
        { path: '', redirect: '/me/reservations' },
        {
          path: 'reservations',
          component: () => import('@/views/MyReservationsView.vue'),
        },
        {
          path: 'reservations/:id',
          component: () => import('@/views/ReservationDetailView.vue'),
        },
        {
          path: 'orders',
          component: () => import('@/views/MyOrdersView.vue'),
        },
        {
          path: 'orders/:orderId',
          component: () => import('@/views/OrderTrackingView.vue'),
        },
        {
          path: 'profile',
          component: () => import('@/views/ProfileView.vue'),
        },
        {
          path: 'notifications',
          component: () => import('@/views/NotificationPreferencesView.vue'),
        },
      ],
    },

    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

registerGuards(router)

export default router
