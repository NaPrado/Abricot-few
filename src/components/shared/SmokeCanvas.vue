<script setup lang="ts">
import { useSmokeCanvas } from './scripts/SmokeCanvas'

const { canvasRef } = useSmokeCanvas()
</script>

<template>
  <canvas ref="canvasRef" class="smoke-canvas" />
</template>

<style scoped>
.smoke-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
</style>
