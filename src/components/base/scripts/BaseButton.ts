import { computed, type ComputedRef } from 'vue'

export interface BaseButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  loading?: boolean
  disabled?: boolean
  block?: boolean
}

export function useBaseButtonClasses(props: BaseButtonProps): ComputedRef<string[]> {
  return computed(() =>
    [
      'base-button',
      `base-button--${props.variant}`,
      `base-button--${props.size}`,
      props.block ? 'base-button--block' : '',
      props.loading ? 'base-button--loading' : '',
    ].filter((c) => c !== ''),
  )
}
