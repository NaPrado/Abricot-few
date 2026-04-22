<script setup lang="ts">
import { useBaseTextarea, type BaseTextareaProps } from './scripts/BaseTextarea'

const props = withDefaults(defineProps<BaseTextareaProps>(), {
  rows: 3,
  disabled: false,
  required: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const { taId, hasError, onInput } = useBaseTextarea(props, emit)
</script>

<template>
  <label class="base-ta-field" :for="taId">
    <span v-if="label" class="base-ta-label">
      {{ label }}<span v-if="required" class="base-ta-required">*</span>
    </span>
    <textarea
      :id="taId"
      :value="modelValue ?? ''"
      :rows="rows"
      :placeholder="placeholder"
      :disabled="disabled"
      class="base-ta-control"
      :class="{ 'base-ta-control--error': hasError }"
      @input="onInput"
    />
    <span v-if="error" class="base-ta-error">{{ error }}</span>
    <span v-else-if="hint" class="base-ta-hint">{{ hint }}</span>
  </label>
</template>

<style src="./styles/BaseTextarea.css" scoped></style>
