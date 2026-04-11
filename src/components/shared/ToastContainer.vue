<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import { CheckCircle, XCircle, Info, X } from 'lucide-vue-next'

const { toasts, dismiss } = useToast()

const iconMap: Record<string, typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
}

const typeClass: Record<string, string> = {
  error: 'toast-item--error',
  success: 'toast-item--success',
  info: 'toast-item--info',
}
</script>

<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast-item', typeClass[toast.type]]"
        >
          <span class="toast-item-icon">
            <component :is="iconMap[toast.type]" :size="16" />
          </span>
          <span class="toast-item-message">{{ toast.message }}</span>
          <button class="toast-item-dismiss-button" @click="dismiss(toast.id)">
            <X :size="14" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style src="./styles/ToastContainer.css" scoped></style>
