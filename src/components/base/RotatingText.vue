<script setup lang="ts">
import { useRotatingText, type RotatingTextProps } from './scripts/RotatingText'

const props = withDefaults(defineProps<RotatingTextProps>(), { interval: 2600 })
const { current } = useRotatingText(props)
</script>

<template>
  <span class="rotating-text" :aria-live="'polite'">
    <Transition name="rotating-text" mode="out-in">
      <span :key="current" class="rotating-text-word">{{ current }}</span>
    </Transition>
  </span>
</template>

<style src="./styles/RotatingText.css" scoped></style>
