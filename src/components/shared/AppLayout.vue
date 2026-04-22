<script setup lang="ts">
import { useAppLayout } from './scripts/AppLayout'

const {
  RouterLink,
  RouterView,
  LogOut,
  UserIcon,
  RestaurantSwitcher,
  auth,
  variant,
  links,
  onLogout,
} = useAppLayout()
</script>

<template>
  <div class="app-layout">
    <aside class="app-sidebar">
      <RouterLink to="/" class="app-sidebar-brand">
        <img src="/abricot.png" alt="Abricot" class="app-sidebar-logo" />
      </RouterLink>

      <div v-if="variant === 'owner'" class="app-sidebar-switcher">
        <RestaurantSwitcher />
      </div>

      <nav class="app-sidebar-nav">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="app-sidebar-link"
          active-class="app-sidebar-link--active"
        >
          <component :is="link.icon" :size="16" class="app-sidebar-link-icon" />
          <span>{{ link.label }}</span>
        </RouterLink>
      </nav>

      <div class="app-sidebar-footer">
        <div class="app-sidebar-user">
          <div class="app-sidebar-user-avatar">
            <UserIcon :size="14" />
          </div>
          <div class="app-sidebar-user-info">
            <span class="app-sidebar-user-name">{{ auth.user?.name ?? 'Invitado' }}</span>
            <span class="app-sidebar-user-email">{{ auth.user?.email ?? '' }}</span>
          </div>
        </div>
        <button type="button" class="app-sidebar-logout" @click="onLogout">
          <LogOut :size="14" />
          Salir
        </button>
      </div>
    </aside>

    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

<style src="./styles/AppLayout.css" scoped></style>
