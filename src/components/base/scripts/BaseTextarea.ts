import { computed, useId, type ComputedRef } from 'vue'

export interface BaseTextareaProps {
  modelValue: string | null | undefined
  label?: string
  placeholder?: string
  rows?: number
  disabled?: boolean
  required?: boolean
  hint?: string
  error?: string
  id?: string
}

export type BaseTextareaEmit = (e: 'update:modelValue', value: string) => void

export function useBaseTextarea(
  props: BaseTextareaProps,
  emit: BaseTextareaEmit,
): {
  taId: ComputedRef<string>
  hasError: ComputedRef<boolean>
  onInput: (event: Event) => void
} {
  const autoId = useId()
  const taId = computed(() => props.id ?? `base-ta-${autoId}`)
  const hasError = computed(() => !!props.error)

  function onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement
    emit('update:modelValue', target.value)
  }

  return { taId, hasError, onInput }
}
