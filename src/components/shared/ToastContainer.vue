<script setup lang="ts">
import { useToast } from '@/composables'

const { toasts, dismiss } = useToast()
</script>

<template>
  <div class="toast-container">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      :class="['toast-item', `toast-item--${toast.type}`]"
      @click="dismiss(toast.id)"
    >
      {{ toast.message }}
    </div>
  </div>
</template>

<style src="./styles/ToastContainer.css" scoped></style>
