<script setup lang="ts">
defineProps<{
  brand?: boolean
  size?: 'sm' | 'md' | 'lg'
}>()
</script>

<template>
  <span :class="['base-spinner', brand && 'base-spinner--brand', size && size !== 'md' && `base-spinner--${size}`]" />
</template>

<style src="./styles/BaseSpinner.css" scoped></style>
