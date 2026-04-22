<script setup lang="ts">
import { useToastContainer } from './scripts/ToastContainer'

const { toasts, dismiss, CheckCircle2, Info, X, XCircle } = useToastContainer()
</script>

<template>
  <Teleport to="body">
    <div class="toast-container" role="region" aria-live="polite">
      <TransitionGroup name="toast" tag="div" class="toast-stack">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="toast-item"
          :class="`toast-item--${t.type}`"
          role="status"
        >
          <CheckCircle2 v-if="t.type === 'success'" :size="16" class="toast-icon" />
          <XCircle v-else-if="t.type === 'error'" :size="16" class="toast-icon" />
          <Info v-else :size="16" class="toast-icon" />
          <span class="toast-message">{{ t.message }}</span>
          <button type="button" class="toast-close" :aria-label="'Cerrar'" @click="dismiss(t.id)">
            <X :size="14" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style src="./styles/ToastContainer.css" scoped></style>
