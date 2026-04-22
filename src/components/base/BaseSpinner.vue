<script setup lang="ts">
import type { BaseSpinnerProps } from './scripts/BaseSpinner'

withDefaults(defineProps<BaseSpinnerProps>(), { size: 20 })
</script>

<template>
  <div class="base-spinner-wrapper" role="status">
    <span
      class="base-spinner"
      :style="{ width: `${size}px`, height: `${size}px` }"
      aria-hidden="true"
    />
    <span v-if="label" class="base-spinner-label">{{ label }}</span>
    <span class="sr-only">Cargando</span>
  </div>
</template>

<style src="./styles/BaseSpinner.css" scoped></style>
