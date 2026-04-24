import { ref, onMounted, onUnmounted } from 'vue'

export function useCustomSelect(onClose?: () => void) {
  const open = ref(false)
  const wrapperRef = ref<HTMLElement | null>(null)

  function close() {
    open.value = false
    onClose?.()
  }

  function toggle() {
    open.value = !open.value
  }

  function onOutsideClick(e: MouseEvent) {
    if (wrapperRef.value && !wrapperRef.value.contains(e.target as Node)) {
      close()
    }
  }

  onMounted(() => {
    document.addEventListener('mousedown', onOutsideClick)
  })

  onUnmounted(() => {
    document.removeEventListener('mousedown', onOutsideClick)
  })

  return { open, toggle, close, wrapperRef }
}
