import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: AppLayout,
      children: [
        {
          path: '',
          component: () => import('@/views/DashboardView.vue'),
        },
        {
          path: 'reservations',
          component: () => import('@/views/ReservationsView.vue'),
        },
        {
          path: 'orders',
          component: () => import('@/views/OrdersView.vue'),
        },
        {
          path: 'notifications',
          component: () => import('@/views/NotificationsView.vue'),
        },
        {
          path: 'analytics',
          component: () => import('@/views/AnalyticsView.vue'),
        },
      ],
    },
  ],
})

export default router
