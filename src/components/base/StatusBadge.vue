<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  useStatusBadgeClasses,
  toneForStatus,
  type StatusBadgeProps,
} from './scripts/StatusBadge'

const props = withDefaults(defineProps<StatusBadgeProps>(), {
  dot: true,
})

const { t } = useI18n()

const resolvedTone = computed(() => props.tone ?? toneForStatus(props.status))

const resolvedLabel = computed(() => {
  if (props.label) return props.label
  if (props.status && props.scope) return t(`${props.scope}.status.${props.status}`)
  return ''
})

const classes = useStatusBadgeClasses(resolvedTone)
</script>

<template>
  <span :class="classes">
    <span v-if="dot" class="status-badge-dot" aria-hidden="true" />
    {{ resolvedLabel }}
  </span>
</template>

<style src="./styles/StatusBadge.css" scoped></style>
