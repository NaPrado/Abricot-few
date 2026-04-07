import { createRouter, createWebHistory } from "vue-router"
import AppLayout from "@/components/AppLayout.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: () => import("@/views/LandingView.vue"),
      meta: { public: true },
    },
    {
      path: "/login",
      component: () => import("@/views/LoginView.vue"),
      meta: { public: true },
    },
    {
      path: "/register",
      component: () => import("@/views/RegisterView.vue"),
      meta: { public: true },
    },
    {
      path: "/app",
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: "",
          redirect: "/app/restaurants",
        },
        {
          path: "restaurants",
          component: () => import("@/views/RestaurantsView.vue"),
        },
      ],
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/",
    },
  ],
})

router.beforeEach((to) => {
  const token = localStorage.getItem("access_token")
  if (to.meta.requiresAuth && !token) {
    return "/login"
  }
  if (to.meta.public && token && (to.path === "/login" || to.path === "/register")) {
    return "/app"
  }
})

export default router
