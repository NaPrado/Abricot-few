import { computed, onBeforeUnmount, onMounted, ref, type ComputedRef } from 'vue'

export interface RotatingTextProps {
  phrases: string[]
  interval?: number
}

export function useRotatingText(props: RotatingTextProps): { current: ComputedRef<string> } {
  const index = ref(0)
  const current = computed(() => props.phrases[index.value] ?? '')

  let timer: number | null = null

  onMounted(() => {
    if (props.phrases.length <= 1) return
    timer = window.setInterval(() => {
      index.value = (index.value + 1) % props.phrases.length
    }, props.interval ?? 2600)
  })

  onBeforeUnmount(() => {
    if (timer !== null) window.clearInterval(timer)
  })

  return { current }
}
