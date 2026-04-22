import { computed, useId, type ComputedRef } from 'vue'

export interface BaseInputProps {
  modelValue: string | number | null | undefined
  label?: string
  placeholder?: string
  type?: string
  hint?: string
  error?: string
  disabled?: boolean
  required?: boolean
  autocomplete?: string
  id?: string
}

export type BaseInputEmit = (e: 'update:modelValue', value: string) => void

export function useBaseInput(
  props: BaseInputProps,
  emit: BaseInputEmit,
): {
  inputId: ComputedRef<string>
  hasError: ComputedRef<boolean>
  onInput: (event: Event) => void
} {
  const autoId = useId()
  const inputId = computed(() => props.id ?? `base-input-${autoId}`)
  const hasError = computed(() => !!props.error)

  function onInput(event: Event): void {
    const target = event.target as HTMLInputElement
    emit('update:modelValue', target.value)
  }

  return { inputId, hasError, onInput }
}
