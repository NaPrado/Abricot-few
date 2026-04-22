import { CheckCircle2, Info, X, XCircle } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'

export function useToastContainer() {
  const { toasts, dismiss } = useToast()
  return { toasts, dismiss, CheckCircle2, Info, X, XCircle }
}
