<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Calendar, LayoutGrid, ShoppingBag } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/authStore'

const { t } = useI18n()
const auth = useAuthStore()
</script>

<template>
  <header class="public-marketing-nav">
    <div class="public-marketing-nav-inner">
      <RouterLink to="/" class="public-marketing-nav-brand">
        <img src="/abricot.png" :alt="t('landing.brandAlt')" class="public-marketing-nav-logo" />
      </RouterLink>

      <nav class="public-marketing-nav-left" aria-label="Principal">
        <RouterLink to="/" class="public-marketing-nav-link" active-class="public-marketing-nav-link--active">
          {{ t('nav.home') }}
        </RouterLink>
        <RouterLink to="/explore" class="public-marketing-nav-link" active-class="public-marketing-nav-link--active">
          {{ t('nav.explore') }}
        </RouterLink>
      </nav>

      <div class="public-marketing-nav-spacer" />

      <nav class="public-marketing-nav-right" aria-label="Cuenta">
        <template v-if="auth.isAuthenticated && auth.isOwner">
          <RouterLink to="/app/restaurants" class="public-marketing-nav-link public-marketing-nav-link--icon">
            <LayoutGrid :size="17" aria-hidden="true" />
            {{ t('landing.nav.goToPanel') }}
          </RouterLink>
        </template>
        <template v-else-if="auth.isAuthenticated && auth.isCustomer">
          <RouterLink to="/me/reservations" class="public-marketing-nav-link public-marketing-nav-link--icon">
            <Calendar :size="17" aria-hidden="true" />
            {{ t('nav.myReservations') }}
          </RouterLink>
          <RouterLink to="/me/orders" class="public-marketing-nav-link public-marketing-nav-link--icon">
            <ShoppingBag :size="17" aria-hidden="true" />
            {{ t('nav.myOrders') }}
          </RouterLink>
        </template>
        <template v-else>
          <RouterLink to="/login" class="public-marketing-nav-link">{{ t('landing.nav.login') }}</RouterLink>
          <RouterLink to="/register" class="public-marketing-nav-register">{{ t('landing.nav.registerFree') }}</RouterLink>
        </template>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.public-marketing-nav {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-navbar);
  backdrop-filter: blur(16px);
}

.public-marketing-nav-inner {
  display: flex;
  align-items: center;
  gap: 1rem;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0.75rem 1.5rem;
}

.public-marketing-nav-brand {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.public-marketing-nav-logo {
  height: 2rem;
  width: auto;
}

.public-marketing-nav-left,
.public-marketing-nav-right {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.public-marketing-nav-spacer {
  flex: 1;
  min-width: 0.5rem;
}

.public-marketing-nav-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 0.75rem;
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition:
    background var(--dur-fast) var(--ease-out),
    color var(--dur-fast) var(--ease-out);
}

.public-marketing-nav-link:hover {
  background: var(--bg-card);
  color: var(--text-primary);
}

.public-marketing-nav-link--active {
  color: var(--brand);
}

.public-marketing-nav-link--icon {
  color: var(--text-muted);
}

.public-marketing-nav-register {
  padding: 0.5rem 1rem;
  margin-left: 0.25rem;
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  text-decoration: none;
  background: var(--brand);
  border-radius: var(--radius-md);
  transition: background var(--dur-base) var(--ease-out);
}

.public-marketing-nav-register:hover {
  background: var(--brand-hover);
}
</style>
