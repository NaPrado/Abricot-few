<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
}>()
</script>

<template>
  <button
    :type="type ?? 'button'"
    :disabled="disabled || loading"
    :class="[
      'base-button',
      variant === 'danger'      ? 'base-button--danger'
      : variant === 'secondary' ? 'base-button--secondary'
      : variant === 'ghost'     ? 'base-button--ghost'
      : 'base-button--primary',
    ]"
  >
    <slot />
  </button>
</template>

<style src="./styles/BaseButton.css" scoped></style>
