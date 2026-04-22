import { computed, useId, type ComputedRef } from 'vue'
import { ChevronDown } from 'lucide-vue-next'

export interface BaseSelectOption {
  value: string | number
  label: string
}

export interface BaseSelectProps {
  modelValue: string | number | null | undefined
  options: BaseSelectOption[]
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  id?: string
}

export type BaseSelectEmit = (e: 'update:modelValue', value: string) => void

export function useBaseSelect(
  props: BaseSelectProps,
  emit: BaseSelectEmit,
): {
  selectId: ComputedRef<string>
  onChange: (event: Event) => void
  ChevronDown: typeof ChevronDown
} {
  const autoId = useId()
  const selectId = computed(() => props.id ?? `base-select-${autoId}`)

  function onChange(event: Event): void {
    const target = event.target as HTMLSelectElement
    emit('update:modelValue', target.value)
  }

  return { selectId, onChange, ChevronDown }
}
