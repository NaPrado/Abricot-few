<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useAppLayout } from './scripts/AppLayout'

const {
  isOwner,
  userInitial,
  userName,
  ownerNavItems,
  isNavActive,
  logout,
} = useAppLayout()
</script>

<template>
  <!-- Owner: sidebar + main -->
  <div v-if="isOwner" class="app-layout-owner">
    <aside class="app-layout-sidebar">
      <div class="app-layout-sidebar-top">
        <div class="app-layout-sidebar-logo">abricot</div>
        <div class="app-layout-owner-card">
          <div class="app-layout-owner-avatar">{{ userInitial }}</div>
          <div>
            <div class="app-layout-owner-name">{{ userName }}</div>
            <div class="app-layout-owner-role">Propietario</div>
          </div>
        </div>
      </div>

      <div class="app-layout-sidebar-section">MENÚ</div>

      <nav class="app-layout-sidebar-nav">
        <RouterLink
          v-for="item in ownerNavItems"
          :key="item.key"
          :to="item.to"
          :class="['app-layout-nav-item', isNavActive(item.to) && 'app-layout-nav-item--active']"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            :stroke="isNavActive(item.to) ? '#f97316' : '#333'"
            stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path :d="item.icon" />
            <path v-if="item.icon2" :d="item.icon2" />
          </svg>
          <span>{{ item.label }}</span>
          <div v-if="isNavActive(item.to)" class="app-layout-nav-dot" />
        </RouterLink>
      </nav>

      <div class="app-layout-sidebar-bottom">
        <div class="app-layout-sidebar-section">CUENTA</div>
        <button class="app-layout-nav-item" @click="logout">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>

    <main class="app-layout-main">
      <RouterView />
    </main>
  </div>

  <!-- Customer: just pass through (AppNavbar is global) -->
  <div v-else class="app-layout-customer">
    <RouterView />
  </div>
</template>

<style src="./styles/AppLayout.css" scoped></style>
