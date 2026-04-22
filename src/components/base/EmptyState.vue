<script setup lang="ts">
import { computed } from 'vue'
import type { EmptyStateProps } from './scripts/EmptyState'

const props = defineProps<EmptyStateProps>()

const displayTitle = computed(() => props.title ?? props.message ?? '')
const displayDescription = computed(() => props.description ?? props.hint ?? '')
</script>

<template>
  <div class="empty-state">
    <div v-if="icon" class="empty-state-icon">
      <component :is="icon" :size="22" />
    </div>
    <h3 class="empty-state-title">{{ displayTitle }}</h3>
    <p v-if="displayDescription" class="empty-state-description">{{ displayDescription }}</p>
    <div v-if="$slots.action" class="empty-state-action">
      <slot name="action" />
    </div>
  </div>
</template>

<style src="./styles/EmptyState.css" scoped></style>
