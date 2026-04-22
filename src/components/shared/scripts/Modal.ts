import { onBeforeUnmount, onMounted, watch } from 'vue'

export interface ModalProps {
  open: boolean
  title: string
  size?: 'sm' | 'md' | 'lg'
}

export type ModalEmit = (e: 'close') => void

export function useModal(props: ModalProps, emit: ModalEmit): void {
  function onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && props.open) emit('close')
  }

  onMounted(() => window.addEventListener('keydown', onKeyDown))
  onBeforeUnmount(() => window.removeEventListener('keydown', onKeyDown))

  watch(
    () => props.open,
    (v) => {
      document.body.style.overflow = v ? 'hidden' : ''
    },
  )
}
