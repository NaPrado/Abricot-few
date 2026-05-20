<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useAppNavbar } from './scripts/AppNavbar'

const {
  menuOpen,
  isOwner,
  isAuthenticated,
  user,
  userInitial,
  userName,
  isActive,
  closeMenu,
  logout,
  goToSignup,
} = useAppNavbar()
</script>

<template>
  <nav class="app-navbar">
    <!-- Left: public links (hidden for owners) -->
    <div class="app-navbar-left">
      <div v-if="!isOwner" class="app-navbar-links">
        <RouterLink
          to="/"
          :class="['app-navbar-link', isActive('/') && !isActive('/explore') && 'app-navbar-link--active']"
        >Inicio</RouterLink>
        <RouterLink
          to="/explore"
          :class="['app-navbar-link', isActive('/explore') && 'app-navbar-link--active']"
        >Explorar</RouterLink>
      </div>
    </div>

    <!-- Center: logo -->
    <RouterLink to="/" class="app-navbar-logo">abricot</RouterLink>

    <!-- Right: auth controls -->
    <div class="app-navbar-right">
      <template v-if="isAuthenticated && user">
        <div class="app-navbar-avatar-wrap">
          <button class="app-navbar-avatar-btn" @click="menuOpen = !menuOpen">
            <div class="app-navbar-avatar">{{ userInitial }}</div>
            <span class="app-navbar-avatar-name">{{ userName }}</span>
            <span :class="['app-navbar-avatar-chevron', menuOpen && 'app-navbar-avatar-chevron--open']">▾</span>
          </button>

          <div v-if="menuOpen" class="app-navbar-dropdown">
            <div class="app-navbar-drop-header">
              <div class="app-navbar-drop-name">{{ userName }}</div>
              <div class="app-navbar-drop-email">{{ user.email }}</div>
            </div>
            <div class="app-navbar-drop-divider" />

            <!-- Owner items -->
            <template v-if="isOwner">
              <RouterLink to="/app/restaurants" class="app-navbar-drop-item" @click="closeMenu">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                Dashboard
              </RouterLink>
            </template>

            <!-- Customer items -->
            <template v-else>
              <RouterLink to="/me/reservations" class="app-navbar-drop-item" @click="closeMenu">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                Mis Reservas
              </RouterLink>
              <RouterLink to="/me/orders" class="app-navbar-drop-item" @click="closeMenu">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 01-8 0"/></svg>
                Mis Pedidos
              </RouterLink>
              <RouterLink to="/me/profile" class="app-navbar-drop-item" @click="closeMenu">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                Configuración
              </RouterLink>
            </template>

            <div class="app-navbar-drop-divider" />
            <button class="app-navbar-drop-item app-navbar-drop-item--danger" @click="logout">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
              Cerrar sesión
            </button>
          </div>
        </div>
      </template>

      <template v-else>
        <RouterLink to="/login" class="app-navbar-login">Ingresar</RouterLink>
        <button type="button" class="app-navbar-register" @click="goToSignup">Registrarse</button>
      </template>
    </div>
  </nav>
</template>

<style src="./styles/AppNavbar.css" scoped></style>
