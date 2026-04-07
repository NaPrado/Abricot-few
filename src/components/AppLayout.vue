<script setup lang="ts">
import SidebarNav from './SidebarNav.vue'
</script>

<template>
  <div class="flex h-screen w-full">
    <SidebarNav />
    <main class="flex-1 overflow-y-auto bg-gray-50 p-8">
      <RouterView />
    </main>
  </div>
</template>
