<script setup lang="ts">
import { useCustomSelect } from './scripts/CustomSelect'

defineProps<{
  label: string
  options: string[]
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const { open, toggle, close, wrapperRef } = useCustomSelect()

function select(opt: string) {
  emit('update:modelValue', opt)
  close()
}
</script>

<template>
  <div ref="wrapperRef" class="custom-select">
    <div class="custom-select-trigger" @click="toggle">
      <div class="custom-select-label">{{ label }}</div>
      <div class="custom-select-value">
        {{ modelValue }}
        <span :class="['custom-select-arrow', open && 'custom-select-arrow--open']">▾</span>
      </div>
    </div>
    <div v-if="open" class="custom-select-dropdown">
      <div
        v-for="(opt, i) in options"
        :key="opt"
        :class="['custom-select-option', modelValue === opt && 'custom-select-option--active']"
        :style="{ animationDelay: `${i * 35}ms` }"
        @click="select(opt)"
      >
        {{ opt }}
      </div>
    </div>
  </div>
</template>

<style src="./styles/CustomSelect.css" scoped></style>
