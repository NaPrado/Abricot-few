<script setup lang="ts">
import type { PageContainerProps } from './scripts/PageContainer'

defineProps<PageContainerProps>()
</script>

<template>
  <div class="page-container" :class="{ 'page-container--narrow': narrow }">
    <slot />
  </div>
</template>

<style src="./styles/PageContainer.css" scoped></style>
