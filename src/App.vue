<script setup lang="ts">
import { computed, onErrorCaptured, ref } from 'vue'
import { useRoute } from 'vue-router'
import { BaseButton } from '@/components/base'
import { AppNavbar, ToastContainer } from '@/components/shared'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/authStore'
import { debugError } from '@/utils/debug'

const { t } = useI18n()
const hasFatalError = ref(false)
const route = useRoute()
const authStore = useAuthStore()

onErrorCaptured((error, instance, info) => {
  debugError('app', 'error captured by root fallback', {
    error,
    info,
    component: instance?.$options?.name ?? '(anonymous)',
    path: route.fullPath,
  })
  hasFatalError.value = true
  return false
})

const hideNavbar = computed(() => {
  return route.path === '/login' || route.path === '/register' || route.path === '/auth/callback'
})

const hideNavbarForOwner = computed(() => {
  return authStore.isOwner && route.path.startsWith('/app')
})

const showNavbar = computed(() => !hideNavbar.value && !hideNavbarForOwner.value)

// Key on the parent route path for nested routes so AppLayout isn't destroyed
// when navigating between /me/reservations ↔ /me/orders (or /app/* children).
// For flat top-level routes use the full path so each URL gets its own instance.
const routeKey = computed(() =>
  route.matched.length > 1 ? route.matched[0]!.path : route.path
)

function reloadApp(): void {
  window.location.reload()
}
</script>

<template>
  <div class="app-root">
    <main v-if="hasFatalError" class="app-fallback">
      <h1 class="app-fallback-title">{{ t('app.fatalTitle') }}</h1>
      <p class="app-fallback-description">{{ t('app.fatalDescription') }}</p>
      <BaseButton variant="outline" @click="reloadApp">{{ t('app.reloadAction') }}</BaseButton>
    </main>
    <template v-else>
      <AppNavbar v-if="showNavbar" />
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="routeKey" />
        </Transition>
      </RouterView>
    </template>
    <ToastContainer />
  </div>
</template>

<style scoped>
.app-root {
  min-height: 100vh;
}

.app-fallback {
  min-height: 100vh;
  display: grid;
  place-content: center;
  gap: 0.85rem;
  text-align: center;
  padding: 1.5rem;
}

.app-fallback-title {
  margin: 0;
  font-size: clamp(1.5rem, 3vw, 2rem);
}

.app-fallback-description {
  margin: 0;
  color: var(--text-muted);
  max-width: 30rem;
}

.page-enter-active,
.page-leave-active {
  transition: opacity 0.22s cubic-bezier(0.4,0,0.2,1), transform 0.22s cubic-bezier(0.4,0,0.2,1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
