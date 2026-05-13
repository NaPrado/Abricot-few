<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useCustomSelect } from './scripts/CustomSelect'

const props = defineProps<{
  label: string
  options: string[]
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const { open, toggle, close, wrapperRef } = useCustomSelect()
const dropUp = ref(false)
const search = ref('')
const searchInputRef = ref<HTMLInputElement | null>(null)

const showSearch = computed(() => props.options.length > 6)

const filteredOptions = computed(() => {
  if (!search.value) return props.options
  const q = search.value.toLowerCase()
  return props.options.filter(o => o.toLowerCase().includes(q))
})

function updatePlacement() {
  const wrapper = wrapperRef.value
  if (!wrapper) return

  const rect = wrapper.getBoundingClientRect()
  const searchHeight = showSearch.value ? 44 : 0
  const optionHeight = 40
  const desiredHeight = Math.min(props.options.length * optionHeight + searchHeight, 260)
  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top

  dropUp.value = spaceBelow < desiredHeight && spaceAbove > spaceBelow
}

watch(open, async (isOpen) => {
  if (!isOpen) {
    search.value = ''
    return
  }
  await nextTick()
  updatePlacement()
  searchInputRef.value?.focus()
})

onMounted(() => {
  window.addEventListener('resize', updatePlacement)
  window.addEventListener('scroll', updatePlacement, true)
})

onUnmounted(() => {
  window.removeEventListener('resize', updatePlacement)
  window.removeEventListener('scroll', updatePlacement, true)
})

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
    <div
      v-if="open"
      :class="['custom-select-dropdown', dropUp && 'custom-select-dropdown--up']"
    >
      <div v-if="showSearch" class="custom-select-search-wrap">
        <input
          ref="searchInputRef"
          v-model="search"
          class="custom-select-search"
          type="text"
          placeholder="Buscar…"
          @keydown.stop
        />
      </div>
      <div
        v-for="(opt, i) in filteredOptions"
        :key="opt"
        :class="['custom-select-option', modelValue === opt && 'custom-select-option--active']"
        :style="{ animationDelay: `${i * 25}ms` }"
        @click="select(opt)"
      >
        {{ opt }}
      </div>
      <div v-if="filteredOptions.length === 0" class="custom-select-empty">
        Sin resultados
      </div>
    </div>
  </div>
</template>

<style src="./styles/CustomSelect.css" scoped></style>
