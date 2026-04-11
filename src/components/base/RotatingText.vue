<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = withDefaults(defineProps<{
  phrases: string[]
  interval?: number
}>(), { interval: 2600 })

const current = ref(0)
let timer: ReturnType<typeof setInterval>

onMounted(() => {
  timer = setInterval(() => {
    current.value = (current.value + 1) % props.phrases.length
  }, props.interval)
})

onUnmounted(() => clearInterval(timer))
</script>

<template>
  <span class="rotating-text">
    <Transition name="rotating-text" mode="out-in">
      <span :key="current" class="rotating-text-phrase">{{ phrases[current] }}</span>
    </Transition>
  </span>
</template>

<style src="./styles/RotatingText.css" scoped></style>
