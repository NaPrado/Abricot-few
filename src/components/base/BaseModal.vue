<script setup lang="ts">
defineProps<{
  wide?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <Teleport to="body">
    <div class="base-modal-backdrop" @click.self="emit('close')">
      <div :class="['base-modal', wide && 'base-modal--wide']">
        <button class="base-modal-close" @click="emit('close')">✕</button>
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<style src="./styles/BaseModal.css" scoped></style>
