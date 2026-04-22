<script setup lang="ts">
import { useBaseSelect, type BaseSelectProps } from './scripts/BaseSelect'

const props = withDefaults(defineProps<BaseSelectProps>(), {
  disabled: false,
  required: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const { selectId, onChange, ChevronDown } = useBaseSelect(props, emit)
</script>

<template>
  <label class="base-select-field" :for="selectId">
    <span v-if="label" class="base-select-label">
      {{ label }}<span v-if="required" class="base-select-required">*</span>
    </span>
    <div class="base-select-wrapper">
      <select
        :id="selectId"
        :value="modelValue ?? ''"
        :disabled="disabled"
        class="base-select-control"
        @change="onChange"
      >
        <option v-if="placeholder" value="">{{ placeholder }}</option>
        <option v-for="opt in options" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
      <ChevronDown :size="14" class="base-select-chevron" />
    </div>
  </label>
</template>

<style src="./styles/BaseSelect.css" scoped></style>
