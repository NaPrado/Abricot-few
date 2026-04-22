<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { useModal, type ModalProps } from './scripts/Modal'

defineOptions({ name: 'SharedModalDialog' })

const props = withDefaults(defineProps<ModalProps>(), { size: 'md' })
const emit = defineEmits<{ (e: 'close'): void }>()

useModal(props, emit)
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="modal-overlay" @click.self="emit('close')">
        <div class="modal-dialog" :class="`modal-dialog--${size}`" role="dialog" aria-modal="true">
          <header class="modal-header">
            <h2 class="modal-title">{{ title }}</h2>
            <button type="button" class="modal-close" aria-label="Cerrar" @click="emit('close')">
              <X :size="16" />
            </button>
          </header>
          <div class="modal-body">
            <slot />
          </div>
          <footer v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style src="./styles/Modal.css" scoped></style>
