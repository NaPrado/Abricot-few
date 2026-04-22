<script setup lang="ts">
import { useBaseButtonClasses, type BaseButtonProps } from './scripts/BaseButton'

const props = withDefaults(defineProps<BaseButtonProps>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  loading: false,
  disabled: false,
  block: false,
})

const classes = useBaseButtonClasses(props)
</script>

<template>
  <button
    :class="classes"
    :type="type"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="base-button-spinner" aria-hidden="true" />
    <slot />
  </button>
</template>

<style src="./styles/BaseButton.css" scoped></style>
