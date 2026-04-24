<script setup lang="ts">
type Variant = 'primary' | 'brand' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

withDefaults(defineProps<{
  variant?: Variant
  size?: Size
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
}>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="['base-button', `base-button--${variant}`, size !== 'md' && `base-button--${size}`]"
  >
    <slot v-if="!loading" />
    <span v-else>…</span>
  </button>
</template>

<style src="./styles/BaseButton.css" scoped></style>
