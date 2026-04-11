<script setup lang="ts">
import SidebarNav from './SidebarNav.vue'
import ToastContainer from './ToastContainer.vue'
</script>

<template>
  <div class="app-layout-wrapper">
    <SidebarNav />
    <main class="app-layout-main-content">
      <RouterView />
    </main>
    <ToastContainer />
  </div>
</template>

<style src="./styles/AppLayout.css" scoped></style>
