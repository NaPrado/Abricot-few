<script setup lang="ts">
import { useToast } from "@/composables/useToast"

const { toasts, dismiss } = useToast()

const icons: Record<string, string> = {
  error: "✕",
  success: "✓",
  info: "ℹ",
}

const styles: Record<string, string> = {
  error: "bg-red-900/90 border-red-700 text-red-100",
  success: "bg-green-900/90 border-green-700 text-green-100",
  info: "bg-gray-800/90 border-gray-700 text-gray-100",
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-sm text-sm font-medium pointer-events-auto max-w-sm"
          :class="styles[toast.type]"
        >
          <span class="shrink-0 font-bold">{{ icons[toast.type] }}</span>
          <span class="flex-1">{{ toast.message }}</span>
          <button
            @click="dismiss(toast.id)"
            class="shrink-0 opacity-60 hover:opacity-100 transition-opacity ml-1"
          >
            ✕
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(1rem);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(1rem);
}
</style>
