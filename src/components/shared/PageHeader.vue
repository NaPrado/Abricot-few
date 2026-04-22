<script setup lang="ts">
import type { PageHeaderProps } from './scripts/PageHeader'

defineProps<PageHeaderProps>()
</script>

<template>
  <header class="page-header">
    <div class="page-header-text">
      <span v-if="eyebrow" class="page-header-eyebrow">{{ eyebrow }}</span>
      <h1 class="page-header-title">{{ title }}</h1>
      <p v-if="description" class="page-header-description">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="page-header-actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<style src="./styles/PageHeader.css" scoped></style>
