<script setup lang="ts">
import { useBaseInput, type BaseInputProps } from './scripts/BaseInput'

const props = withDefaults(defineProps<BaseInputProps>(), {
  type: 'text',
  disabled: false,
  required: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const { inputId, hasError, onInput } = useBaseInput(props, emit)
</script>

<template>
  <label class="base-input-field" :for="inputId">
    <span v-if="label" class="base-input-label">
      {{ label }}<span v-if="required" class="base-input-required">*</span>
    </span>
    <input
      :id="inputId"
      :type="type"
      :value="modelValue ?? ''"
      :placeholder="placeholder"
      :disabled="disabled"
      :autocomplete="autocomplete"
      class="base-input-control"
      :class="{ 'base-input-control--error': hasError }"
      @input="onInput"
    />
    <span v-if="error" class="base-input-error">{{ error }}</span>
    <span v-else-if="hint" class="base-input-hint">{{ hint }}</span>
  </label>
</template>

<style src="./styles/BaseInput.css" scoped></style>
