<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useSidebarNav } from './scripts/SidebarNav'

const { t, authStore, logout, Home, LogOut } = useSidebarNav()
</script>

<template>
  <nav class="sidebar-nav">
    <!-- Logo -->
    <div class="sidebar-nav-logo-wrapper">
      <RouterLink to="/" class="sidebar-nav-logo-link">
        <img src="/abricot.png" alt="Abricot" class="sidebar-nav-logo-image" />
        <span class="sidebar-nav-logo-text">Abricot</span>
      </RouterLink>
    </div>

    <!-- Nav links -->
    <ul class="sidebar-nav-links-list">
      <li>
        <RouterLink
          to="/app/restaurants"
          class="sidebar-nav-link"
          active-class="sidebar-nav-link--active"
        >
          <Home :size="16" />
          {{ t('nav.restaurants') }}
        </RouterLink>
      </li>
    </ul>

    <!-- User + logout -->
    <div class="sidebar-nav-footer">
      <div class="sidebar-nav-user-info">
        <p class="sidebar-nav-user-name">{{ authStore.user?.name }} {{ authStore.user?.surname }}</p>
        <p class="sidebar-nav-user-email">{{ authStore.user?.email }}</p>
      </div>
      <button class="sidebar-nav-logout-button" @click="logout">
        <LogOut :size="15" />
        {{ t('nav.logout') }}
      </button>
    </div>
  </nav>
</template>

<style src="./styles/SidebarNav.css" scoped></style>
